from django.db import connection

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

import logging

logger = logging.getLogger(__name__)


@api_view(["GET"])
def dashboard(request):

    with connection.cursor() as cursor:

        cursor.execute("""
            SELECT COUNT(*) FROM groundwater_well;
        """)
        total_wells = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(DISTINCT l.name)
FROM groundwater_well w
JOIN groundwater_location l
ON w.location_id = l.id;
        """)
        total_villages = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*) FROM groundwater_levels;
        """)
        groundwater_records = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*) FROM pumping;
        """)
        pumping_records = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*) FROM rainfall;
        """)
        rainfall_records = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*) FROM weather;
        """)
        weather_records = cursor.fetchone()[0]

    return Response({
        "totalWells": total_wells,
        "totalVillages": total_villages,
        "totalRecords": groundwater_records + pumping_records + rainfall_records + weather_records,
        "groundwaterRecords": groundwater_records,
        "pumpingRecords": pumping_records,
        "rainfallRecords": rainfall_records,
        "weatherRecords": weather_records
    })


@api_view(["GET"])
def wells(request):

    with connection.cursor() as cursor:

        cursor.execute("""
            SELECT
    w.id,
    w.well_id AS well_name,
    l.name AS village,
    w.latitude,
    w.longitude,
    NULL AS depth_m,
    NULL AS water_level_m,
    'active' AS status
FROM groundwater_well w
LEFT JOIN groundwater_location l
ON w.location_id = l.id
ORDER BY w.id;
        """)

        columns = [col[0] for col in cursor.description]

        rows = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

    return Response(rows)


@api_view(["GET"])
def village_clusters_geojson(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT json_build_object(
                'type', 'FeatureCollection',
                'features', json_agg(
                    ST_AsGeoJSON(t.*)::json
                )
            )
            FROM (
                SELECT
                    ogc_fid,
                    wkb_geometry
                FROM village_clusters
            ) AS t;
        """)

        geojson = cursor.fetchone()[0]

    return Response(geojson)


# views.py — well property box endpoint

@api_view(["GET"])
def well_detail(request, well_id):
    try:
        with connection.cursor() as cursor:

            # ------------------------
            # Well information
            # ------------------------
            cursor.execute("""
    SELECT
        w.id,
        w.well_id AS well_name,
        l.name AS village,
        w.latitude,
        w.longitude,
        NULL AS depth_m,
        NULL AS water_level_m,
        'active' AS status
    FROM groundwater_well w
    LEFT JOIN groundwater_location l
        ON w.location_id = l.id
    WHERE w.id = %s;
""", [well_id])

            row = cursor.fetchone()

            if not row:
                return Response(
                    {"error": "Well not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            columns = [col[0] for col in cursor.description]
            well = dict(zip(columns, row))

            monthly = []
            quarterly = []
            yearly = []

            lulc = {
    "class": "Unknown",
    "areaHectares": None,
}

            return Response({
                "well": well,
                "waterLevelHistory": {
                    "monthly": monthly,
                    "quarterly": quarterly,
                    "yearly": yearly
                },
                "lulc": lulc
            })

    except Exception as e:
        logger.exception("Unhandled error in view")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )