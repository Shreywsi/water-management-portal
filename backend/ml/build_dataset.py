from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent

SEED_DATASET = (
    BASE_DIR
    / "ml"
    / "data"
    / "seed"
    / "seed_dataset.csv"
)

ARCHIVE_DIR = (
    BASE_DIR
    / "uploads"
    / "datasets"
    / "archive"
)

MASTER_DATASET = (
    BASE_DIR
    / "ml"
    / "data"
    / "processed"
    / "database_training_data.csv"
)


def build_master_dataset():

    datasets = []

    # Add seed dataset (if it exists)
    if SEED_DATASET.exists():
        datasets.append(pd.read_csv(SEED_DATASET))

    # Add every archived upload
    if ARCHIVE_DIR.exists():

        for csv_file in sorted(ARCHIVE_DIR.glob("*.csv")):

            datasets.append(
                pd.read_csv(csv_file)
            )

    if not datasets:
        raise Exception("No datasets found.")

    master = pd.concat(
        datasets,
        ignore_index=True
    )

    duplicate_columns = [
        "time",
        "well_name",
        "village"
    ]

    available = [
        c for c in duplicate_columns
        if c in master.columns
    ]

    if available:

        master = master.drop_duplicates(
            subset=available,
            keep="last"
        )

    else:

        master = master.drop_duplicates()

    if "time" in master.columns:

        master = master.sort_values(
            "time"
        )

    MASTER_DATASET.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    master.to_csv(
        MASTER_DATASET,
        index=False
    )

    return len(master)