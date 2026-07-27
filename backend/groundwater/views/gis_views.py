import os
import subprocess
import zipfile
from pathlib import Path
import json
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.db import connection  
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from groundwater.models import GisLayers
import logging
from django.http import FileResponse, Http404

from django.contrib.gis.geos import GEOSGeometry
from django.http import JsonResponse
import random
logger = logging.getLogger(__name__)


@csrf_exempt
@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def upload_gis_file(request):

    uploaded_file = request.FILES.get("file")

    if not uploaded_file:
        return Response(
            {"error": "No file uploaded."},
            status=400
        )

    upload_dir = os.path.join(settings.BASE_DIR, "uploads", "gis")
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, uploaded_file.name)

    with open(file_path, "wb+") as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)

    shp_file = None
    extracted_files = []

    if uploaded_file.name.lower().endswith(".zip"):

        extract_dir = os.path.join(
            settings.BASE_DIR,
            "uploads",
            "temp",
            Path(uploaded_file.name).stem,
        )

        os.makedirs(extract_dir, exist_ok=True)

        try:
            with zipfile.ZipFile(file_path, "r") as zip_ref:
                zip_ref.extractall(extract_dir)
        except zipfile.BadZipFile:
            return Response({"error": "Uploaded file is not a valid ZIP archive."}, status=400)

        for root, dirs, files in os.walk(extract_dir):

            for file in files:

                extracted_files.append(file)

                if file.startswith("._"):
                    continue

                if "__MACOSX" in root:
                    continue

                if file.lower().endswith(".shp"):
                    shp_file = os.path.join(root, file)
                    break

            if shp_file:
                break

        if shp_file is None:
            return Response(
                {"error": "No .shp file found."},
                status=400
            )

        table_name = (
            Path(uploaded_file.name)
            .stem
            .lower()
            .replace(" ", "_")
            .replace("-", "_")
        )

        # -------------------------
        # Build a real PostGIS connection string from Django's DB settings
        # -------------------------
        db = settings.DATABASES.get("default", {})

        required = ("NAME", "USER", "PASSWORD", "HOST")
        if not all(db.get(k) for k in required):
            return Response(
                {"error": "Database connection settings are incomplete on the server."},
                status=500,
            )

        pg_conn = (
            f'PG:host={db["HOST"]} '
            f'port={db.get("PORT") or 5432} '
            f'dbname={db["NAME"]} '
            f'user={db["USER"]} '
            f'password={db["PASSWORD"]}'
        )

        cmd = [
            "ogr2ogr",
            "-f", "PostgreSQL",
            pg_conn,
            shp_file,
            "-nln", table_name,
            "-overwrite",
        ]
        

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,
            )
        except FileNotFoundError:
            return Response(
                {"error": "ogr2ogr is not installed on this server. Install GDAL (gdal-bin)."},
                status=500,
            )
        except subprocess.TimeoutExpired:
            return Response(
                {"error": "GIS import timed out."},
                status=504,
            )

        logger.info("ogr2ogr return code: %s", result.returncode)
        if result.returncode != 0:
            logger.error("ogr2ogr stderr: %s", result.stderr)

        if result.returncode != 0:
            return Response(
                {
                    "success": False,
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                },
                status=500,
            )
        GisLayers.objects.update_or_create(
            table_name=table_name,
            defaults={
                "layer_name": table_name.replace("_", " ").title(),
                "geometry_type": "Unknown",
                "visible": True,

                "original_filename": uploaded_file.name,
                "file_path": file_path,
                "file_size": uploaded_file.size,
            },
        )

    else:
        table_name = None

    return Response({
        "success": True,
        "filename": uploaded_file.name,
        "table_name": table_name,
        "saved_to": file_path,
        "shp_file": shp_file,
        "extracted_files": extracted_files,
    })


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def list_gis_layers(request):

    layers = []

    with connection.cursor() as cursor:

        for layer in GisLayers.objects.filter(visible=True).order_by("layer_name"):

            geometry_column = "wkb_geometry"
            srid = 4326

            try:
                cursor.execute(f"""
                    SELECT f_geometry_column, srid
                    FROM geometry_columns
                    WHERE f_table_name = %s
                    LIMIT 1;
                """, [layer.table_name])

                row = cursor.fetchone()

                if row:
                    geometry_column, srid = row

            except Exception:
                pass

            layers.append({
                "id": layer.id,
                "layer_name": layer.layer_name,
                "table_name": layer.table_name,
                "geometry_column": geometry_column,
                "geometry_type": layer.geometry_type,
                "srid": srid,
            })

    return Response(layers)
@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def list_gis_files(request):

    files = []

    for layer in GisLayers.objects.all().order_by("-uploaded_at"):

        exists = (
            layer.file_path
            and os.path.exists(layer.file_path)
        )

        files.append({
            "id": layer.id,
            "layer_name": layer.layer_name,
            "table_name": layer.table_name,

            "original_filename": layer.original_filename,
            "file_size": layer.file_size,
            "uploaded_at": layer.uploaded_at,

            "has_file": exists,
        })

    return Response(files)


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def download_gis_file(request, id):
    try:
        layer = GisLayers.objects.get(id=id)
    except GisLayers.DoesNotExist:
        raise Http404("Layer not found")

    if not layer.file_path or not os.path.exists(layer.file_path):
        raise Http404("File not found")

    return FileResponse(
        open(layer.file_path, "rb"),
        as_attachment=True,
        filename=layer.original_filename,
    )

@api_view(["DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_gis_file(request, id):
    try:
        layer = GisLayers.objects.get(id=id)
    except GisLayers.DoesNotExist:
        return Response({"error": "Layer not found."}, status=404)

    # Delete uploaded ZIP if it exists
    if layer.file_path and os.path.exists(layer.file_path):
        os.remove(layer.file_path)

    # Delete imported PostGIS table
    with connection.cursor() as cursor:
        cursor.execute(f'DROP TABLE IF EXISTS "{layer.table_name}" CASCADE')

    # Delete database record
    layer.delete()

    return Response({"success": True})

@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def gis_geojson(request):

    layers = []

    with connection.cursor() as cursor:

        for layer in GisLayers.objects.filter(visible=True):

            geometry_column = "wkb_geometry"

            cursor.execute("""
                SELECT f_geometry_column
                FROM geometry_columns
                WHERE f_table_name=%s
                LIMIT 1
            """, [layer.table_name])

            row = cursor.fetchone()

            if row:
                geometry_column = row[0]

            cursor.execute(f"""
                SELECT ST_AsGeoJSON({geometry_column})
                FROM {layer.table_name}
            """)

            features = []

            for geom, in cursor.fetchall():

                if not geom:
                    continue

                features.append({
                    "type": "Feature",
                    "geometry": json.loads(geom),
                    "properties": {}
                })

            layers.append({
                "id": layer.id,
                "name": layer.layer_name,
                "color": "#{:06x}".format(random.randint(0,0xFFFFFF)),
                "geojson": {
                    "type":"FeatureCollection",
                    "features":features
                }
            })

    return Response(layers)