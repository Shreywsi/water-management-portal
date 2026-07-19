import os
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ACTIVE_DIR = os.path.join(
    BASE_DIR,
    "uploads",
    "datasets",
    "active"
)

ACTIVE_DATASET = os.path.join(
    ACTIVE_DIR,
    "training_data.csv"
)


def get_active_dataset():
    return ACTIVE_DATASET


def set_active_dataset(uploaded_file):

    os.makedirs(ACTIVE_DIR, exist_ok=True)

    shutil.copy(
        uploaded_file,
        ACTIVE_DATASET
    )

    return ACTIVE_DATASET