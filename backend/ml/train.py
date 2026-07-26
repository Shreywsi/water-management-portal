import os
import hashlib
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
import django
from django.conf import settings
import sys
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from groundwater.models import WaterBalance, WaterLevel, Parameter, MLModelState

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import EarlyStopping


def _parameter_signature(parameter_keys):
    return hashlib.sha256(",".join(sorted(parameter_keys)).encode()).hexdigest()[:16]


def load_location_dataset(location_id):
    """
    Builds the training dataframe directly from the database, ordered
    by entry_date (the period the data represents), not created_at
    (when it was saved) - these can differ for backdated entries.

    Feature set is built dynamically from the Parameter registry:
    every parameter ever used gets a value column + a
    '<key>__present' mask column. groundwater_depth is joined from
    WaterLevel at entry_date (previously hardcoded to 0 - fixed here).
    """
    all_parameters = list(Parameter.objects.all().order_by("category", "order", "id"))
    parameter_keys = [p.key for p in all_parameters]

    records = (
        WaterBalance.objects
        .filter(location_id=location_id)
        .order_by("entry_date", "created_at")
    )

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

    if len(df) == 0:
        raise Exception("No data found for this location.")

    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

    return df, parameter_keys


def train_model(location_id):
    print("========== TRAINING STARTED ==========")
    print(f"Sequence Length: {settings.SEQUENCE_LENGTH}")
    BASE_DIR = Path(__file__).resolve().parent

    SAVE_DIR = BASE_DIR / "saved_models" / f"location_{location_id}"
    print("=" * 60)
    print("TRAIN SAVE_DIR:", SAVE_DIR)
    print("=" * 60)

    SAVE_DIR.mkdir(parents=True, exist_ok=True)
    print("Directory exists:", SAVE_DIR.exists())

    # ---------------------------------------------------
    # Load & preprocess dataset
    # ---------------------------------------------------
    df, parameter_keys = load_location_dataset(location_id)

    dataset_path = SAVE_DIR / "training_data.csv"
    df.to_csv(dataset_path, index=False)
    print(f"Training dataset saved to: {dataset_path}")

    if len(df) < 8:
        raise Exception(
            f"Location {location_id} has only {len(df)} records. Need at least 8."
        )

    # Dynamic feature list: groundwater_depth, then every parameter's
    # value + presence-mask column, then the target, then seasonality.
    features = ["groundwater_depth"]
    for key in parameter_keys:
        features.append(key)
        features.append(f"{key}__present")
    features.append("water_balance")
    features.append("month_sin")
    features.append("month_cos")

    data = df[features].values

    # ---------------------------------------------------
    # Scale
    # ---------------------------------------------------
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(data)

    # ---------------------------------------------------
    # Sequence settings
    # ---------------------------------------------------
    SEQUENCE_LENGTH = settings.SEQUENCE_LENGTH

    training_config = {
        "sequence_length": SEQUENCE_LENGTH,
        "features": features,
        "target": "water_balance",
        "target_index": features.index("water_balance"),
        "parameter_keys": parameter_keys,
        "parameter_signature": _parameter_signature(parameter_keys),
    }

    with open(SAVE_DIR / "model_config.json", "w") as f:
        json.dump(training_config, f, indent=4)

    # ---------------------------------------------------
    # Create sequences
    # ---------------------------------------------------
    X, y = [], []

    for i in range(SEQUENCE_LENGTH, len(scaled_data)):
        X.append(scaled_data[i - SEQUENCE_LENGTH:i])
        y.append(scaled_data[i, training_config["target_index"]])

    X = np.array(X)
    y = np.array(y)

    # ---------------------------------------------------
    # Train/Test Split
    # ---------------------------------------------------
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, shuffle=False
    )

    print(f"Training samples : {len(X_train)}")
    print(f"Testing samples  : {len(X_test)}")

    # ---------------------------------------------------
    # Build Model
    # ---------------------------------------------------
    model = Sequential()
    model.add(LSTM(64, input_shape=X_train.shape[1:]))
    model.add(Dense(32, activation="relu"))
    model.add(Dense(1))
    model.compile(optimizer="adam", loss="mse")
    model.summary()

    # ---------------------------------------------------
    # Train
    # ---------------------------------------------------
    early_stop = EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True)

    history = model.fit(
        X_train,
        y_train,
        validation_data=(X_test, y_test),
        epochs=100,
        batch_size=8,
        callbacks=[early_stop],
        verbose=1
    )

    pd.DataFrame(history.history).to_csv(
        os.path.join(SAVE_DIR, "training_history.csv"), index=False
    )

    # ---------------------------------------------------
    # Evaluate
    # ---------------------------------------------------
    predictions = model.predict(X_test, verbose=0)

    dummy_pred = np.zeros((len(predictions), len(features)))
    dummy_true = np.zeros((len(y_test), len(features)))

    target_index = training_config["target_index"]
    dummy_pred[:, target_index] = predictions.flatten()
    dummy_true[:, target_index] = y_test

    pred_original = scaler.inverse_transform(dummy_pred)
    true_original = scaler.inverse_transform(dummy_true)

    pred_water_balance = pred_original[:, target_index]
    true_water_balance = true_original[:, target_index]

    rmse = float(np.sqrt(mean_squared_error(true_water_balance, pred_water_balance)))
    mae = float(mean_absolute_error(true_water_balance, pred_water_balance))

    if len(y_test) < 2:
        r2 = None
    else:
        r2_value = r2_score(true_water_balance, pred_water_balance)
        r2 = None if np.isnan(r2_value) else float(r2_value)

    metrics = {
        "rmse": rmse,
        "mae": mae,
        "r2": r2,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
    }

    # ---------------------------------------------------
    # Save model
    # ---------------------------------------------------
    model.save(os.path.join(SAVE_DIR, "water_balance_model.keras"))
    joblib.dump(scaler, os.path.join(SAVE_DIR, "water_balance_scaler.pkl"))

    with open(os.path.join(SAVE_DIR, "model_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=4)

    # ---------------------------------------------------
    # Clear the "needs retrain" flag now that this model
    # matches the current parameter set.
    # ---------------------------------------------------
    from django.utils import timezone
    MLModelState.objects.update_or_create(
        location_id=location_id,
        defaults={
            "needs_retrain": False,
            "last_retrained_at": timezone.now(),
            "active_parameter_signature": training_config["parameter_signature"],
        },
    )

    print("\nTraining Complete")
    print(f"✅ Model for Location {location_id} saved successfully!")
    print(json.dumps(metrics, indent=4))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage:")
        print("python -m ml.train <location_id>")
        sys.exit(1)

    train_model(int(sys.argv[1]))