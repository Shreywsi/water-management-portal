import hashlib
from django.db import migrations


ORIGINAL_PARAMETERS = [
    # (key, label, category)
    ("Rr", "Recharge from rainfall", "inflow"),
    ("Re", "Recharge from canal seepage", "inflow"),
    ("Ri", "Recharge from return flow of applied irrigation", "inflow"),
    ("I", "Inflow from outside the basin", "inflow"),
    ("Si", "Recharge from seepage (rivers, streams, reservoirs, ponds)", "inflow"),
    ("Se", "Groundwater flow from effluent seepage", "outflow"),
    ("O", "Outflow to areas outside the basin", "outflow"),
    ("Et", "Evapo-transpiration losses", "outflow"),
    ("Dp", "Groundwater draft (pumpage)", "outflow"),
]


def forwards(apps, schema_editor):
    Parameter = apps.get_model("groundwater", "Parameter")
    WaterBalance = apps.get_model("groundwater", "WaterBalance")
    MLModelState = apps.get_model("groundwater", "MLModelState")

    for order, (key, label, category) in enumerate(ORIGINAL_PARAMETERS):
        Parameter.objects.get_or_create(
            key=key,
            defaults={"label": label, "category": category, "order": order, "is_active": True},
        )

    keys = [p[0] for p in ORIGINAL_PARAMETERS]
    for wb in WaterBalance.objects.all():
        wb.values = {key: getattr(wb, key) for key in keys}
        wb.save(update_fields=["values"])

    location_ids = WaterBalance.objects.values_list("location_id", flat=True).distinct()
    signature = hashlib.sha256(",".join(sorted(keys)).encode()).hexdigest()[:16]
    for loc_id in location_ids:
        if loc_id is None:
            continue
        MLModelState.objects.get_or_create(
            location_id=loc_id,
            defaults={"needs_retrain": True, "active_parameter_signature": signature},
        )


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("groundwater", "0013_parameter_waterbalance_values_mlmodelstate"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]