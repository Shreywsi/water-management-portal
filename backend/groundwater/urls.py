from django.urls import path
from .views import (
    dashboard,
    open_qgis,
    wells,
    waterlevel,
    pumping,
    well_detail,
    add_water_level,
)

urlpatterns = [
    path("dashboard/", dashboard),
    path("wells/", wells),
    path("wells/<int:well_id>/", well_detail),
    path("waterlevel/", waterlevel),
    path("pumping/", pumping),
    path("open-qgis/", open_qgis),
    path("water-level/add/", add_water_level),
]