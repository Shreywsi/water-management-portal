from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
import csv

from ..models import Well
from ..serializers import WellSerializer


@api_view(["GET"])
def list_wells(request):
    wells = Well.objects.prefetch_related("parameters").all()
    serializer = WellSerializer(wells, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def add_well(request):
    serializer = WellSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                "success": True,
                "message": "Well added successfully."
            }
        )

    return Response(
        {
            "success": False,
            "errors": serializer.errors
        },
        status=400,
    )

@api_view(["PUT"])
def update_well(request, pk):
    well = get_object_or_404(Well, pk=pk)

    serializer = WellSerializer(
        well,
        data=request.data,
        partial=True,
    )

    if serializer.is_valid():
        serializer.save()

        return Response({
            "success": True,
            "message": "Well updated successfully."
        })

    return Response(
        {
            "success": False,
            "errors": serializer.errors,
        },
        status=400,
    )

@api_view(["DELETE"])
def delete_well(request, pk):
    well = get_object_or_404(Well, pk=pk)
    well.delete()

    return Response(
        {
            "success": True,
            "message": "Well deleted."
        }
    )


@api_view(["GET"])
def export_wells(request):
    wells = Well.objects.prefetch_related("parameters")

    location = request.GET.get("location")
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")
    selected_parameters = request.GET.get("parameters")

    if location:
        wells = wells.filter(location_id=location)

    if start_date:
        wells = wells.filter(observation_date__gte=start_date)

    if end_date:
        wells = wells.filter(observation_date__lte=end_date)

    all_parameters = sorted({
        p.parameter_name
        for well in wells
        for p in well.parameters.all()
    })

    if selected_parameters:
        parameter_names = [
            p.strip()
            for p in selected_parameters.split(",")
        ]
    else:
        parameter_names = all_parameters

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = (
    'attachment; filename="well_export.csv"'
)

    writer = csv.writer(response)

    header = [
    "well_id",
    "location",
    "observation_date",
    "latitude",
    "longitude",
    *parameter_names,
]

    writer.writerow(header)

    for well in wells:

        values = {
            p.parameter_name: p.parameter_value
            for p in well.parameters.all()
        }

        row = [
            well.well_id,
            well.location.name,
            well.observation_date,
            well.latitude,
            well.longitude,
        ]

        for parameter in parameter_names:
            row.append(values.get(parameter, ""))

        writer.writerow(row)

    return response