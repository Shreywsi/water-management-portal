from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Avg

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from ..models import Location, WaterBalance, Parameter, MLModelState
from datetime import date as date_cls
import logging

logger = logging.getLogger(__name__)


# ============================================================
# PARAMETER ENDPOINTS (new)
# ============================================================

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def parameter_list(request):

    if request.method == "GET":
        params = Parameter.objects.filter(is_active=True)
        data = [
            {
                "id": p.id,
                "key": p.key,
                "label": p.label,
                "category": p.category,
                "order": p.order,
            }
            for p in params
        ]
        return Response(data)

    data = request.data
    key = (data.get("key") or "").strip()
    label = (data.get("label") or "").strip()
    category = (data.get("category") or "").strip().lower()

    if not key or not label:
        return Response(
            {"success": False, "error": "Both 'key' and 'label' are required."},
            status=400,
        )

    if category not in ("inflow", "outflow"):
        return Response(
            {"success": False, "error": "'category' must be 'inflow' or 'outflow'."},
            status=400,
        )

    if Parameter.objects.filter(key=key).exists():
        return Response(
            {"success": False, "error": f"A parameter with key '{key}' already exists."},
            status=400,
        )

    max_order = (
        Parameter.objects.filter(category=category)
        .order_by("-order")
        .values_list("order", flat=True)
        .first()
        or 0
    )

    param = Parameter.objects.create(
        key=key, label=label, category=category, order=max_order + 1, is_active=True
    )

    _flag_all_locations_for_retrain()

    return Response(
        {
            "success": True,
            "id": param.id,
            "key": param.key,
            "label": param.label,
            "category": param.category,
        },
        status=201,
    )


@api_view(["DELETE"])
@permission_classes([AllowAny])
def parameter_delete(request, id):
    try:
        param = Parameter.objects.get(id=id)
    except Parameter.DoesNotExist:
        return Response({"success": False, "error": "Parameter not found."}, status=404)

    param.is_active = False
    param.save(update_fields=["is_active"])

    _flag_all_locations_for_retrain()

    return Response({"success": True, "message": f"Parameter '{param.key}' deleted."})


def _flag_all_locations_for_retrain():
    MLModelState.objects.update(needs_retrain=True)


# ============================================================
# WATER BALANCE ENDPOINTS
# ============================================================

@api_view(["GET"])
def water_balance_prediction(request):
    location_id = request.GET.get("location")

    if not location_id:
        return JsonResponse({
            "success": False,
            "message": "Location is required."
        }, status=400)
    try:
        location_id = int(location_id)
    except ValueError:
        return JsonResponse(
            {
                "success": False,
                "message": "Invalid location."
            },
            status=400
        )

    return JsonResponse({
        "status": "success",
        "model": "LSTM",
        "unit": "MCM"
    })


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def add_water_balance(request):
    data = request.data

    raw_values = data.get("values")
    if not isinstance(raw_values, dict) or not raw_values:
        return Response(
            {"success": False, "error": "'values' must be a non-empty object of {parameter_key: number}."},
            status=400,
        )

    location_id = data.get("location")
    if not location_id:
        return Response({"success": False, "error": "Location is required."}, status=400)

    try:
        location = Location.objects.get(id=location_id)
    except Location.DoesNotExist:
        return Response({"success": False, "error": "Invalid location."}, status=400)

    # ---- entry_date: which period these values represent ----
    raw_date = data.get("date")
    if raw_date:
        try:
            entry_date = date_cls.fromisoformat(raw_date)  # expects "YYYY-MM-DD"
        except ValueError:
            return Response(
                {"success": False, "error": "'date' must be in YYYY-MM-DD format."},
                status=400,
            )
    else:
        entry_date = date_cls.today()

    active_params = {p.key: p for p in Parameter.objects.filter(is_active=True)}

    clean_values = {}
    unknown_keys = []

    for key, raw in raw_values.items():
        if key not in active_params:
            unknown_keys.append(key)
            continue
        try:
            clean_values[key] = float(raw)
        except (TypeError, ValueError):
            return Response(
                {"success": False, "error": f"Value for '{key}' is not numeric."},
                status=400,
            )

    if unknown_keys:
        return Response(
            {
                "success": False,
                "error": f"Unknown or inactive parameter key(s): {', '.join(unknown_keys)}.",
            },
            status=400,
        )

    inflow_total = sum(
        v for k, v in clean_values.items() if active_params[k].category == "inflow"
    )
    outflow_total = sum(
        v for k, v in clean_values.items() if active_params[k].category == "outflow"
    )
    delta_s = inflow_total - outflow_total

    record = WaterBalance.objects.create(
        location=location,
        entry_date=entry_date,
        values=clean_values,
        delta_s=delta_s,
    )

    logger.info("Water balance record saved to database (id=%s)", record.id)

    try:
        from ml.dataset_export import export_location_dataset
        rows = export_location_dataset(location.id)
        logger.info("Exported %s rows for location %s", rows, location.id)
    except Exception:
        logger.exception(
            "Dataset export failed for location %s (record was still saved).",
            location.id,
        )

    return Response(
        {
            "success": True,
            "id": record.id,
            "delta_s": delta_s,
            "date": str(entry_date),
            "message": "Water balance record saved successfully.",
        }
    )


@api_view(["GET"])
def water_balance_history(request):

    location_id = request.GET.get("location")

    records = WaterBalance.objects.filter(
        location_id=location_id
    ).order_by("-entry_date", "-created_at")

    data = []

    for wb in records:
        data.append({
            "id": wb.id,
            "date": wb.entry_date,
            "time": wb.created_at.strftime("%H:%M:%S"),
            "delta_s": wb.delta_s,
            "status": "Recharge" if wb.delta_s >= 0 else "Depletion",
            "values": wb.values,
        })

    summary = {
        "total_records": records.count(),
        "average_delta_s": records.aggregate(
            Avg("delta_s")
        )["delta_s__avg"] or 0,
        "recharge_days": records.filter(delta_s__gte=0).count(),
        "depletion_days": records.filter(delta_s__lt=0).count(),
    }

    return Response({
        "summary": summary,
        "records": data
    })