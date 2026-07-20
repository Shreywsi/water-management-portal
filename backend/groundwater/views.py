import sys
import os
import pandas as pd
import json
import threading
from datetime import datetime
from ml.preprocess import preprocess_dataset
from ml.retrain import retrain_model
from django.conf import settings
from .models import Dataset
from ml.build_dataset import build_master_dataset
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

sys.path.append(BASE_DIR)

from ml.predict import predict_water_balance

from django.http import JsonResponse
from django.conf import settings
from django.db import connection
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
import zipfile
from pathlib import Path
from rest_framework.response import Response
import subprocess
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from ml.forecast import forecast_water_balance
from .gempy_service import build_geological_model
from ml.predict import predict_water_balance
import subprocess

from pathlib import Path
from rest_framework import status
from .models import (
    Pumping,
    WaterLevel,
    WaterTable,
    TDS,
    Salinity,
    GISLayer,
    UserProfile,
    WaterBalance,
)
from .modflow_service import run_modflow
from .models import UserProfile
from ml.dataset import set_active_dataset

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
                water_level_m,
                status
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
    "success": True,
    "message": "Registration successful."
})


@api_view(["POST"])
def login_user(request):
    username = str(request.data.get("username", "")).strip()
    password = str(request.data.get("password", ""))
    #role = str(request.data.get("role", "")).strip()

    user = authenticate(
        request,
        username=username,
        password=password,
    )

    if user is None:
        return Response(
            {
                "success": False,
                "error": "Invalid username or password.",
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=user)

    try:
        profile = UserProfile.objects.get(user=user)
        user_role = profile.role
    except UserProfile.DoesNotExist:
        user_role = "crp"

    return Response({
        "success": True,
        "token": token.key,
        "username": user.username,
        "role": user_role,
    })

@api_view(["POST"])
def run_gempy(request):
    result = build_geological_model()
    return Response(result)

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .gempy_service import build_geological_model
from .modflow_service import run_modflow

@api_view(["POST"])
def run_modflow_view(request):

    # Step 1: Build geology
    geology = build_geological_model()

    # Step 2: Run groundwater model
    modflow = run_modflow()

    return Response({
        "success": True,
        "gempy": geology,
        "modflow": modflow
    })
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
                    id,
                    well_name,
                    village,
                    latitude,
                    longitude,
                    depth_m,
                    water_level_m,
                    status
                FROM groundwater_map
                WHERE id = %s;
            """, [well_id])

            row = cursor.fetchone()

            if not row:
                return Response(
                    {"error": "Well not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            columns = [col[0] for col in cursor.description]
            well = dict(zip(columns, row))

            # ------------------------
            # Monthly history
            # ------------------------
            cursor.execute("""
                SELECT
                    date_trunc('month', time) AS period,
                    AVG(water_level_m) AS avg_level
                FROM groundwater_levels
                WHERE well_id = %s
                GROUP BY period
                ORDER BY period;
            """, [well_id])

            monthly = []

            for period, level in cursor.fetchall():
                if period and level is not None:
                    monthly.append({
                        "period": period.strftime("%Y-%m"),
                        "level": round(level, 2)
                    })

            # ------------------------
            # Quarterly history
            # ------------------------
            cursor.execute("""
                SELECT
                    date_trunc('quarter', time) AS period,
                    AVG(water_level_m) AS avg_level
                FROM groundwater_levels
                WHERE well_id = %s
                GROUP BY period
                ORDER BY period;
            """, [well_id])

            quarterly = []

            for period, level in cursor.fetchall():
                if period and level is not None:
                    quarterly.append({
                        "period": f"Q{((period.month-1)//3)+1} {period.year}",
                        "level": round(level, 2)
                    })

            # ------------------------
            # Yearly history
            # ------------------------
            cursor.execute("""
                SELECT
                    date_trunc('year', time) AS period,
                    AVG(water_level_m) AS avg_level
                FROM groundwater_levels
                WHERE well_id = %s
                GROUP BY period
                ORDER BY period;
            """, [well_id])

            yearly = []

            for period, level in cursor.fetchall():
                if period and level is not None:
                    yearly.append({
                        "period": str(period.year),
                        "level": round(level, 2)
                    })

            # ------------------------
            # LULC (optional)
            # ------------------------
            lulc = {
                "class": "Unknown",
                "areaHectares": None
            }

            try:
                cursor.execute("""
                    SELECT
                        lulc_class,
                        ST_Area(geom::geography)/10000
                    FROM lulc_polygons
                    WHERE ST_Contains(
                        geom,
                        ST_SetSRID(
                            ST_MakePoint(%s,%s),
                            4326
                        )
                    )
                    LIMIT 1;
                """, [well["longitude"], well["latitude"]])

                row = cursor.fetchone()

                if row:
                    lulc = {
                        "class": row[0],
                        "areaHectares": round(row[1], 1)
                    }

            except Exception:
                pass

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
        print(traceback.format_exc())
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


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
@csrf_exempt
@api_view(["POST"])
def add_pumping(request):
    """
    Expects JSON body: { "well_id": int, "time": "YYYY-MM-DD", "pumping_hours": float }
    """
    well_id = request.data.get("well_id")
    time = request.data.get("time")
    pumping_hours = request.data.get("pumping_hours")

    if well_id is None or not time or pumping_hours is None:
        return Response(
            {"error": "well_id, time, and pumping_hours are all required."},
            status=400
        )

    try:
        datetime.strptime(time, "%Y-%m-%d")
    except ValueError:
        return Response({"error": "time must be in YYYY-MM-DD format."}, status=400)

    try:
        pumping_hours = float(pumping_hours)
    except (TypeError, ValueError):
        return Response({"error": "pumping_hours must be a number."}, status=400)

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM wells WHERE id = %s;", [well_id])
            if cursor.fetchone() is None:
                return Response({"error": "Well not found."}, status=404)

            cursor.execute("""
                INSERT INTO pumping (well_id, time, pumping_hours)
                VALUES (%s, %s, %s);
            """, [well_id, time, pumping_hours])
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=500)

    return Response({
        "success": True, "well_id": well_id, "time": time, "pumping_hours": pumping_hours
    }, status=201)


@csrf_exempt
@api_view(["POST"])
def add_rainfall(request):
    """
    Expects JSON body: { "station_name": str, "time": "YYYY-MM-DD", "rainfall_mm": float }
    """
    station_name = request.data.get("station_name")
    time = request.data.get("time")
    rainfall_mm = request.data.get("rainfall_mm")

    if not station_name or not time or rainfall_mm is None:
        return Response(
            {"error": "station_name, time, and rainfall_mm are all required."},
            status=400
        )

    try:
        datetime.strptime(time, "%Y-%m-%d")
    except ValueError:
        return Response({"error": "time must be in YYYY-MM-DD format."}, status=400)

    try:
        rainfall_mm = float(rainfall_mm)
    except (TypeError, ValueError):
        return Response({"error": "rainfall_mm must be a number."}, status=400)

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO rainfall (time, station_name, rainfall_mm)
                VALUES (%s, %s, %s);
            """, [time, station_name, rainfall_mm])
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=500)

    return Response({
        "success": True, "station_name": station_name, "time": time, "rainfall_mm": rainfall_mm
    }, status=201)


@csrf_exempt
@api_view(["POST"])
def add_weather(request):
    """
    Expects JSON body: { "station_name": str, "time": "YYYY-MM-DD", "temperature_c": float, "humidity_pct": float }
    """
    station_name = request.data.get("station_name")
    time = request.data.get("time")
    temperature_c = request.data.get("temperature_c")
    humidity_pct = request.data.get("humidity_pct")

    if not station_name or not time or temperature_c is None or humidity_pct is None:
        return Response(
            {"error": "station_name, time, temperature_c, and humidity_pct are all required."},
            status=400
        )

    try:
        datetime.strptime(time, "%Y-%m-%d")
    except ValueError:
        return Response({"error": "time must be in YYYY-MM-DD format."}, status=400)

    try:
        temperature_c = float(temperature_c)
        humidity_pct = float(humidity_pct)
    except (TypeError, ValueError):
        return Response({"error": "temperature_c and humidity_pct must be numbers."}, status=400)

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO weather (time, station_name, temperature_c, humidity_pct)
                VALUES (%s, %s, %s, %s);
            """, [time, station_name, temperature_c, humidity_pct])
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=500)

    return Response({
        "success": True, "station_name": station_name, "time": time,
        "temperature_c": temperature_c, "humidity_pct": humidity_pct
    }, status=201)
@api_view(["GET"])
def water_quality(request):

    with connection.cursor() as cursor:

        cursor.execute("""
            SELECT
                q.time,
                w.well_name,
                q.tds_ppm,
                q.salinity_ppt
            FROM water_quality q
            JOIN wells w
            ON q.well_id = w.id
            ORDER BY q.time;
        """)

        columns = [col[0] for col in cursor.description]

        rows = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

    return Response(rows)


@csrf_exempt
@api_view(["POST"])
def add_water_quality(request):
    """
    Expects JSON body: { "well_id": int, "time": "YYYY-MM-DD", "tds_ppm": float, "salinity_ppt": float }
    Either tds_ppm or salinity_ppt can be omitted (null), but at least one is required.
    """
    well_id = request.data.get("well_id")
    time = request.data.get("time")
    tds_ppm = request.data.get("tds_ppm")
    salinity_ppt = request.data.get("salinity_ppt")

    if well_id is None or not time:
        return Response({"error": "well_id and time are required."}, status=400)

    if tds_ppm is None and salinity_ppt is None:
        return Response({"error": "Provide at least one of tds_ppm or salinity_ppt."}, status=400)

    try:
        datetime.strptime(time, "%Y-%m-%d")
    except ValueError:
        return Response({"error": "time must be in YYYY-MM-DD format."}, status=400)

    try:
        tds_ppm = float(tds_ppm) if tds_ppm is not None else None
        salinity_ppt = float(salinity_ppt) if salinity_ppt is not None else None
    except (TypeError, ValueError):
        return Response({"error": "tds_ppm and salinity_ppt must be numbers."}, status=400)

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM wells WHERE id = %s;", [well_id])
            if cursor.fetchone() is None:
                return Response({"error": "Well not found."}, status=404)

            cursor.execute("""
                INSERT INTO water_quality (well_id, time, tds_ppm, salinity_ppt)
                VALUES (%s, %s, %s, %s);
            """, [well_id, time, tds_ppm, salinity_ppt])
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=500)

    return Response({
        "success": True, "well_id": well_id, "time": time,
        "tds_ppm": tds_ppm, "salinity_ppt": salinity_ppt
    }, status=201)
@api_view(["GET"])
def watertable(request):
    data = [
        {"date": w.date, "depth": w.depth}
        for w in WaterTable.objects.all().order_by("date")
    ]
    return Response(data)


@api_view(["GET"])
def tds(request):
    data = [
        {"date": t.date, "value": t.value}
        for t in TDS.objects.all().order_by("date")
    ]
    return Response(data)


@api_view(["GET"])
def salinity(request):
    data = [
        {"date": s.date, "value": s.value}
        for s in Salinity.objects.all().order_by("date")
    ]
    return Response(data)


@csrf_exempt
@api_view(["POST"])
def add_watertable(request):
    """Expects JSON body: { "date": "YYYY-MM-DD", "depth": float }"""
    date = request.data.get("date")
    depth = request.data.get("depth")

    if not date or depth is None:
        return Response({"error": "date and depth are required."}, status=400)

    try:
        datetime.strptime(date, "%Y-%m-%d")
        depth = float(depth)
    except (ValueError, TypeError):
        return Response({"error": "Invalid date or depth."}, status=400)

    entry = WaterTable.objects.create(date=date, depth=depth)
    return Response({"success": True, "id": entry.id, "date": date, "depth": depth}, status=201)


@csrf_exempt
@api_view(["POST"])
def add_tds(request):
    """Expects JSON body: { "date": "YYYY-MM-DD", "value": float }"""
    date = request.data.get("date")
    value = request.data.get("value")

    if not date or value is None:
        return Response({"error": "date and value are required."}, status=400)

    try:
        datetime.strptime(date, "%Y-%m-%d")
        value = float(value)
    except (ValueError, TypeError):
        return Response({"error": "Invalid date or value."}, status=400)

    entry = TDS.objects.create(date=date, value=value)
    return Response({"success": True, "id": entry.id, "date": date, "value": value}, status=201)


@csrf_exempt
@api_view(["POST"])
def add_salinity(request):
    """Expects JSON body: { "date": "YYYY-MM-DD", "value": float }"""
    date = request.data.get("date")
    value = request.data.get("value")

    if not date or value is None:
        return Response({"error": "date and value are required."}, status=400)

    try:
        datetime.strptime(date, "%Y-%m-%d")
        value = float(value)
    except (ValueError, TypeError):
        return Response({"error": "Invalid date or value."}, status=400)

    entry = Salinity.objects.create(date=date, value=value)
    return Response({"success": True, "id": entry.id, "date": date, "value": value}, status=201)

@csrf_exempt
@api_view(["POST"])
def upload_gis_file(request):

    uploaded_file = request.FILES.get("file")

    if not uploaded_file:
        return Response(
            {"error": "No file uploaded."},
            status=400
        )

    # -------------------------
    # Save uploaded ZIP
    # -------------------------
    upload_dir = os.path.join(settings.BASE_DIR, "uploads", "gis")
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, uploaded_file.name)

    with open(file_path, "wb+") as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)

    shp_file = None
    extracted_files = []

    # -------------------------
    # Extract ZIP
    # -------------------------
    if uploaded_file.name.lower().endswith(".zip"):

        extract_dir = os.path.join(
            settings.BASE_DIR,
            "uploads",
            "temp",
            Path(uploaded_file.name).stem,
        )

        os.makedirs(extract_dir, exist_ok=True)

        with zipfile.ZipFile(file_path, "r") as zip_ref:
            zip_ref.extractall(extract_dir)

        # Search for .shp
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

        # -------------------------
        # Generate PostGIS table name
        # -------------------------
        table_name = (
            Path(uploaded_file.name)
            .stem
            .lower()
            .replace(" ", "_")
            .replace("-", "_")
        )

        # -------------------------
        # Import into PostGIS
        # -------------------------
        cmd = [
            "ogr2ogr",
            "-f", "PostgreSQL",
            "PG:host=localhost port=5432 dbname=water_db user=shreyasisoumya",
            shp_file,
            "-nln", table_name,
            "-overwrite",
        ]

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
        )

        print("========== OGR2OGR ==========")
        print("Return code:", result.returncode)
        print("STDOUT:")
        print(result.stdout)
        print("STDERR:")
        print(result.stderr)
        print("=============================")

        if result.returncode != 0:
            return Response(
                {
                    "success": False,
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                },
                status=500,
            )

    else:
        table_name = None

    # -------------------------
    # Success
    # -------------------------
    return Response({
        "success": True,
        "filename": uploaded_file.name,
        "table_name": table_name,
        "saved_to": file_path,
        "shp_file": shp_file,
        "extracted_files": extracted_files,
    })
@api_view(["GET"])
def water_balance_prediction(request):

    prediction = predict_water_balance()

    return JsonResponse({
        "status": "success",
        "model": "LSTM",
        "predicted_water_balance": prediction,
        "unit": "MCM"
    })

@api_view(["POST"])
def register(request):

    full_name = request.data.get("full_name")
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    role = request.data.get("role")

    # Validate fields
    if not all([full_name, username, email, password, role]):
        return Response({
            "success": False,
            "error": "All fields are required."
        })

    # Check username
    if User.objects.filter(username=username).exists():
        return Response({
            "success": False,
            "error": "Username already exists."
        })

    # Check email
    if User.objects.filter(email=email).exists():
        return Response({
            "success": False,
            "error": "Email already exists."
        })

    # Create Django user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=full_name
    )

    # Create profile
    UserProfile.objects.create(
        user=user,
        full_name=full_name,
        role=role
    )

    return Response({
        "success": True,
        "message": "Registration successful."
    })

@csrf_exempt
@api_view(["POST"])
def add_water_balance(request):
    from threading import Thread
    data = request.data

    try:
        Rr = float(data.get("Rr", 0))
        Re = float(data.get("Re", 0))
        Ri = float(data.get("Ri", 0))
        I = float(data.get("I", 0))
        Si = float(data.get("Si", 0))

        Se = float(data.get("Se", 0))
        O = float(data.get("O", 0))
        Et = float(data.get("Et", 0))
        Dp = float(data.get("Dp", 0))

    except (TypeError, ValueError):
        return Response(
            {"success": False, "error": "Invalid numeric values."},
            status=400,
        )

    delta_s = (Rr + Re + Ri + I + Si) - (Se + O + Et + Dp)

    record = WaterBalance.objects.create(
        Rr=Rr,
        Re=Re,
        Ri=Ri,
        I=I,
        Si=Si,
        Se=Se,
        O=O,
        Et=Et,
        Dp=Dp,
        delta_s=delta_s,
    )
    from ml.dataset_export import export_database_to_training_dataset
    from ml.train import train_model
    print("✅ Water Balance saved to database")
    export_database_to_training_dataset()
    print("🚀 Starting LSTM retraining...")
    Thread(
    target=train_model,
    daemon=True
).start()
    

    return Response(
        {
            "success": True,
            "id": record.id,
            "delta_s": delta_s,
        }
    )
from rest_framework.decorators import api_view
from rest_framework.response import Response
def background_retrain():
    try:
        retrain_model()
        print("✅ LSTM model retrained successfully.")
    except Exception as e:
        print(f"❌ Background training failed: {e}")

@api_view(["POST"])
def upload_dataset(request):
    file = request.FILES.get("file")

    if not file:
        return Response(
            {"success": False, "message": "No file uploaded"},
            status=400
        )

    upload_dir = os.path.join(settings.BASE_DIR, "uploads", "datasets", "active")
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.name)

    with open(file_path, "wb+") as destination:
        for chunk in file.chunks():
            destination.write(chunk)


    from ml.validate import validate_dataset

    validation = validate_dataset(file_path)

    if not validation["valid"]:
        return Response(
            validation,
            status=400
        )   
    active_dataset = set_active_dataset(file_path)
    from ml.retrain import retrain_model

    validation["active_dataset"] = active_dataset

    try:
        df = preprocess_dataset(active_dataset)
        # ---------------------------------------
        # Save processed dataset as active dataset
        # ---------------------------------------

        active_dataset = os.path.join(
            settings.BASE_DIR,
            "ml",
            "data",
            "processed",
            "database_training_data.csv"
        )

        df.to_csv(
            active_dataset,
            index=False
        )
    

    except Exception as e:
        os.remove(file_path)

        return Response(
            {
                "success": False,
                "message": str(e)
            },
            status=400
        )
    archive_dir = os.path.join(
        settings.BASE_DIR,
        "uploads",
        "datasets",
        "archive"
    )

    os.makedirs(
        archive_dir,
        exist_ok=True
    )

    archive_path = os.path.join(
        archive_dir,
        file.name
    )

    import shutil

    shutil.copy(
        file_path,
        archive_path
    )

    total_rows = build_master_dataset()

    dataset = Dataset.objects.create(
        name=file.name,
        file_name=file.name,
        file_path=file_path,
        rows=total_rows,
        columns=len(df.columns),
    )

    threading.Thread(
        target=background_retrain,
        daemon=True
    ).start()

    return Response({

    "success": True,

    "message": "Dataset uploaded successfully.",

    "dataset": {

        "rows": validation["rows"],

        "columns": validation["columns"],

        "date_range": validation["date_range"],

        "missing_values": validation["missing_values"],

        "ready_for_training": True

    }

})

@api_view(["POST"])
def retrain_lstm(request):

    result = retrain_model()

    if result["success"]:
        return Response(result)

    return Response(result, status=500)

@api_view(["GET"])
def ai_dashboard(request):

    from ml.predict import predict_water_balance

    master_dataset = os.path.join(
        settings.BASE_DIR,
        "ml",
        "data",
        "processed",
        "database_training_data.csv"
    )

    rows = 0

    if os.path.exists(master_dataset):
        df = pd.read_csv(master_dataset)
        rows = len(df)

    model_path = os.path.join(
        settings.BASE_DIR,
        "ml",
        "saved_models",
        "water_balance_model.keras"
    )

    scaler_path = os.path.join(
        settings.BASE_DIR,
        "ml",
        "saved_models",
        "water_balance_scaler.pkl"
    )

    model_ready = (
        os.path.exists(model_path)
        and
        os.path.exists(scaler_path)
    )

    prediction = None

    if model_ready:
        try:
            prediction = predict_water_balance()
        except Exception:
            prediction = None

    metrics = {}

    metrics_path = os.path.join(
        settings.BASE_DIR,
        "ml",
        "saved_models",
        "model_metrics.json"
    )

    if os.path.exists(metrics_path):
        with open(metrics_path) as f:
            metrics = json.load(f)

    rmse = metrics.get("water_balance", {}).get("rmse")
    mae = metrics.get("water_balance", {}).get("mae")
    r2 = metrics.get("water_balance", {}).get("r2")

    train_samples = metrics.get("train_samples")
    test_samples = metrics.get("test_samples")

    confidence = None

    if r2 is not None:
        confidence = round(
            max(0, min(r2 * 100, 100)),
            1
        )

    forecast_min = None
    forecast_max = None

    if prediction is not None and rmse is not None:
        forecast_min = round(prediction - rmse, 2)
        forecast_max = round(prediction + rmse, 2)

    last_training = None

    if model_ready:
        last_training = datetime.fromtimestamp(
            os.path.getmtime(model_path)
        ).strftime("%d %b %Y %H:%M")

    dataset_count = Dataset.objects.count()

    return Response({
        "summary": {
            "training_rows": rows,
            "dataset_count": dataset_count,
            "model_ready": model_ready,
            "last_training": last_training,
            "prediction": prediction,
            "confidence": confidence,
            "forecast_min": forecast_min,
            "forecast_max": forecast_max,
            "rmse": rmse,
            "mae": mae,
            "r2": r2,
            "train_samples": train_samples,
            "test_samples": test_samples,
        }
    })

@api_view(["GET"])
def forecast_api(request, period):

    periods = {
        "monthly": 1,
        "quarterly": 3,
        "halfyearly": 6,
        "annual": 12,
        "10years": 120,
        "30years": 360,
    }

    if period not in periods:
        return Response(
            {
                "success": False,
                "message": "Invalid forecast period."
            },
            status=400
        )

    steps = periods[period]

    result = forecast_water_balance(steps)

    return Response({

    "success": True,

    "period": period,

    "steps": steps,

    **result

})

