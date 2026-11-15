
const DATA_URL = "../../data/geology/mars_geology_simplified.geojson";

const map = L.map("map", {
    crs: L.CRS.EPSG4326,
    minZoom: -3,
    maxZoom: 8,
    zoomControl: true
});

map.setView([0, 0], 0);

const status = document.getElementById("status");
const details = document.getElementById("unit-details");
const legend = document.getElementById("legend");
const search = document.getElementById("unit-search");
const count = document.getElementById("feature-count");

const palette = [
    "#e76f51", "#f4a261", "#e9c46a",
    "#8ab17d", "#6d9dc5", "#b07bac",
    "#d77a61", "#a8a29e", "#c08497",
    "#65a6a1", "#d4a373", "#9277b5"
];

let geologyLayer;
let allFeatures = [];
let selectedLayer = null;

function getUnitCode(feature) {
    const properties = feature.properties || {};
    return String(properties.Unit || "Unclassified");
}

function getUnitName(feature) {
    const properties = feature.properties || {};
    return String(properties.UnitDesc || getUnitCode(feature));
}

function colorFor(value) {
    let hash = 0;

    for (const character of value) {
        hash = (hash * 31 + character.charCodeAt(0)) | 0;
    }

    return palette[Math.abs(hash) % palette.length];
}

function showDetails(feature) {
    const properties = feature.properties || {};

    details.replaceChildren();

    const heading = document.createElement("h4");
    heading.textContent = getUnitName(feature);
    heading.style.color = "#ff9878";
    details.appendChild(heading);

    const fields = [
        ["Geological Unit", getUnitCode(feature)],
        ["Description", getUnitName(feature)],
        ["Region ID", properties.OBJECTID],
        ["Surface Area (km²)", properties.SphArea_km]
    ];

    fields.forEach(([label, value]) => {
        const line = document.createElement("p");
        line.textContent = `${label}: ${value ?? "N/A"}`;
        details.appendChild(line);
    });
}

function createLegend(features) {
    legend.replaceChildren();

    const units = new Map();

    features.forEach(feature => {
        const code = getUnitCode(feature);
        const name = getUnitName(feature);

        if (!units.has(code)) {
            units.set(code, name);
        }
    });

    [...units.entries()].sort((a, b) =>
        a[1].localeCompare(b[1])
    ).forEach(([code, name]) => {

        const item = document.createElement("div");
        item.className = "legend-item";

        const swatch = document.createElement("span");
        swatch.className = "legend-color";
        swatch.style.backgroundColor = colorFor(code);

        const label = document.createElement("span");
        label.textContent = name;

        item.append(swatch, label);
        legend.appendChild(item);
    });
}

function featureStyle(feature) {
    return {
        color: "#ffffff",
        weight: 0.45,
        fillColor: colorFor(getUnitCode(feature)),
        fillOpacity: 0.78
    };
}

function onFeature(feature, layer) {
    layer.on("click", () => {

        if (selectedLayer) {
            selectedLayer.setStyle({
                weight: 0.45,
                color: "#ffffff"
            });
        }

        selectedLayer = layer;

        layer.setStyle({
            weight: 2,
            color: "#ffffff",
            fillOpacity: 1
        });

        showDetails(feature);

        const popup = document.createElement("div");

        const name = document.createElement("strong");
        name.textContent = getUnitName(feature);

        const code = document.createElement("p");
        code.textContent = `Unit Code: ${getUnitCode(feature)}`;

        popup.append(name, code);

        layer.bindPopup(popup).openPopup();
    });
}

fetch(DATA_URL)
    .then(response => {
        if (!response.ok) {
            throw new Error(
                `GeoJSON request failed: ${response.status}`
            );
        }

        return response.json();
    })
    .then(data => {

        if (!data.features || !data.features.length) {
            throw new Error("No geological features found.");
        }

        allFeatures = data.features;

        geologyLayer = L.geoJSON(data, {
            style: featureStyle,
            onEachFeature: onFeature
        }).addTo(map);

        createLegend(allFeatures);

        count.textContent = allFeatures.length.toLocaleString();

        const bounds = geologyLayer.getBounds();

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [15, 15] });
        }

        status.textContent =
            "Geological data loaded successfully";

        details.textContent =
            "Select any geological region to explore its properties.";

        console.log("Geology loaded:", allFeatures.length);
        console.log("Available geological units:",
            [...new Set(allFeatures.map(getUnitCode))]
        );

    })
    .catch(error => {
        console.error(error);

        status.textContent = error.message;

        details.textContent =
            "Unable to display geological information.";
    });

search.addEventListener("input", () => {

    if (!geologyLayer) return;

    const query = search.value.toLowerCase().trim();

    geologyLayer.eachLayer(layer => {

        const properties = layer.feature.properties || {};

        const matches = JSON.stringify(properties)
            .toLowerCase()
            .includes(query);

        layer.setStyle({
            fillOpacity: matches ? 0.85 : 0.04,
            opacity: matches ? 1 : 0.12,
            weight: matches ? 0.7 : 0.2
        });
    });

    status.textContent = query
        ? `Searching geological units: ${query}`
        : "Showing all geological features";
});
