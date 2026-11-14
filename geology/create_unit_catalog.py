
import geopandas as gpd
from pathlib import Path

base = Path(__file__).resolve().parent.parent

input_file = base / "data/processed/mars_geology_simplified.geojson"
output_file = base / "data/processed/mars_geology_units.csv"

gdf = gpd.read_file(input_file)

catalog = (
    gdf.groupby("Unit")
    .agg(
        Description=("UnitDesc", "first"),
        Region_Count=("Unit", "count"),
        Total_Area_km2=("SphArea_km", "sum")
    )
    .reset_index()
    .sort_values("Unit")
)

catalog.to_csv(output_file, index=False)

print("Geological unit catalogue created!")
print("Unique units:", len(catalog))
print("Output:", output_file)
print(catalog.head(10).to_string(index=False))
