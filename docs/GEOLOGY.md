# MARS-X – Geological Mapping Module

## 1. Overview
The Geological Mapping module provides geological information about the Martian surface using USGS–NASA planetary geological mapping data.

## 2. Dataset Summary

| Parameter | Details |
|---|---|
| Planet | Mars |
| Geological regions | 1,311 |
| Geological units | 44 |
| Geometry type | Polygon |
| Coordinate reference | CRS84 / EPSG:4326 |
| Longitude range | Approximately -180° to 180° |
| Latitude range | Approximately -90° to 90° |

## 3. Data Attributes

The simplified GeoJSON contains the following properties:

- OBJECTID – Feature identifier
- Unit – Geological unit code
- UnitDesc – Geological unit description
- SphArea_km – Spherical area information

## 4. Project Data Files

Located in `data/geology/`:

- `mars_geology_simplified.geojson` – Simplified geological polygon dataset.
- `mars_geology_units.csv` – Catalogue of geological units, descriptions, region counts and total areas.
- `mars_geology_legend.json` – Geological map legend.
- `mars_geology_sample.geojson` – Sample geological data.

## 5. Data Validation

The following checks were performed:

- Confirmed 1,311 geological features.
- Confirmed 44 geological units in the catalogue.
- Verified Polygon geometries.
- Checked CRS information and coordinate bounds.
- Compared processed and repository GeoJSON properties and geometries.
- Confirmed the processed and repository CSV files are identical.

## 6. Map Integration

The geological dataset was integrated into the Mars map module by Member 2 (Radhika).

The integration update reported:

- Geological polygons displayed over Mars elevation tiles.
- Geological unit search tested.
- Polygon highlighting tested.
- Region information popups tested.
- Coordinate alignment validation still in progress.

## 7. Data Source

USGS–NASA Planetary Geologic Mapping Program.

Exact source dataset URL and processing methodology should be added after confirming the original download and processing records.

## 8. Future Validation

- Complete coordinate alignment testing with Mars elevation tiles.
- Verify geological boundaries against the source map.
- Confirm geological unit descriptions and popup information.
- Complete integration testing with the project backend.

---
MARS-X | Geological Mapping | Member 3
