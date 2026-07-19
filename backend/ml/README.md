import pandas as pd


# Required columns for every uploaded dataset
REQUIRED_COLUMNS = [
    "time",
    "well_name",
    "village",
    "water_level_m",
    "rainfall_mm",
]


def preprocess_dataset(csv_path):
    """
    Validates and cleans an uploaded CSV.

    Returns:
        cleaned_dataframe
    Raises:
        ValueError if validation fails.
    """

    df = pd.read_csv(csv_path)

    # --------------------------
    # Validate required columns
    # --------------------------

    missing = [
        col
        for col in REQUIRED_COLUMNS
        if col not in df.columns
    ]

    if missing:
        raise ValueError(
            f"Missing columns: {', '.join(missing)}"
        )

    # --------------------------
    # Convert dates
    # --------------------------

    df["time"] = pd.to_datetime(
        df["time"],
        errors="coerce"
    )

    # Remove invalid dates
    df = df.dropna(subset=["time"])

    # --------------------------
    # Numeric conversion
    # --------------------------

    numeric_columns = [
        "water_level_m",
        "rainfall_mm",
    ]

    for column in numeric_columns:

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # --------------------------
    # Fill missing values
    # --------------------------

    df["rainfall_mm"] = df["rainfall_mm"].fillna(0)

    df = df.dropna(
        subset=["water_level_m"]
    )

    # --------------------------
    # Remove duplicate rows
    # --------------------------

    df = df.drop_duplicates(
        subset=[
            "time",
            "well_name",
            "village",
        ]
    )

    # --------------------------
    # Sort chronologically
    # --------------------------

    df = df.sort_values("time")

    return df