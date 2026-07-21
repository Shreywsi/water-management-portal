import os
import json
import joblib
import numpy as np
import pandas as pd
import django

import sys 
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "backend.settings"
)

django.setup()

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from groundwater.models import WaterBalance

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import EarlyStopping

# ---------------------------------------------------
# Create save directory
# ---------------------------------------------------
def load_location_dataset(location_id):

    rows = []

    records = (
        WaterBalance.objects
        .filter(location_id=location_id)
        .order_by("created_at")
    )

    for r in records:
        rows.append({
            "rainfall_mm": r.Rr,
            "groundwater_depth": 0,
            "water_balance": r.delta_s,
            "month": r.created_at.month,
        })

    df = pd.DataFrame(rows)

    if len(df) == 0:
        raise Exception("No data found for this location.")

    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

    return df

def train_model(location_id):
    print("========== TRAINING STARTED ==========")
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    SAVE_DIR = os.path.join(
        BASE_DIR,
        "saved_models",
        f"location_{location_id}"
    )
    os.makedirs(SAVE_DIR, exist_ok=True)

    # ---------------------------------------------------
    # Load & preprocess dataset
    # ---------------------------------------------------

    from groundwater.models import WaterBalance
    df = load_location_dataset(location_id)
    # ---------------------------------------------------
    # Save dataset used for this location
    # ---------------------------------------------------

    dataset_path = os.path.join(
        SAVE_DIR,
        "training_data.csv"
    )

    df.to_csv(
        dataset_path,
        index=False
    )

    print(f"Training dataset saved to: {dataset_path}")
    if len(df) < 8:
        raise Exception(
            f"Location {location_id} has only {len(df)} records. Need at least 20."
        )
    

    features = [
        "rainfall_mm",
        "groundwater_depth",
        "water_balance",
        "month_sin",
        "month_cos"
    ]

    data = df[features].values

    # ---------------------------------------------------
    # Scale
    # ---------------------------------------------------

    scaler = MinMaxScaler()

    scaled_data = scaler.fit_transform(data)

    # ---------------------------------------------------
    # Sequence settings
    # ---------------------------------------------------

    SEQUENCE_LENGTH = 6

    training_config = {
        "sequence_length": SEQUENCE_LENGTH,
        "features": features,
        "target": "water_balance",
        "target_index": features.index("water_balance")
    }

    with open(
        os.path.join(SAVE_DIR, "model_config.json"),
        "w"
    ) as f:

        json.dump(
            training_config,
            f,
            indent=4
        )

    # ---------------------------------------------------
    # Create sequences
    # ---------------------------------------------------

    X = []
    y = []

    for i in range(SEQUENCE_LENGTH, len(scaled_data)):

        X.append(
            scaled_data[
                i - SEQUENCE_LENGTH:i
            ]
        )

        # Target:
        # Water Balance (feature index 2)

        y.append(
            scaled_data[
                i,
                training_config["target_index"]
            ]
    )

    X = np.array(X)
    y = np.array(y)

    # ---------------------------------------------------
    # Train/Test Split
    # ---------------------------------------------------

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        shuffle=False
    )

    print(f"Training samples : {len(X_train)}")
    print(f"Testing samples  : {len(X_test)}")

    # ---------------------------------------------------
    # Build Model
    # ---------------------------------------------------

    model = Sequential()

    model.add(
        LSTM(
            64,
            input_shape=X_train.shape[1:]
        )
    )

    model.add(
        Dense(
            32,
            activation="relu"
        )
    )

    # Predict Water Balance

    model.add(Dense(1))

    model.compile(
        optimizer="adam",
        loss="mse"
    )

    model.summary()

    # ---------------------------------------------------
    # Train
    # ---------------------------------------------------

    early_stop = EarlyStopping(
        monitor="val_loss",
        patience=10,
        restore_best_weights=True
    )

    history = model.fit(
        X_train,
        y_train,
        validation_data=(
            X_test,
            y_test
        ),
        epochs=100,
        batch_size=8,
        callbacks=[early_stop],
        verbose=1
    )

    # ---------------------------------------------------
    # Save training history
    # ---------------------------------------------------

    pd.DataFrame(
        history.history
    ).to_csv(
        os.path.join(
            SAVE_DIR,
            "training_history.csv"
        ),
        index=False
    )

    # ---------------------------------------------------
    # Evaluate
    # ---------------------------------------------------

    predictions = model.predict(
        X_test,
        verbose=0
    )

    dummy_pred = np.zeros(
        (len(predictions), len(features))
    )

    dummy_true = np.zeros(
        (len(y_test), len(features))
    )

    target_index = training_config["target_index"]

    dummy_pred[:, target_index] = predictions.flatten()
    dummy_true[:, target_index] = y_test

    pred_original = scaler.inverse_transform(dummy_pred)
    true_original = scaler.inverse_transform(dummy_true)

    pred_water_balance = pred_original[:, target_index]
    true_water_balance = true_original[:, target_index]
    metrics = {
    "rmse": float(
        np.sqrt(
            mean_squared_error(
                true_water_balance,
                pred_water_balance
            )
        )
    ),

    "mae": float(
        mean_absolute_error(
            true_water_balance,
            pred_water_balance
        )
    ),

    "r2": float(
        r2_score(
            true_water_balance,
            pred_water_balance
        )
    ),

    "train_samples": len(X_train),
    "test_samples": len(X_test),
}

    # ---------------------------------------------------
    # Save model
    # ---------------------------------------------------

    model.save(
        os.path.join(
            SAVE_DIR,
            "water_balance_model.keras"
        )
    )

    joblib.dump(
        scaler,
        os.path.join(
            SAVE_DIR,
            "water_balance_scaler.pkl"
        )
    )

    with open(
        os.path.join(
            SAVE_DIR,
            "model_metrics.json"
        ),
        "w"
    ) as f:

        json.dump(
            metrics,
            f,
            indent=4
        )

    # ---------------------------------------------------
    # Done
    # ---------------------------------------------------

    print("\nTraining Complete")

    print(f"✅ Model for Location {location_id} saved successfully!")
    print(json.dumps(metrics, indent=4))
if __name__ == "__main__":

    if len(sys.argv) != 2:
        print("Usage:")
        print("python -m ml.train <location_id>")
        sys.exit(1)

    train_model(int(sys.argv[1]))
    
