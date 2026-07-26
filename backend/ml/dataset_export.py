import os
import pandas as pd

from groundwater.models import (
    WaterBalance,
    WaterLevel,
    Pumping,
    Location,
    Parameter,
)


def export_location_dataset(location_id):
    """
    Builds training_data.csv for a location.

    Reads whatever parameters are (or ever were) registered in the
    Parameter table and emits:
      - one value column per parameter key (0 if missing for that row)
      - one mask column per parameter key ('<key>__present', 1/0)

    Rows are ordered by entry_date (the period the data represents),
    not created_at (when the row was saved) - these can differ now
    that entries can be backdated.
    """
    print("========== EXPORT FUNCTION STARTED ==========")

    base_folder = "uploads/datasets"
    os.makedirs(base_folder, exist_ok=True)

    location = Location.objects.get(id=location_id)
    print(f"Processing location {location.id} - {location.name}")

    all_parameters = list(Parameter.objects.all().order_by("category", "order", "id"))
    parameter_keys = [p.key for p in all_parameters]

    rows = []

    balances = (
        WaterBalance.objects
        .filter(location=location)
        .order_by("entry_date", "created_at")
    )

    for wb in balances:

        latest_level = (
            WaterLevel.objects
            .filter(location=location, date__lte=wb.entry_date)
            .order_by("-date")
            .first()
        )

        latest_pumping = (
            Pumping.objects
            .filter(location=location, date__lte=wb.entry_date)
            .order_by("-date")
            .first()
        )

        groundwater_depth = latest_level.level if latest_level else 0
        pumping_hours = latest_pumping.hours if latest_pumping else 0

        row = {
            "entry_date": wb.entry_date,
            "groundwater_depth": groundwater_depth,
            "pumping_hours": pumping_hours,
            "water_balance": wb.delta_s,
        }

        record_values = wb.values or {}

        for key in parameter_keys:
            present = key in record_values
            row[key] = float(record_values[key]) if present else 0.0
            row[f"{key}__present"] = 1 if present else 0

        rows.append(row)

    df = pd.DataFrame(rows)

    location_folder = os.path.join(base_folder, f"location_{location.id}")
    os.makedirs(location_folder, exist_ok=True)

    csv_path = os.path.join(location_folder, "training_data.csv")
    df.to_csv(csv_path, index=False)

    print(f"✓ Exported {len(df)} rows for {location.name}")
    print(f"Saved to: {csv_path}")

    return len(df)