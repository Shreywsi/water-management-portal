import json
import joblib
import numpy as np
import pandas as pd

from pathlib import Path
from tensorflow.keras.models import load_model

from groundwater.models import WaterBalance

BASE_DIR = Path(__file__).resolve().parent




def predict_water_balance(location_id, steps=1):
    SAVE_DIR = BASE_DIR / "saved_models" / f"location_{location_id}"

    MODEL_PATH = SAVE_DIR / "water_balance_model.keras"
    SCALER_PATH = SAVE_DIR / "water_balance_scaler.pkl"
    CONFIG_PATH = SAVE_DIR / "model_config.json"

    if not SAVE_DIR.exists():
        raise Exception(
            f"No trained model exists for Location {location_id}."
        )

    if not MODEL_PATH.exists():
        raise Exception(
            f"Model missing for Location {location_id}."
        )

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

    # If a location is supplied, use only that location's data
    

    rows = []

    records = (
        WaterBalance.objects
        .filter(location_id=location_id)
        .order_by("created_at")
    )
    if not records.exists():
        raise Exception("No water balance data found for this location.")
    for r in records:
        rows.append({
            "rainfall_mm": r.Rr,
            "groundwater_depth": 0,
            "water_balance": r.delta_s,
            "month": r.created_at.month,
        })

    df = pd.DataFrame(rows)

    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

    if len(df) < sequence_length:
        raise Exception(
            f"Need at least {sequence_length} records for prediction."
        )

    data = df[features].values
    scaled = scaler.transform(data)

    sequence = scaled[-sequence_length:].copy()

    predictions = []

    for _ in range(steps):

        X = np.array([sequence])

        prediction_scaled = model.predict(
            X,
            verbose=0
        )[0][0]


        next_row = sequence[-1].copy()

        next_row[target_index] = prediction_scaled


        prediction_value = scaler.inverse_transform(
            [next_row]
        )[0][target_index]


        predictions.append(
            round(float(prediction_value),2)
        )


        sequence = np.vstack([
            sequence[1:],
            next_row
        ])


    return predictions


if __name__ == "__main__":
    print(predict_water_balance(6))