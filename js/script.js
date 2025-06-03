let map;
let activeMarkers = []; // Renamed from 'markers' for clarity
let infoWindow; // Declare infoWindow globally
const geocoder = null; // Will be initialized if/when Google Maps API is loaded

// State for two-point distance calculation
let isCalculatingTwoPointDistance = false;
let firstMarkerForDistance = null;
// We don't strictly need secondMarkerForDistance as a global, can be local to click handler
let twoPointDistanceInstructionsDiv = null; // Will be assigned in DOMContentLoaded

// Helper function to update the accordion height for the Measure Distance section
// function updateMeasureDistanceAccordionHeight() { ... }

// This is your Google Maps API callback function
// Ensure this function is available globally if you use `&callback=initMap`
window.initMap = () => {
    console.log("Google Maps API loaded. Initializing map...");
    const mapElement = document.getElementById('map-container');
    mapElement.innerHTML = ''; // Clear "Map loading..." message
    const actualMapDiv = document.createElement('div');
    actualMapDiv.id = 'map';
    mapElement.appendChild(actualMapDiv);

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 }, // Approx center of India (you can change this)
        zoom: 5,
        mapId: "YOUR_MAP_ID_HERE", // <<< YOU NEED TO REPLACE THIS WITH YOUR ACTUAL MAP ID
        mapTypeControl: false, // Optional: simplify controls
        streetViewControl: false,
    });

    infoWindow = new google.maps.InfoWindow(); // Initialize infoWindow

    // Initialize geocoder here as google.maps is now available
    // geocoder = new google.maps.Geocoder(); // UNCOMMENT THIS IF YOU HAVE AN API KEY AND WANT GEOCODING

    loadAndDisplayData(); // Load all data initially as requested
}

function addMarkerToMap(location) {
    if (!map || !google || !google.maps) {
        console.warn("Map not initialized or Google Maps API not ready. Cannot add marker for:", location.name);
        return;
    }

    let position;
    if (location.lat != null && location.lng != null) {
        position = { lat: Number.parseFloat(location.lat), lng: Number.parseFloat(location.lng) };
        const markerInfoContent = `${location.name}<br>Address: ${location.address}<br>Project Status: ${location.project_status}<br>Role: ${location.role || 'N/A'}`;
        const marker = new google.maps.marker.AdvancedMarkerElement({
            position: position,
            map: map,
            title: location.name
        });

        marker.addListener('click', () => {
            if (isCalculatingTwoPointDistance) {
                infoWindow.close(); 
                if (!firstMarkerForDistance) {
                    firstMarkerForDistance = marker;
                    if (twoPointDistanceInstructionsDiv) {
                        twoPointDistanceInstructionsDiv.innerHTML = `<b>Point A selected:</b> ${marker.title}.<br>Now click the second marker (Point B).`;
                        // REMOVED: setTimeout(updateMeasureDistanceAccordionHeight, 0);
                    }
                } else {
                    const secondMarker = marker;
                    if (twoPointDistanceInstructionsDiv) {
                        twoPointDistanceInstructionsDiv.innerHTML = `Calculating distance between ${firstMarkerForDistance.title} and ${secondMarker.title}...`;
                        // REMOVED: setTimeout(updateMeasureDistanceAccordionHeight, 0);
                    }

                    const firstLatLng = new google.maps.LatLng(firstMarkerForDistance.position.lat, firstMarkerForDistance.position.lng);
                    const secondLatLng = new google.maps.LatLng(secondMarker.position.lat, secondMarker.position.lng);

                    const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(
                        firstLatLng,
                        secondLatLng
                    );
                    const distanceInKm = (distanceInMeters / 1000).toFixed(2);

                    if (twoPointDistanceInstructionsDiv) {
                        twoPointDistanceInstructionsDiv.innerHTML = 
                            `<b>Distance from ${firstMarkerForDistance.title} to ${secondMarker.title}:</b> ${distanceInKm} km.<br>
                             Click "Start: Marker to Marker" to measure another distance.`;
                        // REMOVED: setTimeout(updateMeasureDistanceAccordionHeight, 0);
                    }
                    
                    isCalculatingTwoPointDistance = false; 
                    firstMarkerForDistance = null;
                }
            } else {
                // Original InfoWindow logic (distance from user's location)
                let currentInfoWindowContent = markerInfoContent;
                infoWindow.close(); 
                infoWindow.setContent(currentInfoWindowContent);
                infoWindow.open(map, marker);

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (userPosition) => {
                            const userLatLng = new google.maps.LatLng(
                                userPosition.coords.latitude,
                                userPosition.coords.longitude
                            );
                            const markerLatLng = new google.maps.LatLng(marker.position.lat, marker.position.lng);

                            const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(
                                userLatLng,
                                markerLatLng
                            );
                            const distanceInKm = (distanceInMeters / 1000).toFixed(2);
                            
                            currentInfoWindowContent += `<br><br><b>Distance from your location:</b> ${distanceInKm} km`;
                            infoWindow.setContent(currentInfoWindowContent);
                        },
                        () => {
                            currentInfoWindowContent += "<br><br>Could not calculate distance: Geolocation failed or permission denied.";
                            infoWindow.setContent(currentInfoWindowContent);
                        }
                    );
                } else {
                    currentInfoWindowContent += "<br><br>Geolocation is not supported by this browser.";
                    infoWindow.setContent(currentInfoWindowContent);
                }
            }
        });

        activeMarkers.push(marker);
    } else if (location.address && geocoder) { // Check if geocoder is initialized
        // console.log(`Geocoding address for: ${location.name} - ${location.address}`);
        // geocoder.geocode({ 'address': location.address }, (results, status) => {
        //     if (status === 'OK' && results[0]) {
        //         const markerInfoContent = `${location.name}<br>Address: ${location.address}<br>Project Status: ${location.project_status}<br>Role: ${location.role || 'N/A'}`;
        //         const marker = new google.maps.marker.AdvancedMarkerElement({
        //             map: map,
        //             position: results[0].geometry.location,
        //             title: location.name
        //         });
        //         marker.addListener('click', () => {
        //             let currentInfoWindowContent = markerInfoContent;
        //             infoWindow.close();
        //             infoWindow.setContent(currentInfoWindowContent);
        //             infoWindow.open(map, marker);
        //             // Add geolocation and distance calculation here as well if geocoding is used
        //             if (navigator.geolocation) {
        //                 navigator.geolocation.getCurrentPosition(
        //                     (userPosition) => {
        //                         const userLatLng = new google.maps.LatLng(userPosition.coords.latitude, userPosition.coords.longitude);
        //                         const markerLatLng = new google.maps.LatLng(marker.position.lat, marker.position.lng); // or results[0].geometry.location
        //                         const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, markerLatLng);
        //                         const distanceInKm = (distanceInMeters / 1000).toFixed(2);
        //                         currentInfoWindowContent += `<br><br><b>Distance from your location:</b> ${distanceInKm} km`;
        //                         infoWindow.setContent(currentInfoWindowContent);
        //                     },
        //                     () => {
        //                         currentInfoWindowContent += "<br><br>Could not calculate distance: Geolocation failed or permission denied.";
        //                         infoWindow.setContent(currentInfoWindowContent);
        //                     }
        //                 );
        //             } else {
        //                 currentInfoWindowContent += "<br><br>Geolocation is not supported by this browser.";
        //                 infoWindow.setContent(currentInfoWindowContent);
        //             }
        //         });
        //         activeMarkers.push(marker);
        //     } else {
        //         console.warn(`Geocode was not successful for "${location.name}" (${location.address}): ${status}`);
        //     }
        // });
        console.warn(`Geocoding for "${location.name}" skipped as geocoder or API key might not be active. Using console log instead.`);
        console.log(`Location for geocoding: ${location.name} - ${location.address}`);

    } else {
        console.warn("Location data needs 'lat'/'lng' or an 'address' (with active geocoder) to plot:", location.name);
    }
}

function clearAllMarkers() {
    for (const marker of activeMarkers) {
        marker.map = null;
    }
    activeMarkers = [];
}

async function loadAndDisplayData(filters = {}) {
    if (!map && (!google || !google.maps)) {
        // If map API isn't loaded yet, don't try to process/display.
        // initMap will call this again once API is ready.
        // If API fails to load, this message remains.
        document.getElementById('map-container').innerHTML =
            `<p>Google Maps API not loaded. Please check your API key and internet connection. <br>
             Data cannot be displayed on the map. <br>
             To test without the map, uncomment the Google Maps script in index.html and ensure initMap() is callable.</p>`;
        console.warn("Map API not ready, data loading aborted.");
        return;
    }


    clearAllMarkers();
    const mapContainer = document.getElementById('map-container');
    // Ensure #map div exists, especially if it was cleared due to an error.
    if (!document.getElementById('map') && mapContainer) {
        mapContainer.innerHTML = ''; // Clear any error messages
        const actualMapDiv = document.createElement('div');
        actualMapDiv.id = 'map';
        mapContainer.appendChild(actualMapDiv);
        // Re-initialize map if it was lost
        if (google?.maps && !map) {
             map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: 20.5937, lng: 78.9629 },
                zoom: 5,
                mapId: "YOUR_MAP_ID_HERE", // <<< YOU NEED TO REPLACE THIS WITH YOUR ACTUAL MAP ID
             });
        }
    }


    try {
        const response = await fetchMockReportData(filters);
        const locations = response.data;

        if (locations.length > 0) {
            for (const location of locations) {
                addMarkerToMap(location);
            }
             // Optionally adjust map bounds to fit markers
            if (activeMarkers.length > 0 && google && google.maps) {
                const bounds = new google.maps.LatLngBounds();
                for (const marker of activeMarkers) {
                    bounds.extend(marker.position);
                }
                map.fitBounds(bounds);
                if (activeMarkers.length === 1) map.setZoom(10); // Zoom in if only one marker
            }

        } else {
            console.log("No locations to display for the current filters.");
            if (mapContainer.contains(document.getElementById('map'))) {
                // If map is there, we can show a message within it or nearby
                // For simplicity, just log. You could add an overlay div on the map.
            }
        }
    } catch (error) {
        console.error("Error fetching or displaying data:", error);
        if (mapContainer) mapContainer.innerHTML = '<p>Error loading data. Check console.</p>';
    }
}

function populateFilterDropdowns() {
    const billingLocationFilter = document.getElementById('billing-location-filter');
    for (const loc of getUniqueValues('billing_location')) {
        const option = document.createElement('option');
        option.value = loc;
        option.textContent = loc;
        billingLocationFilter.appendChild(option);
    }

    const resourceLocationFilter = document.getElementById('resource-location-main-filter');
    for (const loc of getUniqueValues('resource_location')) {
        const option = document.createElement('option');
        option.value = loc;
        option.textContent = loc;
        resourceLocationFilter.appendChild(option);
    }

    const roleFilterSelect = document.getElementById('role-filter');
    // Clear existing dynamic roles, keeping the static "All Roles" option if it was first
    // A more robust way is to save the first child, clear, then re-append
    const firstRoleOption = roleFilterSelect.options[0]; // Assuming "All Roles" is always first and static
    roleFilterSelect.innerHTML = ''; // Clear all options
    if (firstRoleOption) roleFilterSelect.appendChild(firstRoleOption); // Add back "All Roles"
    
    for (const role of getAvailableRoles()) {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        roleFilterSelect.appendChild(option);
    }
}

function collectFilters() {
    const filters = {};

    const projectStatusValue = document.getElementById('project-status-filter').value;
    if (projectStatusValue) {
        filters.project_status = projectStatusValue;
    }

    const billingLocation = document.getElementById('billing-location-filter').value;
    if (billingLocation) {
        filters.billing_location = billingLocation;
    }

    const resourceLocation = document.getElementById('resource-location-main-filter').value;
    if (resourceLocation) {
        filters.resource_location = resourceLocation;

        const roleValue = document.getElementById('role-filter').value;
        if (roleValue) {
            filters.role = roleValue;
        }

        const resourceStatusValue = document.getElementById('resource-status-filter').value;
        if (resourceStatusValue) {
            filters.resource_status = resourceStatusValue;
        }
    }
    return filters;
}

function resetAllFilters() {
    document.getElementById('project-status-filter').value = "";
    document.getElementById('billing-location-filter').value = "";
    document.getElementById('resource-location-main-filter').value = "";
    document.getElementById('role-filter').value = "";
    document.getElementById('resource-status-filter').value = "";

    // After resetting UI, reload data with no filters
    loadAndDisplayData();
}


document.addEventListener('DOMContentLoaded', () => {
    populateFilterDropdowns();

    document.getElementById('apply-filters-btn').addEventListener('click', () => {
        const currentFilters = collectFilters();
        loadAndDisplayData(currentFilters);
    });

    document.getElementById('reset-filters-btn').addEventListener('click', () => {
        resetAllFilters();
    });

    const calculateTwoPointDistanceBtn = document.getElementById('calculate-two-point-distance-btn');
    twoPointDistanceInstructionsDiv = document.getElementById('two-point-distance-instructions'); 

    if (calculateTwoPointDistanceBtn && twoPointDistanceInstructionsDiv) {
        calculateTwoPointDistanceBtn.addEventListener('click', () => {
            isCalculatingTwoPointDistance = true;
            firstMarkerForDistance = null;
            infoWindow.close(); 
            twoPointDistanceInstructionsDiv.innerHTML = "Click the first marker (Point A) on the map.";
            // Any auto-tab switching logic is now removed.
        });
    }

    // Initial map/data load check (existing logic, ensure it's still correct)
    if (!window.google || !window.google.maps) {
         console.warn("Google Maps API not yet loaded or script missing. Map will not display. Call to loadAndDisplayData() deferred until API loads or will show error.");
         const mapContainerMessage = document.getElementById('map-container');
         if (mapContainerMessage && !mapContainerMessage.querySelector('#map')) { 
            mapContainerMessage.innerHTML =
                `<p><strong>Loading Map...</strong><br>
                If the map does not appear, please ensure your Google Maps API key in <code>index.html</code> is correct and the API is enabled in your Google Cloud Console.
                </p>`;
         }
    }
});