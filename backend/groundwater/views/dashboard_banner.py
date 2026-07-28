from django.conf import settings

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..models import DashboardBanner


def _check_admin_password(request):
    supplied = (
        request.headers.get("X-Admin-Password")
        or request.data.get("admin_password")
    )
    return bool(supplied) and supplied == settings.ADMIN_EDIT_PASSWORD


@api_view(["GET"])
@permission_classes([AllowAny])
def get_dashboard_banner(request):
    banners = DashboardBanner.objects.all().order_by("id")

    return Response([
        {
            "id": banner.id,
            "image_url": request.build_absolute_uri(banner.image.url),
        }
        for banner in banners
    ])


@api_view(["POST"])
@permission_classes([AllowAny])
def upload_dashboard_banner(request):

    if not _check_admin_password(request):
        return Response(
            {
                "success": False,
                "message": "Incorrect password.",
            },
            status=401,
        )

    image = request.FILES.get("image")

    if not image:
        return Response(
            {
                "success": False,
                "message": "No image provided.",
            },
            status=400,
        )

    

    banner = DashboardBanner.objects.create(
        image=image,
    )

    return Response(
        {
            "id": banner.id,
            "image_url": request.build_absolute_uri(
                banner.image.url
            ),
        },
        status=201,
    )


@api_view(["DELETE"])
@permission_classes([AllowAny])
def delete_dashboard_banner(request, image_id):

    if not _check_admin_password(request):
        return Response(
            {
                "success": False,
                "message": "Incorrect password.",
            },
            status=401,
        )

    try:
        banner = DashboardBanner.objects.get(id=image_id)
    except DashboardBanner.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Banner not found.",
            },
            status=404,
        )

    banner.delete()

    return Response({"success": True})