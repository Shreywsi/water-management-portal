import os
import json
import joblib
import numpy as np
import pandas as pd

from pathlib import Path

# Bootstrap Django so this file can run standalone (python -m ml.predict),
# not only when imported from inside a running Django view/process.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
import django
django.setup()

from tensorflow.keras.models import load_model
from groundwater.models import WaterBalance, WaterLevel, Parameter, MLModelState

BASE_DIR = Path(__file__).resolve().parent
_MODEL_CACHE = {}


class StaleModelError(Exception):
    """Raised when a trained model's config no longer matches the
    current Parameter registry (e.g. parameters were added/removed
    since this model was trained). Callers should catch this and
    tell the user to retrain, rather than let a KeyError/shape
    mismatch surface from deep inside pandas or Keras."""
    pass


def _check_not_stale(location_id, config):
    """Raises StaleModelError unless we can positively confirm this
    location's model matches the current Parameter registry. Missing
    tracking data (no MLModelState row, or a config predating the
    parameter_signature field) is treated as unverifiable -> stale,
    not as "assume it's fine". This runs on every prediction call
    (not just on cache load) so a parameter change made after a
    model was cached in memory is still caught immediately."""
    from ml.train import _parameter_signature

    model_state = MLModelState.objects.filter(location_id=location_id).first()

    if model_state is None:
        raise StaleModelError(
            f"No training record found for location {location_id}. Please retrain."
        )

    if model_state.needs_retrain:
        raise StaleModelError(
            f"Model for location {location_id} is out of date "
            f"(parameters changed since last training). Please retrain."
        )

    trained_signature = config.get("parameter_signature")
    if not trained_signature:
        raise StaleModelError(
            f"Model for location {location_id} predates parameter tracking. Please retrain."
        )

    if trained_signature != _parameter_signature(config.get("parameter_keys", [])):
        raise StaleModelError(
            f"Model config for location {location_id} appears corrupted. Please retrain."
        )


def _load_cached_artifacts(location_id, model_path, scaler_path, config_path):
    current_mtime = model_path.stat().st_mtime
    cached = _MODEL_CACHE.get(location_id)

    if cached is not None and cached["mtime"] == current_mtime:
        return cached["model"], cached["scaler"], cached["config"]

    model = load_model(model_path)
    scaler = joblib.load(scaler_path)
    with open(config_path) as f:
        config = json.load(f)

    _MODEL_CACHE[location_id] = {
        "model": model,
        "scaler": scaler,
        "config": config,
        "mtime": current_mtime,
    }
    return model, scaler, config


def predict_water_balance(location_id, steps=1):
    SAVE_DIR = BASE_DIR / "saved_models" / f"location_{location_id}"

    MODEL_PATH = SAVE_DIR / "water_balance_model.keras"
    SCALER_PATH = SAVE_DIR / "water_balance_scaler.pkl"
    CONFIG_PATH = SAVE_DIR / "model_config.json"

    if not SAVE_DIR.exists():
        raise Exception(f"No trained model exists for Location {location_id}.")
    if not MODEL_PATH.exists():
        raise Exception(f"Model missing for Location {location_id}.")
    if not SCALER_PATH.exists():
        raise Exception("Scaler has not been created yet.")
    if not CONFIG_PATH.exists():
        raise Exception("model_config.json not found.")

    model, scaler, config = _load_cached_artifacts(
        location_id, MODEL_PATH, SCALER_PATH, CONFIG_PATH
    )

    # Checked on every call (cache hit or miss) so a parameter change
    # made after this model was cached in memory is still caught.
    _check_not_stale(location_id, config)

    features = config["features"]
    sequence_length = config["sequence_length"]
    target_index = config["target_index"]

    # Use exactly the parameter set this MODEL was trained on - not
    # whatever parameters are active right now. If new parameters
    # were added since training, this model is stale
    # (MLModelState.needs_retrain will be True); _check_not_stale
    # above already guards against that before we get here.
    parameter_keys = config.get("parameter_keys", [])

    records = (
        WaterBalance.objects
        .filter(location_id=location_id)
        .order_by("entry_date", "created_at")
    )
    if not records.exists():
        raise Exception("No water balance data found for this location.")

    rows = []
    for r in records:
        latest_level = (
            WaterLevel.objects
            .filter(location_id=location_id, date__lte=r.entry_date)
            .order_by("-date")
            .first()
        )
        groundwater_depth = latest_level.level if latest_level else 0

        record_values = r.values or {}

        row = {
            "groundwater_depth": groundwater_depth,
            "water_balance": r.delta_s,
            "month": r.entry_date.month,
        }
        for key in parameter_keys:
            present = key in record_values
            row[key] = float(record_values[key]) if present else 0.0
            row[f"{key}__present"] = 1 if present else 0

        rows.append(row)

    df = pd.DataFrame(rows)
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

    if len(df) < sequence_length:
        raise Exception(f"Need at least {sequence_length} records for prediction.")

    data = df[features].values
    scaled = scaler.transform(data)

    sequence = scaled[-sequence_length:].copy()

    predictions = []

    for _ in range(steps):
        X = np.array([sequence])
        # model(X, training=False) is equivalent to model.predict(X) for
        # inference, but skips the tf.data pipeline overhead that
        # .predict() adds on every call - much faster for single-sequence
        # predictions like this.
        prediction_scaled = model(X, training=False).numpy()[0][0]

        next_row = sequence[-1].copy()
        next_row[target_index] = prediction_scaled

        prediction_value = scaler.inverse_transform([next_row])[0][target_index]
        predictions.append(round(float(prediction_value), 2))

        sequence = np.vstack([sequence[1:], next_row])

    return predictions


if __name__ == "__main__":
    print(predict_water_balance(7))