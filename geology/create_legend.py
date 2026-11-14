
import csv
import json
import colorsys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

input_file = BASE_DIR / "data/geology/mars_geology_units.csv"
output_file = BASE_DIR / "data/geology/mars_geology_legend.json"

legend = []

with open(input_file, "r", encoding="utf-8-sig", newline="") as file:
    reader = csv.DictReader(file)

    for index, row in enumerate(reader):
        # Generate a consistent, distinct visualization colour
        hue = (index * 0.61803398875) % 1
        red, green, blue = colorsys.hsv_to_rgb(hue, 0.62, 0.88)

        color = "#{:02X}{:02X}{:02X}".format(
            round(red * 255),
            round(green * 255),
            round(blue * 255)
        )

        legend.append({
            "unit_id": row["Unit"],
            "label": row["Description"],
            "color": color,
            "region_count": int(row["Region_Count"])
        })

data = {
    "title": "Mars Geological Units Legend",
    "source": "USGS Scientific Investigations Map 3292 (2014)",
    "units": legend
}

with open(output_file, "w", encoding="utf-8") as file:
    json.dump(data, file, indent=2, ensure_ascii=False)

print("Geological legend created successfully!")
print("Total units:", len(legend))
print("Output:", output_file)
