import pandas as pd
import numpy as np

# Make random values reproducible
np.random.seed(42)

# Load rainfall data
df = pd.read_csv("ml/data/raw/rainfall.csv")

# Keep only one station for the prototype
df = df[df["station_name"] == "Mundra"].copy()

# Convert date
df["time"] = pd.to_datetime(df["time"])

# Sort chronologically
df = df.sort_values("time").reset_index(drop=True)

# -----------------------------
# Generate Groundwater Depth
# -----------------------------
groundwater_depth = []
depth = 15.0  # initial depth (meters)

for rainfall in df["rainfall_mm"]:

    # High rainfall generally reduces groundwater depth
    recharge = rainfall * 0.015

    # Natural seasonal depletion
    depletion = np.random.uniform(0.2, 0.6)

    depth = depth + depletion - recharge

    # Add measurement noise
    depth += np.random.normal(0, 0.08)

    # Keep realistic range
    depth = np.clip(depth, 5, 25)

    groundwater_depth.append(round(depth, 2))

df["groundwater_depth"] = groundwater_depth

# -----------------------------
# Generate Water Balance
# -----------------------------
water_balance = []

for rainfall in df["rainfall_mm"]:

    balance = (
        rainfall
        - np.random.uniform(15, 45)
        + np.random.normal(0, 5)
    )

    water_balance.append(round(balance, 2))

df["water_balance"] = water_balance

# Save processed dataset
df.to_csv(
    "ml/data/processed/training_data.csv",
    index=False
)

print(df.head())

print("\nDataset saved successfully!")