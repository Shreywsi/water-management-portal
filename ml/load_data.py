import pandas as pd
import psycopg2

conn = psycopg2.connect(
    dbname="water_db",
    user="shreyasisoumya",
    password="",
    host="localhost",
    port="5432"
)

query = """
SELECT
    g.time,
    w.well_name,
    w.village,
    g.water_level_m,
    r.rainfall_mm
FROM groundwater_levels g

JOIN wells w
ON g.well_id = w.id

LEFT JOIN rainfall r
ON DATE(g.time) = DATE(r.time)
AND LOWER(w.village) = LOWER(r.station_name)

ORDER BY g.time;
"""

df = pd.read_sql(query, conn)

conn.close()

print(df.head())

print("\nRows:", len(df))

df.to_csv(
    "ml/data/processed/database_training_data.csv",
    index=False
)

print("\nDatabase dataset exported successfully.")