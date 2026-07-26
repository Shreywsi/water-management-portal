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
from groundwater.models import WaterBalance, WaterLevel

BASE_DIR = Path(__file__).resolve().parent


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

    model = load_model(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    with open(CONFIG_PATH) as f:
        config = json.load(f)

    features = config["features"]
    sequence_length = config["sequence_length"]
    target_index = config["target_index"]

    # Use exactly the parameter set this MODEL was trained on - not
    # whatever parameters are active right now. If new parameters
    # were added since training, this model is stale
    # (MLModelState.needs_retrain will be True); the caller is
    # responsible for checking that before relying on this
    # prediction, since predicting with a mismatched feature set
    # would silently give the wrong answer, not fail loudly.
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
        prediction_scaled = model.predict(X, verbose=0)[0][0]

        next_row = sequence[-1].copy()
        next_row[target_index] = prediction_scaled

        prediction_value = scaler.inverse_transform([next_row])[0][target_index]
        predictions.append(round(float(prediction_value), 2))

        sequence = np.vstack([sequence[1:], next_row])

    return predictions


if __name__ == "__main__":
    print(predict_water_balance(7))