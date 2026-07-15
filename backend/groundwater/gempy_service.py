import gempy as gp
import gempy_viewer as gpv
from django.db import connection


def get_wells():
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                latitude,
                longitude,
                depth_m
            FROM groundwater_map
            WHERE latitude IS NOT NULL
              AND longitude IS NOT NULL
              AND depth_m IS NOT NULL;
        """)

        columns = [col[0] for col in cursor.description]

        return [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]


def build_geological_model():
    wells = get_wells()

    model = gp.create_geomodel(
        project_name="Water Management Model",
        extent=[0, 1000, 0, 1000, 0, 500],
        resolution=[20, 20, 10],
        structural_frame=gp.data.StructuralFrame.initialize_default_structure(),
    )

    # Display the 3D viewer
    #gpv.plot_3d(model)

    return {
        "success": True,
        "project": model.meta.name,
        "well_count": len(wells),
        "sample_well": wells[0] if wells else None,
        "message": "GemPy model created successfully."
    }