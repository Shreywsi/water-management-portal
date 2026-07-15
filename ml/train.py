import os
import joblib
import numpy as np
import pandas as pd

from sklearn.preprocessing import MinMaxScaler

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import EarlyStopping

# -------------------------
# Load Data
# -------------------------

df = pd.read_csv("ml/data/processed/training_data.csv")

features = [
    "rainfall_mm",
    "water_balance",
    "groundwater_depth"
]

data = df[features].values

# -------------------------
# Scale Data
# -------------------------

scaler = MinMaxScaler()

scaled_data = scaler.fit_transform(data)

# -------------------------
# Create Sequences
# -------------------------

SEQUENCE_LENGTH = 6

X = []
y = []

for i in range(SEQUENCE_LENGTH, len(scaled_data)):
    X.append(scaled_data[i-SEQUENCE_LENGTH:i])

    # groundwater_depth is column index 2
    y.append(scaled_data[i, 2])

X = np.array(X)
y = np.array(y)

print(f"X shape: {X.shape}")
print(f"y shape: {y.shape}")

# -------------------------
# Build Model
# -------------------------

model = Sequential()

model.add(
    LSTM(
        64,
        input_shape=(SEQUENCE_LENGTH, len(features))
    )
)

model.add(Dense(32, activation="relu"))

model.add(Dense(1))

model.compile(
    optimizer="adam",
    loss="mse"
)

model.summary()

# -------------------------
# Train
# -------------------------

early_stop = EarlyStopping(
    monitor="loss",
    patience=10,
    restore_best_weights=True
)

history = model.fit(
    X,
    y,
    epochs=100,
    batch_size=8,
    verbose=1,
    callbacks=[early_stop]
)

# -------------------------
# Save
# -------------------------

os.makedirs("ml/saved_models", exist_ok=True)

model.save(
    "ml/saved_models/groundwater_model.keras"
)

joblib.dump(
    scaler,
    "ml/saved_models/scaler.pkl"
)

print("\nModel saved successfully!")