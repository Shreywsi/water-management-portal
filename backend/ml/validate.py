import pandas as pd


REQUIRED_COLUMNS = [
    "time",
    "rainfall_mm",
]

OPTIONAL_COLUMNS = [
    "groundwater_depth",
    "water_level_m",
    "pumping_hours",
    "recharge_mm",
    "surface_inflow",
    "surface_outflow",
    "evapotranspiration_mm",
]


def validate_dataset(csv_path):

    df = pd.read_csv(csv_path)

    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )

    missing = []

    for col in REQUIRED_COLUMNS:
        if col not in df.columns:
            missing.append(col)

    if (
        "groundwater_depth" not in df.columns
        and
        "water_level_m" not in df.columns
    ):
        missing.append(
            "groundwater_depth OR water_level_m"
        )

    if missing:
        return {
            "valid": False,
            "message": f"Missing columns: {missing}"
        }

    return {
    "valid": True,
    "rows": len(df),
    "columns": list(df.columns),
    "date_range": {
        "start": str(df["time"].min()),
        "end": str(df["time"].max())
    },
    "missing_values": int(df.isna().sum().sum())
}