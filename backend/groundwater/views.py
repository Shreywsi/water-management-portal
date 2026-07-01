from django.db import connection

from rest_framework.response import Response

from rest_framework.decorators import api_view

import subprocess

from pathlib import Path


@api_view(["GET"])
def dashboard(request):

    with connection.cursor() as cursor:

        cursor.execute("""
            SELECT COUNT(*) FROM wells;
        """)
        total_wells = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(DISTINCT village) FROM wells;
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
                id,
                well_name,
                village,
                latitude,
                longitude,
                depth_m,
                water_level_m
            FROM groundwater_map
            ORDER BY id;
        """)

        columns = [col[0] for col in cursor.description]

        rows = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

    return Response(rows)


@api_view(["GET"])
def waterlevel(request):

    with connection.cursor() as cursor:

        cursor.execute("""
            SELECT
                g.time,
                w.well_name,
                g.water_level_m
            FROM groundwater_levels g
            JOIN wells w
            ON g.well_id = w.id
            ORDER BY g.time;
        """)

        columns = [col[0] for col in cursor.description]

        rows = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

    return Response(rows)


@api_view(["GET"])
def pumping(request):

    with connection.cursor() as cursor:

        cursor.execute("""
            SELECT
                p.time,
                w.well_name,
                p.pumping_hours
            FROM pumping p
            JOIN wells w
            ON p.well_id = w.id
            ORDER BY p.time;
        """)

        columns = [col[0] for col in cursor.description]

        rows = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

    return Response(rows)


@api_view(["POST"])
def open_qgis(request):

    subprocess.Popen([
        "/Applications/QGIS.app/Contents/MacOS/QGIS",
        "/Users/shreyasisoumya/water-management-portal/qgis/WaterManagement.qgz"
    ])

    return Response({
        "success": True
    })


# views.py — well property box endpoint

@api_view(["GET"])
def well_detail(request, well_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT id, well_name, village, latitude, longitude, depth_m, status
            FROM wells WHERE id = %s;
        """, [well_id])
        columns = [col[0] for col in cursor.description]
        row = cursor.fetchone()
        if not row:
            return Response({"error": "Well not found"}, status=404)
        well = dict(zip(columns, row))

        cursor.execute("""
            SELECT time, water_level_m FROM groundwater_levels
            WHERE well_id = %s ORDER BY time DESC LIMIT 1;
        """, [well_id])
        latest_row = cursor.fetchone()
        well["latest_reading_time"] = latest_row[0].strftime("%Y-%m-%d") if latest_row else None
        well["water_level_m"] = round(latest_row[1], 2) if latest_row else None

        cursor.execute("""
            SELECT date_trunc('month', time) AS period, AVG(water_level_m) AS avg_level
            FROM groundwater_levels WHERE well_id = %s
            GROUP BY period ORDER BY period DESC LIMIT 12;
        """, [well_id])
        monthly = [{"period": r[0].strftime("%Y-%m"), "level": round(r[1], 2)} for r in cursor.fetchall()][::-1]

        cursor.execute("""
            SELECT date_trunc('quarter', time) AS period, AVG(water_level_m) AS avg_level
            FROM groundwater_levels WHERE well_id = %s
            GROUP BY period ORDER BY period DESC LIMIT 8;
        """, [well_id])
        quarterly = [{"period": f"Q{(r[0].month - 1)//3 + 1} {r[0].year}", "level": round(r[1], 2)} for r in cursor.fetchall()][::-1]

        cursor.execute("""
            SELECT date_trunc('year', time) AS period, AVG(water_level_m) AS avg_level
            FROM groundwater_levels WHERE well_id = %s
            GROUP BY period ORDER BY period DESC LIMIT 5;
        """, [well_id])
        yearly = [{"period": str(r[0].year), "level": round(r[1], 2)} for r in cursor.fetchall()][::-1]

    return Response({
        "well": well,
        "waterLevelHistory": {"monthly": monthly, "quarterly": quarterly, "yearly": yearly}
    })


from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
import traceback


@csrf_exempt
@api_view(["POST"])
def add_water_level(request):
    """
    Admin endpoint to add a new groundwater level reading for a well.
    Expects JSON body: { "well_id": int, "time": "YYYY-MM-DD", "water_level_m": float }
    """
    well_id = request.data.get("well_id")
    time = request.data.get("time")
    water_level_m = request.data.get("water_level_m")

    if well_id is None or not time or water_level_m is None:
        return Response(
            {"error": "well_id, time, and water_level_m are all required."},
            status=400
        )

    try:
        datetime.strptime(time, "%Y-%m-%d")
    except ValueError:
        return Response({"error": "time must be in YYYY-MM-DD format."}, status=400)

    try:
        water_level_m = float(water_level_m)
    except (TypeError, ValueError):
        return Response({"error": "water_level_m must be a number."}, status=400)

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM wells WHERE id = %s;", [well_id])
            if cursor.fetchone() is None:
                return Response({"error": "Well not found."}, status=404)

            cursor.execute("""
                INSERT INTO groundwater_levels (well_id, time, water_level_m)
                VALUES (%s, %s, %s);
            """, [well_id, time, water_level_m])
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=500)

    return Response({
        "success": True,
        "well_id": well_id,
        "time": time,
        "water_level_m": water_level_m
    }, status=201)
