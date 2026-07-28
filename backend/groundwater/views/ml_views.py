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
    from ml.predict import predict_water_balance, StaleModelError

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
    needs_retrain = False
    stale_message = None

    if model_ready:
        try:
            prediction = predict_water_balance(int(location_id))
        except StaleModelError as e:
            prediction = None
            needs_retrain = True
            stale_message = str(e)
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
            "needs_retrain": needs_retrain,
            "stale_message": stale_message,
        }
    })

def _build_insights(historical_records, prediction, confidence, avg_delta_s):
    """Generates plain-English analysis for the AI Insights panel."""
    if not historical_records:
        return {"messages": ["Not enough historical data to generate insights."], "trend_pct": 0}

    recent = historical_records[-6:] if len(historical_records) >= 6 else historical_records
    recent_avg = sum(r.delta_s for r in recent) / len(recent)

    pct_change = ((prediction - avg_delta_s) / abs(avg_delta_s)) * 100 if avg_delta_s else 0

    messages = []
    if pct_change > 10:
        messages.append(
            f"The predicted water balance is trending upward, roughly {pct_change:.1f}% above the historical average."
        )
    elif pct_change < -10:
        messages.append(
            f"The predicted water balance is trending downward, roughly {abs(pct_change):.1f}% below the historical average."
        )
    else:
        messages.append("The predicted water balance is broadly in line with historical levels, showing no strong trend.")

    if prediction < 0 and recent_avg >= 0:
        messages.append("The model forecasts a shift from recharge to depletion — groundwater levels may decline in the coming period.")
    elif prediction >= 0 and recent_avg < 0:
        messages.append("The model forecasts a recovery from recent depletion toward a positive water balance.")

    if confidence is not None:
        if confidence >= 75:
            messages.append(f"Model confidence is {confidence}%, so this forecast can be considered reasonably reliable.")
        elif confidence >= 50:
            messages.append(f"Model confidence is moderate ({confidence}%) — treat this forecast as indicative rather than precise.")
        else:
            messages.append(f"Model confidence is low ({confidence}%). Consider adding more historical records or retraining.")

    return {"messages": messages, "trend_pct": round(pct_change, 1)}

@api_view(["GET"])
def forecast_api(request, period):
    from ml.predict import predict_water_balance, StaleModelError
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
    except StaleModelError as e:
        logger.warning("Stale model for location %s: %s", location.id, e)

        return Response(
            {
                "success": False,
                "message": str(e),
                "needs_retrain": True,
            },
            status=409
        )
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
    historical_qs = (
        WaterBalance.objects
        .filter(location=location)
        .order_by("entry_date", "created_at")
    )
    historical_records = list(historical_qs)
    historical_series = [
        {"date": str(r.entry_date), "actual": r.delta_s}
        for r in historical_records[-12:]
    ]
    avg_delta_s = (
        sum(r.delta_s for r in historical_records) / len(historical_records)
        if historical_records else 0
    )

    last_training = None
    if os.path.exists(model_path):
        last_training = datetime.fromtimestamp(
            os.path.getmtime(model_path)
        ).strftime("%d %b %Y %H:%M")
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

    insights_data = _build_insights(
        historical_records=historical_records,
        prediction=prediction,
        confidence=confidence,
        avg_delta_s=avg_delta_s,
    )

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
        "historical": historical_series,
        "insights": insights_data["messages"],
        "trend_pct": insights_data["trend_pct"],
        "last_training": last_training,
        "model_ready": os.path.exists(model_path),
    }

    return Response({
        "success": True,
        "location": location.name,
        "period": period,
        "steps": steps,
        **result
    })

@api_view(["GET"])
def stale_locations(request):
    """Returns every location that predict_water_balance would refuse
    to serve a prediction for - i.e. flagged needs_retrain=True, OR
    missing an MLModelState row entirely, OR missing a
    parameter_signature in its model_config.json. Mirrors the exact
    checks in ml/predict.py's _check_not_stale so this list can never
    disagree with what prediction actually blocks on."""
    import json
    from pathlib import Path
    from django.conf import settings
    from ..models import MLModelState, Location

    stale = []

    for location in Location.objects.all():
        state = MLModelState.objects.filter(location_id=location.id).first()

        config_path = (
            Path(settings.BASE_DIR) / "ml" / "saved_models"
            / f"location_{location.id}" / "model_config.json"
        )

        model_exists = config_path.exists()

        if not model_exists:
            # No model trained yet at all - not "stale", just not ready.
            # Don't include in the retrain list (nothing to retrain);
            # ai_dashboard's model_ready flag already communicates this.
            continue

        is_stale = False
        reason = None

        if state is None:
            is_stale = True
            reason = "No training record found."
        elif state.needs_retrain:
            is_stale = True
            reason = "Parameters changed since last training."
        else:
            try:
                with open(config_path) as f:
                    config = json.load(f)
                if not config.get("parameter_signature"):
                    is_stale = True
                    reason = "Model predates parameter tracking."
            except Exception:
                is_stale = True
                reason = "Model config could not be read."

        if is_stale:
            stale.append({
                "location_id": location.id,
                "location_name": location.name,
                "last_retrained_at": state.last_retrained_at if state else None,
                "reason": reason,
            })

    return Response({"stale_locations": stale, "count": len(stale)})


@api_view(["POST"])
def retrain_all_stale(request):
    from ml.dataset_export import export_location_dataset
    from ml.retrain import retrain_model
    from ..models import MLModelState, Location
    import json
    from pathlib import Path
    from django.conf import settings

    # Reuse the exact same "is this stale" definition as stale_locations,
    # so retrain-all can never miss something the banner shows (or vice versa).
    stale_ids = []
    for location in Location.objects.all():
        state = MLModelState.objects.filter(location_id=location.id).first()
        config_path = (
            Path(settings.BASE_DIR) / "ml" / "saved_models"
            / f"location_{location.id}" / "model_config.json"
        )
        if not config_path.exists():
            continue
        if state is None or state.needs_retrain:
            stale_ids.append(location.id)
            continue
        try:
            with open(config_path) as f:
                config = json.load(f)
            if not config.get("parameter_signature"):
                stale_ids.append(location.id)
        except Exception:
            stale_ids.append(location.id)

    results = []
    for location_id in stale_ids:
        rows = export_location_dataset(location_id)
        if rows < 8:
            results.append({
                "location_id": location_id,
                "success": False,
                "message": f"Need at least 8 records. Only {rows} available.",
            })
            continue
        result = retrain_model(location_id)
        results.append({"location_id": location_id, **result})

    succeeded = sum(1 for r in results if r.get("success"))
    return Response({
        "success": True,
        "message": f"Retrained {succeeded} of {len(stale_ids)} stale location(s).",
        "results": results,
    })