
// ==========================================
// 1. INITIALIZE MARS MAP
// ==========================================

const map = L.map("marsMap", {
    crs: L.CRS.EPSG4326,
    center: [0, 0],
    zoom: 2,
    minZoom: 1,
    maxZoom: 7
});


// ==========================================
// 2. NASA MARS ELEVATION MAP
// ==========================================

const marsLayer = L.tileLayer(
    "https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
    {
        minZoom: 0,
        maxZoom: 7,
        noWrap: true,
        attribution: "NASA / JPL Mars Trek"
    }
).addTo(map);


// ==========================================
// 3. COMPLETE GEOLOGICAL MAP
// ==========================================

let geologyLayer = null;
let geologyLegendData = null;

const geologyUnitLayers = {};

const geologyToggle = document.getElementById("geologyToggle");
const geologyLegend = document.getElementById("geologyLegend");

if (geologyToggle) {
    geologyToggle.disabled = true;
    geologyToggle.checked = false;
}

// Normalize geological unit IDs.
function normalizeUnitId(id) {
    return String(id || "").trim().toLowerCase();
}

// Escape text before displaying properties.
function escapeGeologyText(value) {
    return String(value ?? "Not available").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Load geological legend and GeoJSON.

Promise.all([
    fetch("../data/geology/mars_geology_legend.json"),
    fetch("../data/geology/mars_geology_simplified.geojson")
])


.then(async ([legendResponse, geoResponse]) => {

    if (!legendResponse.ok) {
        throw new Error("Unable to load geological legend.");
    }

    if (!geoResponse.ok) {
        throw new Error("Unable to load complete GeoJSON.");
    }

    const legendData = await legendResponse.json();
    const geoData = await geoResponse.json();

    if (!Array.isArray(legendData.units)) {
        throw new Error("Invalid geological legend.");
    }

    if (!geoData || !Array.isArray(geoData.features)) {
        throw new Error("Invalid geological GeoJSON.");
    }

    geologyLegendData = legendData;

    const unitDetails = {};

    legendData.units.forEach(unit => {
        unitDetails[normalizeUnitId(unit.unit_id)] = unit;
    });

    // Create geological polygon layer.
    geologyLayer = L.geoJSON(geoData, {

        bubblingMouseEvents: false,

        style: function(feature) {

            const properties = feature.properties || {};

            const unitId =
                properties.Unit ||
                properties.unit_id ||
                "";

            const unit = unitDetails[normalizeUnitId(unitId)];

            const color =
                (unit && unit.color) ||
                properties.color ||
                "#55BEE0";

            return {
                color: color,
                fillColor: color,
                weight: 1,
                opacity: 0.9,
                fillOpacity: 0.48,
                bubblingMouseEvents: false
            };
        },

        onEachFeature: function(feature, layer) {

            const properties = feature.properties || {};

            const unitId =
                properties.Unit ||
                properties.unit_id ||
                "Not available";

            const unit = unitDetails[normalizeUnitId(unitId)];

            const unitDescription =
                properties.UnitDesc ||
                properties.description ||
                (unit && unit.label) ||
                "Not available";

            const area =
                properties.SphArea_km ??
                properties.area_km2 ??
                "Not available";

            const regionId =
                properties.OBJECTID ??
                properties.region_id ??
                "Not available";

            // Store polygons by normalized geological unit ID.
            const unitKey = normalizeUnitId(unitId);

            if (!geologyUnitLayers[unitKey]) {
                geologyUnitLayers[unitKey] = [];
            }

            geologyUnitLayers[unitKey].push(layer);

            // Geological information popup.
            layer.bindPopup(`
                <div class="geology-popup">
                    <h3>Geological Information</h3>

                    <p>
                        <strong>Region ID:</strong>
                        ${escapeGeologyText(regionId)}
                    </p>

                    <p>
                        <strong>Unit ID:</strong>
                        ${escapeGeologyText(unitId)}
                    </p>

                    <p>
                        <strong>Description:</strong>
                        ${escapeGeologyText(unitDescription)}
                    </p>

                    <p>
                        <strong>Area:</strong>
                        ${escapeGeologyText(area)} km²
                    </p>

                    <p>
                        <strong>Source:</strong>
                        ${escapeGeologyText(
                            legendData.source || "USGS geological map"
                        )}
                    </p>
                </div>
            `);

            // Highlight polygon when clicked.
            layer.on("click", function(event) {

                if (event.originalEvent) {
                    L.DomEvent.stopPropagation(event.originalEvent);
                }

                geologyLayer.resetStyle();

                layer.setStyle({
                    weight: 2.5,
                    fillOpacity: 0.75
                });

                layer.bringToFront();

                layer.openPopup();

                // Update Geological Information Panel.
                const infoPanel =
                    document.getElementById("geologyInfoPanel");

                const infoContent =
                    document.getElementById("geologyInfoContent");

                if (infoPanel && infoContent) {

                    const regionCount =
                        unit ? unit.region_count : "Not available";

                    const unitName =
                        unit ? unit.label : unitDescription;

                    const unitColor =
                        unit ? unit.color : "#55BEE0";

                    infoPanel.querySelector(".panel-placeholder")?.remove();

                    infoContent.innerHTML = `
                        <div class="info-item">
                            <div class="info-label">Region ID</div>
                            <div class="info-value">
                                ${escapeGeologyText(regionId)}
                            </div>
                        </div>

                        <div class="info-item">
                            <div class="info-label">Geological Unit</div>
                            <div class="info-value">
                                <span style="
                                    display:inline-block;
                                    width:12px;
                                    height:12px;
                                    background:${escapeGeologyText(unitColor)};
                                    margin-right:8px;
                                    border-radius:3px;
                                "></span>
                                ${escapeGeologyText(unitId)}
                            </div>
                        </div>

                        <div class="info-item">
                            <div class="info-label">Unit Name</div>
                            <div class="info-value">
                                ${escapeGeologyText(unitName)}
                            </div>
                        </div>

                        <div class="info-item">
                            <div class="info-label">Description</div>
                            <div class="info-value">
                                ${escapeGeologyText(unitDescription)}
                            </div>
                        </div>

                        <div class="info-item">
                            <div class="info-label">Region Area</div>
                            <div class="info-value">
                                ${escapeGeologyText(area)} km²
                            </div>
                        </div>

                        <div class="info-item">
                            <div class="info-label">Total Regions in this Unit</div>
                            <div class="info-value">
                                ${escapeGeologyText(regionCount)}
                            </div>
                        </div>

                        <div class="info-item">
                            <div class="info-label">Data Source</div>
                            <div class="info-value">
                                USGS Scientific Investigations Map 3292 (2014)
                            </div>
                        </div>
                    `;

                    infoPanel.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });
                }

            });
        }
    });


    // ==========================================
    // 4. BUILD GEOLOGICAL LEGEND
    // ==========================================

    if (geologyLegend) {

        geologyLegend.replaceChildren();

        const heading = document.createElement("h3");
        heading.textContent = "Martian Geological Units";
        geologyLegend.appendChild(heading);

        const description = document.createElement("p");

        description.textContent =
            `${legendData.units.length} geological units | ` +
            `${geoData.features.length.toLocaleString()} mapped regions`;

        geologyLegend.appendChild(description);

        const searchInput = document.createElement("input");

        searchInput.type = "search";
        searchInput.id = "geologySearch";
        searchInput.placeholder = "Search by unit ID or geological name...";
        searchInput.autocomplete = "off";

        geologyLegend.appendChild(searchInput);

        const hint = document.createElement("p");

        hint.className = "geology-search-hint";

        hint.textContent =
            "Search for a unit and select it to view its geological regions.";

        geologyLegend.appendChild(hint);

        const legendItems = document.createElement("div");

        legendItems.id = "geologyLegendItems";

        geologyLegend.appendChild(legendItems);


        function displayGeologyUnits(units) {

            legendItems.replaceChildren();

            if (units.length === 0) {

                const message = document.createElement("p");

                message.textContent = "No geological units found.";

                legendItems.appendChild(message);

                return;
            }

            units.forEach(unit => {

                const item = document.createElement("button");

                item.type = "button";
                item.className = "geology-legend-item";
                item.style.cursor = "pointer";
                item.style.width = "100%";
                item.style.textAlign = "left";

                const colorBox = document.createElement("span");

                colorBox.className = "geology-color";

                colorBox.style.backgroundColor =
                    unit.color || "#55BEE0";

                colorBox.setAttribute("aria-hidden", "true");

                const label = document.createElement("span");

                const unitKey = normalizeUnitId(unit.unit_id);

                const regionCount =
                    (geologyUnitLayers[unitKey] || []).length;

                label.textContent =
                    `${unit.unit_id} - ${unit.label} (${regionCount} regions)`;

                item.appendChild(colorBox);
                item.appendChild(label);


                item.addEventListener("click", function() {

                    const matchingLayers =
                        geologyUnitLayers[unitKey] || [];

                    if (matchingLayers.length === 0) {

                        hint.textContent =
                            `No polygon regions found for ${unit.unit_id}.`;

                        return;
                    }

                    if (geologyToggle && !geologyToggle.checked) {

                        geologyToggle.checked = true;

                        geologyLayer.addTo(map);
                    }

                    if (!map.hasLayer(geologyLayer)) {
                        geologyLayer.addTo(map);
                    }

                    const bounds =
                        L.featureGroup(matchingLayers).getBounds();

                    if (bounds.isValid()) {

                        map.fitBounds(bounds, {
                            padding: [35, 35],
                            maxZoom: 4
                        });
                    }

                    const firstRegion = matchingLayers[0];

                    geologyLayer.resetStyle();

                    firstRegion.setStyle({
                        weight: 2.5,
                        fillOpacity: 0.75
                    });

                    firstRegion.bringToFront();

                    firstRegion.openPopup();

                    hint.textContent =
                        `${unit.unit_id}: ${matchingLayers.length} regions found. ` +
                        "Details of the first region are displayed. " +
                        "Click other polygons to explore their details.";

                });

                legendItems.appendChild(item);
            });
        }


        displayGeologyUnits(legendData.units);


        searchInput.addEventListener("input", function() {

            const query = this.value.trim().toLowerCase();

            const filteredUnits = legendData.units.filter(unit => {

                return (
                    String(unit.unit_id).toLowerCase().includes(query) ||
                    String(unit.label).toLowerCase().includes(query)
                );

            });

            displayGeologyUnits(filteredUnits);
        });
    }


    // ==========================================
    // 5. GEOLOGICAL MAP CHECKBOX
    // ==========================================

    if (geologyToggle) {

        geologyToggle.disabled = false;

        geologyToggle.addEventListener("change", function() {

            if (!geologyLayer) return;

            if (this.checked) {

                geologyLayer.addTo(map);

            } else if (map.hasLayer(geologyLayer)) {

                map.removeLayer(geologyLayer);
            }
        });
    }

    console.log("Complete geological map loaded successfully!");
    console.log("Geological units:", legendData.units.length);
    console.log("Geological polygon regions:", geoData.features.length);

    console.log(
        "Unit IDs represented:",
        Object.keys(geologyUnitLayers).length
    );

})

.catch(error => {

    console.error("Geological map loading error:", error);

    if (geologyToggle) {
        geologyToggle.disabled = true;
    }

    if (geologyLegend) {

        geologyLegend.textContent =
            `Unable to load geological data: ${error.message}. ` +
            "Check the files in data/geology.";
    }
});

// ==========================================
// 6. EXPLORATION LOCATIONS
// ==========================================

const locations = [

    {
        name: "AP-1",
        lat: 39.80,
        lon: -157.90,
        description: "Potential landing and exploration candidate"
    },

    {
        name: "AP-8",
        lat: 40.75,
        lon: -158.70,
        description: "Alternative exploration candidate"
    },

    {
        name: "AP-9",
        lat: 40.02,
        lon: -156.65,
        description: "Potential shallow ice investigation site"
    },

    {
        name: "Elysium Planitia",
        lat: 4.50,
        lon: 135.90,
        description: "Relatively flat plain; NASA InSight landing region"
    },

    {
        name: "Jezero Crater",
        lat: 18.40,
        lon: 77.70,
        description: "Ancient lake and river delta; Perseverance rover region"
    },

    {
        name: "Gale Crater",
        lat: -5.40,
        lon: 137.80,
        description: "Geologically diverse region explored by Curiosity"
    }

];


// ==========================================
// 7. MARS LANDMARK DATABASE
// ==========================================

const landmarks = [

    {
        name: "Olympus Mons",
        lat: 18.65,
        lon: -133.80,
        type: "Volcano",
        description: "Olympus Mons is the largest known volcano in the Solar System."
    },

    {
        name: "Valles Marineris",
        lat: -13.90,
        lon: -59.20,
        type: "Canyon System",
        description: "A vast canyon system extending thousands of kilometres across Mars."
    },

    {
        name: "Utopia Planitia",
        lat: 46.70,
        lon: 118.00,
        type: "Impact Basin / Plain",
        description: "A large northern Martian basin explored by the Viking 2 and Tianwen-1 missions."
    },

    {
        name: "Tharsis Region",
        lat: 0.00,
        lon: -112.00,
        type: "Volcanic Region",
        description: "A major volcanic province containing several enormous shield volcanoes."
    },

    {
        name: "Elysium Planitia",
        lat: 4.50,
        lon: 135.90,
        type: "Volcanic Plain",
        description: "A broad plain that hosted NASA's InSight lander."
    },

    {
        name: "Gale Crater",
        lat: -5.40,
        lon: 137.80,
        type: "Impact Crater",
        description: "A large impact crater explored by NASA's Curiosity rover."
    },

    {
        name: "Jezero Crater",
        lat: 18.40,
        lon: 77.70,
        type: "Impact Crater",
        description: "An ancient lake and river delta environment explored by Perseverance."
    },

    {
        name: "Hellas Planitia",
        lat: -42.40,
        lon: 70.50,
        type: "Impact Basin",
        description: "One of the largest impact basins on the Martian surface."
    },

    {
        name: "Arabia Terra",
        lat: 20.00,
        lon: 30.00,
        type: "Highland Region",
        description: "An ancient, heavily cratered highland region in northern Mars."
    },

    {
        name: "Noctis Labyrinthus",
        lat: -7.00,
        lon: -102.00,
        type: "Canyon System",
        description: "A complex network of intersecting valleys and fractured terrain."
    }

];

// ==========================================
// 8. MARKER VARIABLES
// ==========================================

let selectedMarker = null;

let landmarkMarker = null;


// ==========================================
// 9. REMOVE CUSTOM MARKER
// ==========================================

function removeCustomMarker() {

    if (selectedMarker !== null) {

        map.removeLayer(selectedMarker);

        selectedMarker = null;

    }

}


// ==========================================
// 10. REMOVE LANDMARK MARKER
// ==========================================

function removeLandmarkMarker() {

    if (landmarkMarker !== null) {

        map.removeLayer(landmarkMarker);

        landmarkMarker = null;

    }

}


// ==========================================
// 11. DISPLAY LOCATION INFORMATION
// ==========================================

function showLocation(location) {

    const info = document.getElementById("locationInfo");

    info.innerHTML = `

        <strong>${location.name}</strong><br>

        ${location.description}<br>

        Latitude: ${location.lat}<br>

        Longitude: ${location.lon}

        ${location.type ? `<br>Type: ${location.type}` : ""}

    `;


    // Share coordinates with other project modules.
    window.dispatchEvent(
        new CustomEvent("mars-location-selected", {

            detail: {
                name: location.name,
                latitude: location.lat,
                longitude: location.lon,
                type: location.type || "Exploration Location"
            }

        })
    );

}


// ==========================================
// 12. ADD PREDEFINED LOCATION MARKERS
// ==========================================

locations.forEach(location => {

    const marker = L.marker(
        [location.lat, location.lon],
        {
            bubblingMouseEvents: false
        }
    ).addTo(map);


    marker.bindPopup(`

        <h3>${location.name}</h3>

        <p>${location.description}</p>

        <p>Latitude: ${location.lat}</p>

        <p>Longitude: ${location.lon}</p>

    `);


    marker.on("click", function() {

        removeCustomMarker();

        removeLandmarkMarker();

        document.getElementById("locationSelect").value =
            location.name;

        showLocation(location);

    });

});


// ==========================================
// 13. LOCATION DROPDOWN
// ==========================================

document.getElementById("locationSelect")

.addEventListener("change", function() {

    const selected = locations.find(
        item => item.name === this.value
    );

    if (selected) {

        removeCustomMarker();

        removeLandmarkMarker();

        map.closePopup();

        map.setView(
            [selected.lat, selected.lon],
            5
        );

        showLocation(selected);

    }

});


// ==========================================
// 14. CUSTOM LOCATION SELECTION
// ==========================================

map.on("click", function(event) {

    const selected = {

        name: "Custom Mars Location",

        lat: Number(event.latlng.lat.toFixed(4)),

        lon: Number(event.latlng.lng.toFixed(4)),

        description: "User-selected Martian location"

    };


    removeCustomMarker();

    removeLandmarkMarker();

    map.closePopup();


    selectedMarker = L.marker(
        [selected.lat, selected.lon],
        {
            bubblingMouseEvents: false
        }
    ).addTo(map);


    selectedMarker.bindPopup(`

        <h3>Custom Mars Location</h3>

        Latitude: ${selected.lat}<br>

        Longitude: ${selected.lon}

    `);


    document.getElementById("locationSelect").value = "";

    showLocation(selected);

});


// ==========================================
// 15. LANDMARK SEARCH
// ==========================================

const searchInput = document.getElementById("landmarkSearch");

const searchButton = document.getElementById("searchButton");

const clearButton = document.getElementById("clearSearch");

const resultsContainer = document.getElementById("landmarkResults");


function searchLandmarks() {

    const query = searchInput.value.trim().toLowerCase();

    if (query === "") {

        resultsContainer.innerHTML =
            "<p>Please enter a landmark name.</p>";

        return;

    }


    const results = landmarks.filter(landmark =>

        landmark.name.toLowerCase().includes(query) ||

        landmark.type.toLowerCase().includes(query)

    );


    resultsContainer.innerHTML = "";


    if (results.length === 0) {

        resultsContainer.innerHTML =
            "<p>No landmarks found. Try another name.</p>";

        return;

    }


    results.forEach(landmark => {

        const card = document.createElement("div");

        card.className = "landmark-result";

        card.innerHTML = `

            <h3>${landmark.name}</h3>

            <p><strong>Type:</strong> ${landmark.type}</p>

            <p>${landmark.description}</p>

            <p>
                <strong>Latitude:</strong> ${landmark.lat}
                |
                <strong>Longitude:</strong> ${landmark.lon}
            </p>

            <p>Click to explore this landmark →</p>

        `;


        card.addEventListener("click", function() {

            exploreLandmark(landmark);

        });


        resultsContainer.appendChild(card);

    });

}


// ==========================================
// 16. EXPLORE SELECTED LANDMARK
// ==========================================

function exploreLandmark(landmark) {

    removeCustomMarker();

    removeLandmarkMarker();

    map.closePopup();

    document.getElementById("locationSelect").value = "";


    map.setView(
        [landmark.lat, landmark.lon],
        4
    );


    landmarkMarker = L.marker(
        [landmark.lat, landmark.lon],
        {
            bubblingMouseEvents: false
        }
    ).addTo(map);


    landmarkMarker.bindPopup(`

        <h3>${landmark.name}</h3>

        <p>${landmark.description}</p>

        <p>Type: ${landmark.type}</p>

        <p>Latitude: ${landmark.lat}</p>

        <p>Longitude: ${landmark.lon}</p>

    `).openPopup();


    showLocation(landmark);

}


// ==========================================
// 17. SEARCH BUTTON AND ENTER KEY
// ==========================================

searchButton.addEventListener("click", searchLandmarks);

searchInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        searchLandmarks();

    }

});


// ==========================================
// 18. CLEAR SEARCH
// ==========================================

clearButton.addEventListener("click", function() {

    searchInput.value = "";

    resultsContainer.innerHTML = `

        <p>Search for a Martian landmark to explore.</p>

    `;

});


// ==========================================
// 19. RESET MAP
// ==========================================

document.getElementById("resetMap")

.addEventListener("click", function() {

    removeCustomMarker();

    removeLandmarkMarker();

    map.closePopup();

    map.setView([0, 0], 2);

    document.getElementById("locationSelect").value = "";

    searchInput.value = "";

    resultsContainer.innerHTML = `

        <p>Search for a Martian landmark to explore.</p>

    `;

    document.getElementById("locationInfo").innerText =

        "Click on the Mars map or select a location above.";

});


// ==========================================
// 20. MAP LAYER SELECTOR
// ==========================================

const layerSelect = document.getElementById("layerSelect");

const marsLayers = {

    elevation: marsLayer

};

if (layerSelect) {

    layerSelect.addEventListener("change", function() {

        const selectedLayer = marsLayers[this.value];

        if (!selectedLayer) {

            alert(
                "This NASA map layer has not been integrated yet."
            );

            this.value = "elevation";

            return;

        }


        Object.values(marsLayers).forEach(layer => {

            if (map.hasLayer(layer)) {

                map.removeLayer(layer);

            }

        });


        selectedLayer.addTo(map);

    });

}


// ==========================================
// 21. TEAM INTEGRATION EVENT
// ==========================================

window.addEventListener(
    "mars-location-selected",
    function(event) {

        console.log(
            "Selected Mars location:",
            event.detail
        );

    }
);

