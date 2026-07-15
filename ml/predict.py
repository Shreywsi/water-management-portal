import os
import joblib
import numpy as np
import pandas as pd

from tensorflow.keras.models import load_model

# Base directory of the ML module
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "saved_models", "groundwater_model.keras")
SCALER_PATH = os.path.join(BASE_DIR, "saved_models", "scaler.pkl")
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "training_data.csv")


def predict_groundwater():
    """
    Predict next month's groundwater depth.
    Returns:
        float : predicted groundwater depth (meters)
    """

    model = load_model(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    df = pd.read_csv(DATA_PATH)

    features = [
        "rainfall_mm",
        "water_balance",
        "groundwater_depth",
    ]

    data = df[features].values

    scaled = scaler.transform(data)

    sequence = scaled[-6:]

    X = np.array([sequence])

    prediction_scaled = model.predict(X, verbose=0)

    dummy = np.zeros((1, 3))
    dummy[0, 2] = prediction_scaled[0, 0]

    prediction = scaler.inverse_transform(dummy)[0, 2]

    return round(float(prediction), 2)


if __name__ == "__main__":
    prediction = predict_groundwater()
    print(f"Predicted Groundwater Depth: {prediction} meters")