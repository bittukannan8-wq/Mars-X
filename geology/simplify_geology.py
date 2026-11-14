
import geopandas as gpd
from pathlib import Path

base = Path(__file__).resolve().parent.parent

source = base / "data/processed/mars_geology.geojson"
output = base / "data/processed/mars_geology_simplified.geojson"

print("Loading original geology map...")
gdf = gpd.read_file(source)

print("Simplifying polygon boundaries...")
gdf["geometry"] = gdf.geometry.simplify(
    tolerance=0.01,
    preserve_topology=True
)

print("Saving simplified map...")
gdf.to_file(output, driver="GeoJSON")

print("Original regions:", len(gdf))
print("Simplified regions:", len(gpd.read_file(output)))
print("Simplified file size (MB):",
      round(output.stat().st_size / (1024 * 1024), 2))
print("Done!")
