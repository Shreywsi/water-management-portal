from django.db import migrations


def forwards(apps, schema_editor):
    WaterBalance = apps.get_model("groundwater", "WaterBalance")

    for wb in WaterBalance.objects.filter(entry_date__isnull=True):
        # Best available guess for historical rows: the date they
        # were saved, since we don't have a real "period" date for them.
        wb.entry_date = wb.created_at.date()
        wb.save(update_fields=["entry_date"])


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("groundwater", "0016_waterbalance_entry_date"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]