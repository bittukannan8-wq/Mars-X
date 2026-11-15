
import geopandas as gpd
from pathlib import Path

# Input: official USGS Mars geology shapefile
BASE_DIR = Path(__file__).resolve().parent.parent

input_file = (
    BASE_DIR / "data" / "raw" /
    "SIM3292_MarsGlobalGeologicGIS_20M" /
    "SIM3292_Shapefiles" /
    "SIM3292_Global_Geology.shp"
)

output_dir = BASE_DIR / "data" / "processed"
output_dir.mkdir(parents=True, exist_ok=True)

output_file = output_dir / "mars_geology.geojson"

# Load the geology dataset
gdf = gpd.read_file(input_file)

# Keep the important geological information
gdf = gdf[
    ["OBJECTID", "Unit", "UnitDesc", "SphArea_km", "geometry"]
]

# Export while preserving Mars planetary coordinates
gdf.to_file(output_file, driver="GeoJSON")

print("Mars geology processing completed!")
print("Regions:", len(gdf))
print("Unique units:", gdf["Unit"].nunique())
print("Output:", output_file)
print("File size (MB):", round(output_file.stat().st_size / (1024 * 1024), 2))
