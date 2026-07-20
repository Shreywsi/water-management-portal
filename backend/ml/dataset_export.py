import os
import pandas as pd

from groundwater.models import (
    WaterBalance,
    WaterLevel,
    Pumping,
)


def export_database_to_training_dataset():

    rows = []

    balances = WaterBalance.objects.all().order_by("created_at")

    for wb in balances:

        latest_level = (
            WaterLevel.objects
            .filter(date__lte=wb.date)
            .order_by("-date")
            .first()
        )

        latest_pumping = (
            Pumping.objects
            .filter(date__lte=wb.date)
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

            "water_balance": wb.delta_s,
            "deep_percolation": wb.Dp,

        })

    df = pd.DataFrame(rows)

    os.makedirs(
        "uploads/datasets/active",
        exist_ok=True
    )

    df.to_csv(
        "uploads/datasets/active/training_data.csv",
        index=False
    )

    return len(df)