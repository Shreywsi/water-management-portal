import json
import joblib
import numpy as np
from pathlib import Path

from tensorflow.keras.models import load_model

from ml.dataset import get_active_dataset
from ml.preprocess import preprocess_dataset

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "saved_models" / "water_balance_model.keras"
SCALER_PATH = BASE_DIR / "saved_models" / "water_balance_scaler.pkl"
CONFIG_PATH = BASE_DIR / "saved_models" / "model_config.json"


def predict_water_balance():

    if not MODEL_PATH.exists():
        raise Exception("Model has not been trained yet.")

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

    df = preprocess_dataset(get_active_dataset())

    data = df[features].values

    scaled = scaler.transform(data)

    if len(scaled) < sequence_length:
        raise Exception(
            f"Dataset must contain at least {sequence_length} rows."
        )

    sequence = scaled[-sequence_length:]

    X = np.array([sequence])

    prediction_scaled = model.predict(
        X,
        verbose=0
    )[0][0]

    dummy = sequence[-1].copy()

    dummy[target_index] = prediction_scaled

    prediction = scaler.inverse_transform(
        [dummy]
    )[0][target_index]

    return round(float(prediction), 2)


if __name__ == "__main__":
    print(predict_water_balance())