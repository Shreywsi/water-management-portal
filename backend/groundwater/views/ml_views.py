import os
import json
from datetime import datetime

import pandas as pd

from django.conf import settings

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response

from ..models import Dataset, Location, WaterBalance

import logging

logger = logging.getLogger(__name__)


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def run_gempy(request):
    from ..gempy_service import build_geological_model
    result = build_geological_model()
    return Response(result)


@api_view(["POST"])
def run_modflow_view(request):
    from ..gempy_service import build_geological_model
    from ..modflow_service import run_modflow

    geology = build_geological_model()
    modflow = run_modflow()

    return Response({
        "success": True,
        "gempy": geology,
        "modflow": modflow
    })


@api_view(["POST"])


def retrain_lstm(request):
    try:
        location_id = int(request.data.get("location"))
    except (TypeError, ValueError):
        return Response(
            {
                "success": False,
                "message": "Invalid location."
            },
            status=400
        )

    if not location_id:

        return Response(
            {
                "success": False,
                "message": "Location required."
            },
            status=400
        )

    from ml.dataset_export import export_location_dataset
    from ml.retrain import retrain_model

    rows = export_location_dataset(location_id)

    if rows < 8:
        return Response(
            {
                "success": False,
                "message": f"Need at least 8 records. Only {rows} available."
            },
            status=400
        )

    result = retrain_model(location_id)

    if result["success"]:
        return Response(result)

    return Response(result, status=500)


@api_view(["GET"])
def ai_dashboard(request):
    from ml.predict import predict_water_balance

    location_id = request.GET.get("location")

    if not location_id:
        return Response({
            "success": False,
            "message": "Location is required."
        }, status=400)

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

    model_dir = os.path.join(
        settings.BASE_DIR,
        "ml",
        "saved_models",
        f"location_{location_id}",
    )

    model_path = os.path.join(model_dir, "water_balance_model.keras")
    scaler_path = os.path.join(model_dir, "water_balance_scaler.pkl")

    model_ready = (
        os.path.exists(model_path)
        and
        os.path.exists(scaler_path)
    )

    prediction = None

    if model_ready:
        try:
            prediction = predict_water_balance(int(location_id))
        except Exception:
            prediction = None

    metrics = {}
    metrics_path = os.path.join(model_dir, "model_metrics.json")

    if os.path.exists(metrics_path):
        with open(metrics_path) as f:
            metrics = json.load(f)

    if "water_balance" in metrics:
        wm = metrics["water_balance"]
    else:
        wm = metrics

    rmse = wm.get("rmse")
    mae = wm.get("mae")
    r2 = wm.get("r2")

    train_samples = metrics.get("train_samples")
    test_samples = metrics.get("test_samples")

    confidence = None

    if r2 is not None:
        confidence = round(max(0, min(r2 * 100, 100)), 1)

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
    from ml.predict import predict_water_balance
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

    location_id = request.GET.get("location")

    if not location_id:
        return Response(
            {
                "success": False,
                "message": "Location is required."
            },
            status=400
        )

    try:
        location = Location.objects.get(id=location_id)
    except Location.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Invalid location."
            },
            status=400
        )
    from ml.dataset_export import export_location_dataset
    from ml.train import train_model

    model_dir = os.path.join(
        settings.BASE_DIR,
        "ml",
        "saved_models",
        f"location_{location.id}",
    )

    model_path = os.path.join(
        model_dir,
        "water_balance_model.keras",
    )
    steps = periods[period]
    if not os.path.exists(model_path):

        rows = export_location_dataset(location.id)

        if rows >= 8:
            logger.info(
                "No model found. Training Location %s...",
                location.id,
            )

            train_model(location.id)
        

    try:
        print("Predicting for location:", location.id)
        forecast = predict_water_balance(
            location.id,
            steps
        )

        prediction = forecast[-1]
    except Exception as e:
        logger.exception("Prediction failed")

        return Response(
            {
                "success": False,
                "message": str(e)
            },
            status=500
        )
    metrics_path = os.path.join(
    settings.BASE_DIR,
    "ml",
    "saved_models",
    f"location_{location.id}",
    "model_metrics.json",
)

    metrics = {}

    if os.path.exists(metrics_path):
        with open(metrics_path) as f:
            metrics = json.load(f)

    record_count = WaterBalance.objects.filter(
        location=location
    ).count()

    if "water_balance" in metrics:
        wm = metrics["water_balance"]
    else:
        wm = metrics

    rmse = wm.get("rmse")
    mae = wm.get("mae")
    r2 = wm.get("r2")

    # -------------------------
    # Confidence
    # -------------------------

    # -------------------------
# Confidence
    # -------------------------

    if r2 is None:
        confidence = None
        confidence_level = "Insufficient data"

    else:
        confidence = round(max(0, min(r2 * 100, 100)), 1)

        if confidence >= 90:
            confidence_level = "Very High"

        elif confidence >= 75:
            confidence_level = "High"

        elif confidence >= 50:
            confidence_level = "Medium"

        else:
            confidence_level = "Low"

    # -------------------------
    # Prediction Range
    # -------------------------

    if rmse is None:

        lower = prediction

        upper = prediction

    else:

        lower = round(prediction - rmse, 2)

        upper = round(prediction + rmse, 2)

    result = {

    "prediction": prediction,

    "forecast": forecast,
        "confidence": confidence,

        "confidence_level": confidence_level,

        "prediction_range": {

            "lower": lower,

            "upper": upper,

        },

        "years_of_history": record_count,

        "model_metrics": metrics,

    }

    return Response({
        "success": True,
        "location": location.name,
        "period": period,
        "steps": steps,
        **result
    })