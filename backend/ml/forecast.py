import json
import joblib
import numpy as np

from pathlib import Path
from tensorflow.keras.models import load_model

from ml.dataset import get_active_dataset
from ml.preprocess import preprocess_dataset

BASE_DIR = Path(__file__).resolve().parent

MODEL = load_model(
    BASE_DIR / "saved_models" / "water_balance_model.keras"
)

SCALER = joblib.load(
    BASE_DIR / "saved_models" / "water_balance_scaler.pkl"
)

with open(
    BASE_DIR / "saved_models" / "model_config.json"
) as f:
    CONFIG = json.load(f)

FEATURES = CONFIG["features"]
TARGET_INDEX = CONFIG["target_index"]
SEQUENCE_LENGTH = CONFIG["sequence_length"]

METRICS_PATH = (
    BASE_DIR / "saved_models" / "model_metrics.json"
)


def forecast_water_balance(steps):

    df = preprocess_dataset(
        get_active_dataset()
    )

    data = df[FEATURES].values

    scaled = SCALER.transform(data)

    sequence = scaled[-SEQUENCE_LENGTH:]

    predictions = []

    for _ in range(steps):

        X = np.array([sequence])

        pred_scaled = MODEL.predict(
            X,
            verbose=0
        )[0][0]

        next_row = sequence[-1].copy()

        next_row[TARGET_INDEX] = pred_scaled

        month_sin_index = FEATURES.index("month_sin")
        month_cos_index = FEATURES.index("month_cos")

        angle = np.arctan2(
            next_row[month_sin_index],
            next_row[month_cos_index]
        )

        angle += (2 * np.pi / 12)

        next_row[month_sin_index] = np.sin(angle)
        next_row[month_cos_index] = np.cos(angle)

        # Advance seasonality
        month_sin_index = FEATURES.index("month_sin")
        month_cos_index = FEATURES.index("month_cos")

        angle = np.arctan2(
            next_row[month_sin_index],
            next_row[month_cos_index]
        )

        angle += (2 * np.pi / 12)

        next_row[month_sin_index] = np.sin(angle)
        next_row[month_cos_index] = np.cos(angle)

        prediction = SCALER.inverse_transform(
            [next_row]
        )[0][TARGET_INDEX]

        predictions.append(float(prediction))

        sequence = np.vstack([
            sequence[1:],
            next_row
        ])

    final_prediction = predictions[-1]

    history = []

    for _, row in df.tail(24).iterrows():

        history.append({

            "date": row["time"].strftime("%Y-%m"),

            "water_balance": round(
                float(row["water_balance"]),
                2
            )

        })

    years = (
        (df["time"].max() - df["time"].min()).days
        / 365.25
    )

    with open(METRICS_PATH) as f:
        metrics = json.load(f)

    rmse = metrics["water_balance"]["rmse"]
    mae = metrics["water_balance"]["mae"]
    r2 = metrics["water_balance"]["r2"]

    required_years = {
        1: 1,
        3: 2,
        6: 3,
        12: 5,
        120: 10,
        360: 30
    }

    needed = required_years.get(
        steps,
        1
    )

    coverage = min(
        (years / needed) * 100,
        100
    )

    horizon_score = {
        1: 100,
        3: 95,
        6: 90,
        12: 85,
        120: 45,
        360: 20
    }.get(
        steps,
        50
    )

    model_score = max(
        40,
        min(
            99,
            int((r2 + 1) * 50)
        )
    )

    confidence = round(
        0.35 * coverage +
        0.35 * horizon_score +
        0.30 * model_score
    )

    confidence = max(
        20,
        min(
            confidence,
            99
        )
    )

    if confidence >= 80:
        level = "High"
    elif confidence >= 60:
        level = "Moderate"
    else:
        level = "Low"

    return {

        "prediction": round(
            final_prediction,
            2
        ),

        "forecast": [
            round(x, 2)
            for x in predictions
        ],

        "confidence": confidence,

        "confidence_level": level,

        "prediction_range": {

            "lower": round(
                final_prediction - rmse,
                2
            ),

            "upper": round(
                final_prediction + rmse,
                2
            )

        },

        "years_of_history": round(
            years,
            1
        ),

        "model_metrics": {

            "rmse": round(rmse, 4),

            "mae": round(mae, 4),

            "r2": round(r2, 4),

            "train_samples": metrics["train_samples"],

            "test_samples": metrics["test_samples"]

        },

        "history": history,

        "message": (
            f"Prediction generated using "
            f"{round(years,1)} years of historical observations."
        )

    }