from django.http import HttpResponse
from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path("", lambda request: HttpResponse("Water Management Backend Running")),
    path("admin/", admin.site.urls),
    path("api/", include("groundwater.urls")),
]
# Media files (uploaded images) are now served directly from Cloudinary's
# CDN, not from this Django app, so no local media URL/static() serving needed.