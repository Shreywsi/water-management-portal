import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import EarlyStopping

from ml.preprocess import preprocess_dataset
from ml.dataset import get_active_dataset

# ---------------------------------------------------
# Create save directory
# ---------------------------------------------------
def train_model():
    print("========== TRAINING STARTED ==========")
    SAVE_DIR = "ml/saved_models"
    os.makedirs(SAVE_DIR, exist_ok=True)

    # ---------------------------------------------------
    # Load & preprocess dataset
    # ---------------------------------------------------

    dataset_path = get_active_dataset()

    df = preprocess_dataset(dataset_path)

    if len(df) < 20:
        raise Exception(
            "Need at least 20 rows to train the LSTM model."
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

        "water_balance": {

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
            )

        },

        "train_samples": len(X_train),

        "test_samples": len(X_test)

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

    print("Model saved successfully!")

    print(json.dumps(metrics, indent=4))
if __name__ == "__main__":
    train_model()