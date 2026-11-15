
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

geojson_file = BASE_DIR / "data/geology/mars_geology_simplified.geojson"
legend_file = BASE_DIR / "data/geology/mars_geology_legend.json"
output_file = BASE_DIR / "data/geology/mars_geology_sample.geojson"

# Load the geological map
with open(geojson_file, "r", encoding="utf-8") as file:
    geology = json.load(file)

# Load the colour legend
with open(legend_file, "r", encoding="utf-8") as file:
    legend_data = json.load(file)

# Match each geological unit with its colour
color_lookup = {
    item["unit_id"]: item["color"]
    for item in legend_data["units"]
}

# Select one real geological polygon
original = geology["features"][0]
old_properties = original["properties"]

unit_id = old_properties["Unit"]

sample_feature = {
    "type": "Feature",
    "geometry": original["geometry"],
    "properties": {
        "region_id": old_properties["OBJECTID"],
        "unit_id": unit_id,
        "description": old_properties["UnitDesc"],
        "area_km2": old_properties["SphArea_km"],
        "color": color_lookup[unit_id],
        "source": "USGS Scientific Investigations Map 3292 (2014)"
    }
}

sample = {
    "type": "FeatureCollection",
    "features": [sample_feature]
}

with open(output_file, "w", encoding="utf-8") as file:
    json.dump(sample, file, indent=2, ensure_ascii=False)

print("Sample GeoJSON created successfully!")
print("Unit ID:", unit_id)
print("Description:", old_properties["UnitDesc"])
print("Colour:", color_lookup[unit_id])
print("Output:", output_file)
