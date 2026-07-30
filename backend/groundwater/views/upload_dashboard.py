import mimetypes

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response

from groundwater.models import ResourceFolder, ResourceFile


def _check_admin_password(request):
    supplied = (
        request.headers.get("X-Admin-Password")
        or request.data.get("admin_password")
    )
    return bool(supplied) and supplied == settings.ADMIN_EDIT_PASSWORD


@csrf_exempt
@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def resource_folders(request):
    if request.method == "GET":
        folders = ResourceFolder.objects.all().order_by("name")
        data = [
            {
                "id": f.id,
                "name": f.name,
                "description": f.description,
                "file_count": f.files.count(),
                "created_at": f.created_at,
            }
            for f in folders
        ]
        return Response(data)

    if not _check_admin_password(request):
        return Response({"error": "Incorrect password."}, status=401)

    name = request.data.get("name")
    description = request.data.get("description", "")

    if not name:
        return Response({"error": "Folder name is required."}, status=400)

    if ResourceFolder.objects.filter(name=name).exists():
        return Response({"error": "A folder with this name already exists."}, status=400)

    folder = ResourceFolder.objects.create(
        name=name,
        description=description,
        created_by=request.user if request.user.is_authenticated else None,
    )

    return Response(
        {
            "id": folder.id,
            "name": folder.name,
            "description": folder.description,
            "file_count": 0,
            "created_at": folder.created_at,
        },
        status=201,
    )


@csrf_exempt
@api_view(["GET", "DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def resource_folder_detail(request, folder_id):
    try:
        folder = ResourceFolder.objects.get(id=folder_id)
    except ResourceFolder.DoesNotExist:
        return Response({"error": "Folder not found."}, status=404)

    if request.method == "DELETE":
        if not _check_admin_password(request):
            return Response({"error": "Incorrect password."}, status=401)
        folder.delete()
        return Response({"success": True})

    files = [
        {
            "id": file.id,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file.size,
            "uploaded_at": file.uploaded_at,
        }
        for file in folder.files.all().order_by("filename")
    ]

    return Response(
        {
            "id": folder.id,
            "name": folder.name,
            "description": folder.description,
            "created_at": folder.created_at,
            "files": files,
        }
    )


@csrf_exempt
@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def resource_upload_files(request, folder_id):
    if not _check_admin_password(request):
        return Response({"error": "Incorrect password."}, status=401)

    try:
        folder = ResourceFolder.objects.get(id=folder_id)
    except ResourceFolder.DoesNotExist:
        return Response({"error": "Folder not found."}, status=404)

    uploaded_files = request.FILES.getlist("files")

    if not uploaded_files:
        return Response({"error": "No files uploaded."}, status=400)

    # sent when uploading a whole folder from the browser, to preserve subfolder structure
    relative_paths = request.data.getlist("relative_paths")

    created = []
    for index, uploaded_file in enumerate(uploaded_files):
        relative_path = (
            relative_paths[index] if index < len(relative_paths) else uploaded_file.name
        )

        resource_file = ResourceFile.objects.create(
            folder=folder,
            filename=relative_path,
            content_type=(
                uploaded_file.content_type
                or mimetypes.guess_type(uploaded_file.name)[0]
                or "application/octet-stream"
            ),
            size=uploaded_file.size,
            data=uploaded_file.read(),
            uploaded_by=request.user if request.user.is_authenticated else None,
        )

        created.append({"id": resource_file.id, "filename": resource_file.filename, "size": resource_file.size})

    return Response({"success": True, "uploaded": created}, status=201)


@csrf_exempt
@api_view(["GET", "DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def resource_file_detail(request, file_id):
    try:
        resource_file = ResourceFile.objects.get(id=file_id)
    except ResourceFile.DoesNotExist:
        return Response({"error": "File not found."}, status=404)

    if request.method == "DELETE":
        if not _check_admin_password(request):
            return Response({"error": "Incorrect password."}, status=401)
        resource_file.delete()
        return Response({"success": True})

    response = HttpResponse(resource_file.data, content_type=resource_file.content_type)
    response["Content-Disposition"] = f'attachment; filename="{resource_file.filename.split("/")[-1]}"'
    return response