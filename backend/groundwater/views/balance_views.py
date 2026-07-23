from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Avg

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from ..models import Location, WaterBalance


import logging

logger = logging.getLogger(__name__)


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
        "predicted_water_balance": prediction,
        "unit": "MCM"
    })


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def add_water_balance(request):
    data = request.data

    try:
        Rr = float(data.get("Rr", 0))
        Re = float(data.get("Re", 0))
        Ri = float(data.get("Ri", 0))
        I  = float(data.get("I", 0))
        Si = float(data.get("Si", 0))

        Se = float(data.get("Se", 0))
        O  = float(data.get("O", 0))
        Et = float(data.get("Et", 0))
        Dp = float(data.get("Dp", 0))

    except (TypeError, ValueError):
        return Response(
            {"success": False, "error": "Invalid numeric values."},
            status=400,
        )

    location_id = data.get("location")

    if not location_id:
        return Response(
            {
                "success": False,
                "error": "Location is required."
            },
            status=400
        )

    try:
        location = Location.objects.get(id=location_id)
    except Location.DoesNotExist:
        return Response(
            {
                "success": False,
                "error": "Invalid location."
            },
            status=400
        )

    delta_s = (
        Rr + Re + Ri + I + Si
        -
        (Se + O + Et + Dp)
    )

    record = WaterBalance.objects.create(
        location=location,

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

    logger.info(
        "Water balance record saved to database (id=%s)",
        record.id
    )

    # Export datasets
    # Export only this location's dataset
    from ml.dataset_export import export_location_dataset
    rows = export_location_dataset(location.id)

    logger.info(
        "Exported %s rows for location %s",
        rows,
        location.id,
    )

    

    logger.info(
        "Dataset updated for location %s. Model will be retrained before the next prediction.",
        location.id,
    )

    return Response(
    {
        "success": True,
        "id": record.id,
        "delta_s": delta_s,
        "training_triggered": False,
        "message": "Water balance record saved successfully."
    }
)


@api_view(["GET"])
def water_balance_history(request):

    location_id = request.GET.get("location")

    records = WaterBalance.objects.filter(
        location_id=location_id
    ).order_by("-created_at")

    data = []

    for wb in records:

        data.append({
            "id": wb.id,
            "date": wb.created_at.date(),
            "time": wb.created_at.strftime("%H:%M:%S"),
            "delta_s": wb.delta_s,
            "status": "Recharge" if wb.delta_s >= 0 else "Depletion",
            "Rr": wb.Rr,
            "Re": wb.Re,
            "Ri": wb.Ri,
            "I": wb.I,
            "Si": wb.Si,
            "Se": wb.Se,
            "O": wb.O,
            "Et": wb.Et,
            "Dp": wb.Dp,
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