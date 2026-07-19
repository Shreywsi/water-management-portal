import pandas as pd
import numpy as np


def preprocess_dataset(csv_path):

    df = pd.read_csv(csv_path)

    # -------------------------
    # Standardize column names
    # -------------------------

    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )

    # -------------------------
    # Required columns
    # -------------------------

    # -------------------------
    # Required columns
    # -------------------------

    required = [
        "time",
        "rainfall_mm"
    ]

    missing = [
        col
        for col in required
        if col not in df.columns
    ]

    if missing:
        raise Exception(
            f"Missing required columns: {missing}"
        )

    # -------------------------
    # Groundwater Depth
    # -------------------------

    if "groundwater_depth" not in df.columns:

        if "water_level_m" in df.columns:

            df["groundwater_depth"] = df["water_level_m"]

        else:

            raise Exception(
                "Dataset must contain either "
                "'groundwater_depth' or "
                "'water_level_m'."
            )

    # -------------------------
    # Date
    # -------------------------

    df["time"] = pd.to_datetime(
        df["time"],
        errors="coerce"
    )

    df = df.dropna(subset=["time"])

    df = df.sort_values("time")

    # -------------------------
    # Numeric conversion
    # -------------------------

    numeric_columns = [

        "rainfall_mm",

        "groundwater_depth",

        "pumping_hours",

        "recharge_mm",

        "evapotranspiration_mm",

        "surface_inflow",

        "surface_outflow"

    ]

    for col in numeric_columns:

        if col in df.columns:

            df[col] = pd.to_numeric(
                df[col],
                errors="coerce"
            )

    # -------------------------
    # Fill missing rainfall
    # -------------------------

    df["rainfall_mm"] = (
        df["rainfall_mm"]
        .fillna(0)
    )

    # -------------------------
    # Groundwater
    # -------------------------

    df["groundwater_depth"] = pd.to_numeric(
        df["groundwater_depth"],
        errors="coerce"
    )

    df["groundwater_depth"] = df[
        "groundwater_depth"
    ].fillna(
        df["groundwater_depth"].median()
    )

    # -------------------------
    # Pumping
    # -------------------------

    if "pumping_hours" not in df.columns:

        df["pumping_hours"] = 0

    df["pumping_hours"] = (

        df["pumping_hours"]

        .fillna(0)

    )

    # =====================================================
    # Estimate missing hydrological variables
    # =====================================================

    if "recharge_mm" not in df.columns:

        df["recharge_mm"] = (

            df["rainfall_mm"]

            * 0.18

        )

    if "evapotranspiration_mm" not in df.columns:

        df["evapotranspiration_mm"] = (

            df["rainfall_mm"]

            * 0.32

        )

    if "surface_inflow" not in df.columns:

        df["surface_inflow"] = (

            df["rainfall_mm"]

            * 0.08

        )

    if "surface_outflow" not in df.columns:

        df["surface_outflow"] = (

            df["rainfall_mm"]

            * 0.04

        )

    # -------------------------
    # Pump abstraction
    # -------------------------

    # Adjustable later

    DEFAULT_PUMP_RATE = 25

    if "pump_rate" in df.columns:

        df["pump_rate"] = pd.to_numeric(
            df["pump_rate"],
            errors="coerce"
        ).fillna(DEFAULT_PUMP_RATE)

    else:

        df["pump_rate"] = DEFAULT_PUMP_RATE

    df["pump_abstraction"] = (
        df["pumping_hours"] *
        df["pump_rate"]
    )

    # -------------------------
    # Deep Percolation
    # -------------------------

    df["deep_percolation"] = (
    df["rainfall_mm"] * 0.06
)

    # =====================================================
    # Water Balance
    # =====================================================

    inflow = (

        df["rainfall_mm"]

        + df["recharge_mm"]

        + df["surface_inflow"]

    )

    outflow = (

    df["pump_abstraction"]

    + df["evapotranspiration_mm"]

    + df["surface_outflow"]

    + df["deep_percolation"]

)

    df["water_balance"] = (

        inflow

        - outflow

    )

    # -------------------------
    # Seasonality
    # -------------------------

    df["month"] = df["time"].dt.month

    df["month_sin"] = np.sin(

        2 * np.pi * df["month"] / 12

    )

    df["month_cos"] = np.cos(

        2 * np.pi * df["month"] / 12

    )

    return df