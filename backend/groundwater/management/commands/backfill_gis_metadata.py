from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from groundwater.models import GisLayers


class Command(BaseCommand):
    help = "Populate metadata for existing GIS uploads"

    def handle(self, *args, **kwargs):
        gis_dir = Path(settings.BASE_DIR) / "uploads" / "gis"

        if not gis_dir.exists():
            self.stdout.write(self.style.ERROR(f"{gis_dir} does not exist"))
            return

        updated = 0

        for layer in GisLayers.objects.all():

            expected = layer.table_name.lower()

            for file in gis_dir.iterdir():

                if not file.is_file():
                    continue

                filename = file.name.lower()

                stem = file.stem.lower()

                normalized = (
                    stem.replace(" ", "_")
                        .replace("-", "_")
                        .replace(".shp", "")
                )

                if normalized == expected:

                    layer.original_filename = file.name
                    layer.file_path = str(file.resolve())
                    layer.file_size = file.stat().st_size
                    layer.save()

                    updated += 1

                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Updated: {layer.layer_name}"
                        )
                    )

                    break

        self.stdout.write(
            self.style.SUCCESS(f"\nFinished. Updated {updated} layer(s).")
        )