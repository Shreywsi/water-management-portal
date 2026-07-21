import os
import pandas as pd

from groundwater.models import (
    WaterBalance,
    WaterLevel,
    Pumping,
    Location,
)


def export_location_dataset(location_id):
    print("========== EXPORT FUNCTION STARTED ==========")

    base_folder = "uploads/datasets"
    os.makedirs(base_folder, exist_ok=True)

    # Get only the requested location
    location = Location.objects.get(id=location_id)

    print(f"Processing location {location.id} - {location.name}")

    rows = []

    balances = (
        WaterBalance.objects
        .filter(location=location)
        .order_by("created_at")
    )

    for wb in balances:

        latest_level = (
            WaterLevel.objects
            .filter(
                location=location,
                date__lte=wb.created_at.date()
            )
            .order_by("-date")
            .first()
        )

        latest_pumping = (
            Pumping.objects
            .filter(
                location=location,
                date__lte=wb.created_at.date()
            )
            .order_by("-date")
            .first()
        )

        groundwater_depth = (
            latest_level.level
            if latest_level
            else 0
        )

        pumping_hours = (
            latest_pumping.hours
            if latest_pumping
            else 0
        )

        rows.append({
            "time": wb.created_at,
            "rainfall_mm": wb.Rr,
            "groundwater_depth": groundwater_depth,
            "pumping_hours": pumping_hours,
            "recharge_mm": wb.Re,
            "evapotranspiration_mm": wb.Et,
            "surface_inflow": wb.Ri + wb.I + wb.Si,
            "surface_outflow": wb.Se + wb.O,
            "deep_percolation": wb.Dp,
            "water_balance": wb.delta_s,
        })

    # If no records exist, create an empty dataset
    df = pd.DataFrame(rows)

    location_folder = os.path.join(
        base_folder,
        f"location_{location.id}"
    )

    os.makedirs(location_folder, exist_ok=True)

    csv_path = os.path.join(
        location_folder,
        "training_data.csv"
    )

    df.to_csv(
        csv_path,
        index=False
    )

    print(f"✓ Exported {len(df)} rows for {location.name}")
    print(f"Saved to: {csv_path}")

    return len(df)