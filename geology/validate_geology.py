
import json
import geopandas as gpd
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data" / "geology"

map_file = DATA / "mars_geology_simplified.geojson"
units_file = DATA / "mars_geology_units.csv"
legend_file = DATA / "mars_geology_legend.json"
sample_file = DATA / "mars_geology_sample.geojson"

print("VALIDATING MARS GEOLOGY DATA\n")

# 1. Validate complete geological map
gdf = gpd.read_file(map_file)

print("1. GEOLOGICAL MAP")
print("Polygons:", len(gdf))
print("Unique units:", gdf["Unit"].nunique())
print("Missing descriptions:", gdf["UnitDesc"].isna().sum())
print("Invalid geometries:", (~gdf.geometry.is_valid).sum())
print("Empty geometries:", gdf.geometry.is_empty.sum())

# 2. Validate legend
with open(legend_file, encoding="utf-8") as f:
    legend = json.load(f)

colors = [item["color"] for item in legend["units"]]
legend_units = {item["unit_id"] for item in legend["units"]}

print("\n2. COLOUR LEGEND")
print("Legend entries:", len(legend["units"]))
print("Unique colours:", len(set(colors)))
print("Legend units match map:", legend_units == set(gdf["Unit"]))

# 3. Validate sample
with open(sample_file, encoding="utf-8") as f:
    sample = json.load(f)

print("\n3. SAMPLE GEOJSON")
print("Sample features:", len(sample["features"]))
print("Sample unit:", sample["features"][0]["properties"]["unit_id"])

# 4. Final checks
checks = {
    "1311 polygons": len(gdf) == 1311,
    "44 geological units": gdf["Unit"].nunique() == 44,
    "No missing descriptions": gdf["UnitDesc"].isna().sum() == 0,
    "No invalid geometries": gdf.geometry.is_valid.all(),
    "44 legend entries": len(legend["units"]) == 44,
    "44 unique colours": len(set(colors)) == 44,
    "Legend matches map": legend_units == set(gdf["Unit"]),
    "One sample feature": len(sample["features"]) == 1
}

print("\n4. FINAL VALIDATION")
for name, passed in checks.items():
    print(("PASS" if passed else "FAIL"), "-", name)

if not all(checks.values()):
    raise SystemExit("\nValidation failed. Check the results above.")

print("\nALL CHECKS PASSED!")
print("Note: Confirm Mars coordinate alignment with Radhika's map.")
