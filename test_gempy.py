import gempy as gp

geo_model = gp.create_geomodel(
    project_name="My First Model",
    extent=[0, 1000, 0, 1000, 0, 500],
    resolution=[20, 20, 10],
    structural_frame=gp.data.StructuralFrame.initialize_default_structure()
)

print("✅ GeoModel created successfully!")
print(geo_model)