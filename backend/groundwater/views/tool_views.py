from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings

from ..models import ToolCard, ToolCardImage

import logging

logger = logging.getLogger(__name__)


def _check_admin_password(request):
    """True if the request carries the correct shared admin password."""
    supplied = request.headers.get("X-Admin-Password") or request.data.get("admin_password")
    return bool(supplied) and supplied == settings.ADMIN_EDIT_PASSWORD


def _serialize_card(card, request):
    return {
        "id": card.id,
        "title": card.title,
        "description": card.description,
        "icon_name": card.icon_name,
        "path": card.path,
        "action_label": card.action_label,
        "is_core": card.is_core,
        "order": card.order,
        "images": [
            {
                "id": img.id,
                "image_url": request.build_absolute_uri(img.image.url) if img.image else None,
                "order": img.order,
            }
            for img in card.images.all()
        ],
    }


@api_view(["GET"])
@permission_classes([AllowAny])
def list_tool_cards(request):
    cards = ToolCard.objects.all().order_by("order", "id")
    data = [_serialize_card(card, request) for card in cards]
    return Response(data)


@api_view(["POST"])
@permission_classes([AllowAny])
def add_tool_card(request):
    if not _check_admin_password(request):
        return Response({"success": False, "message": "Incorrect admin password."}, status=401)

    title = request.data.get("title", "").strip()
    description = request.data.get("description", "").strip()

    if not title:
        return Response({"success": False, "message": "Title is required."}, status=400)

    card = ToolCard.objects.create(title=title, description=description, is_core=False)
    return Response(_serialize_card(card, request), status=201)


@api_view(["PUT"])
@permission_classes([AllowAny])
def edit_tool_card(request, id):
    if not _check_admin_password(request):
        return Response({"success": False, "message": "Incorrect admin password."}, status=401)

    try:
        card = ToolCard.objects.get(id=id)
    except ToolCard.DoesNotExist:
        return Response({"success": False, "message": "Card not found."}, status=404)

    title = request.data.get("title", "").strip()
    description = request.data.get("description", "")

    if not title:
        return Response({"success": False, "message": "Title is required."}, status=400)

    card.title = title
    card.description = description
    card.save()

    return Response(_serialize_card(card, request))


@api_view(["DELETE"])
@permission_classes([AllowAny])
def delete_tool_card(request, id):
    if not _check_admin_password(request):
        return Response({"success": False, "message": "Incorrect admin password."}, status=401)

    try:
        card = ToolCard.objects.get(id=id)
    except ToolCard.DoesNotExist:
        return Response({"success": False, "message": "Card not found."}, status=404)

    if card.is_core:
        return Response(
            {"success": False, "message": "This is a core tool and can't be deleted."},
            status=400,
        )

    card.delete()
    return Response({"success": True, "message": "Card deleted."})


@api_view(["POST"])
@permission_classes([AllowAny])
def add_tool_card_image(request, id):
    if not _check_admin_password(request):
        return Response({"success": False, "message": "Incorrect admin password."}, status=401)

    try:
        card = ToolCard.objects.get(id=id)
    except ToolCard.DoesNotExist:
        return Response({"success": False, "message": "Card not found."}, status=404)

    image_file = request.FILES.get("image")
    if not image_file:
        return Response({"success": False, "message": "No image provided."}, status=400)

    order = card.images.count()
    image = ToolCardImage.objects.create(tool_card=card, image=image_file, order=order)

    return Response(
        {
            "id": image.id,
            "image_url": request.build_absolute_uri(image.image.url),
            "order": image.order,
        },
        status=201,
    )


@api_view(["DELETE"])
@permission_classes([AllowAny])
def delete_tool_card_image(request, image_id):
    if not _check_admin_password(request):
        return Response({"success": False, "message": "Incorrect admin password."}, status=401)

    try:
        image = ToolCardImage.objects.get(id=image_id)
    except ToolCardImage.DoesNotExist:
        return Response({"success": False, "message": "Image not found."}, status=404)

    image.delete()
    return Response({"success": True, "message": "Image deleted."})


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_admin_password(request):
    password = request.data.get("password", "")
    if password and password == settings.ADMIN_EDIT_PASSWORD:
        return Response({"valid": True})
    return Response({"valid": False}, status=401)