let map;
let activeMarkers = []; // Renamed from 'markers' for clarity
let infoWindow; // Declare infoWindow globally
const geocoder = null; // Will be initialized if/when Google Maps API is loaded

// State for two-point distance calculation
let isCalculatingTwoPointDistance = false;
let firstMarkerForDistance = null;
// We don't strictly need secondMarkerForDistance as a global, can be local to click handler
let twoPointDistanceInstructionsDiv = null; // Will be assigned in DOMContentLoaded

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
            title: location.name // Keep a simple title for hover/accessibility if needed
        });

        marker.addListener('click', () => {
            if (isCalculatingTwoPointDistance) {
                infoWindow.close(); // Ensure regular info window is closed
                if (!firstMarkerForDistance) {
                    firstMarkerForDistance = marker;
                    // Temporarily change marker appearance if desired (e.g., icon or color)
                    // For now, just update instructions:
                    if (twoPointDistanceInstructionsDiv) {
                        twoPointDistanceInstructionsDiv.innerHTML = `<b>Point A selected:</b> ${marker.title}.<br>Now click the second marker (Point B).`;
                    }
                } else {
                    // Second marker clicked
                    const secondMarker = marker;
                    if (twoPointDistanceInstructionsDiv) {
                        twoPointDistanceInstructionsDiv.innerHTML = `Calculating distance between ${firstMarkerForDistance.title} and ${secondMarker.title}...`;
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
                    }
                    
                    // Reset for next calculation
                    isCalculatingTwoPointDistance = false; 
                    firstMarkerForDistance = null;
                    // Potentially reset visual cues for firstMarkerForDistance if they were changed
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
        if (google && google.maps && !map) {
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

    const rolesContainer = document.getElementById('roles-sub-filters');
    // Clear existing (except "All Roles")
    rolesContainer.innerHTML = '<label><input type="radio" name="role" value="" checked> All Roles</label><br>';
    for (const role of getAvailableRoles()) {
        const label = document.createElement('label');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'role';
        radio.value = role;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(` ${role}`));
        rolesContainer.appendChild(label);
        rolesContainer.appendChild(document.createElement('br'));
    }
}

function collectFilters() {
    const filters = {};

    const projectStatusValue = document.querySelector('input[name="project_status"]:checked')?.value;
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

        // Sub-filters are only considered if a resource location is selected
        const roleValue = document.querySelector('#roles-sub-filters input[name="role"]:checked')?.value;
        if (roleValue) {
            filters.role = roleValue;
        }

        const resourceStatusValue = document.querySelector('#resource-status-sub-filters input[name="resource_status"]:checked')?.value;
        if (resourceStatusValue) {
            filters.resource_status = resourceStatusValue;
        }
    }
    return filters;
}

function resetAllFilters() {
    // Reset radio buttons for project status to 'All Projects'
    const allProjectsRadio = document.querySelector('input[name="project_status"][value=""]');
    if (allProjectsRadio) allProjectsRadio.checked = true;

    // Reset select for billing locations to 'All Billing Locations'
    document.getElementById('billing-location-filter').value = "";

    // Reset select for resource locations to 'All Resource Locations'
    document.getElementById('resource-location-main-filter').value = "";

    // Reset radio buttons for roles to 'All Roles'
    const allRolesRadio = document.querySelector('#roles-sub-filters input[name="role"][value=""]');
    if (allRolesRadio) allRolesRadio.checked = true;

    // Reset radio buttons for resource status to 'Any Status'
    const anyStatusRadio = document.querySelector('#resource-status-sub-filters input[name="resource_status"][value=""]');
    if (anyStatusRadio) anyStatusRadio.checked = true;

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

    // Two-point distance calculation button
    const calculateTwoPointDistanceBtn = document.getElementById('calculate-two-point-distance-btn');
    twoPointDistanceInstructionsDiv = document.getElementById('two-point-distance-instructions'); // Assign here

    if (calculateTwoPointDistanceBtn && twoPointDistanceInstructionsDiv) {
        calculateTwoPointDistanceBtn.addEventListener('click', () => {
            isCalculatingTwoPointDistance = true;
            firstMarkerForDistance = null;
            infoWindow.close(); // Close any open info window
            twoPointDistanceInstructionsDiv.innerHTML = "Click the first marker (Point A) on the map.";
            // Consider visual cues to indicate selection mode is active
        });
    }

    // Accordion functionality for filter groups
    const filterGroupHeaders = document.querySelectorAll('#filters .filter-group > h3');
    for (const header of filterGroupHeaders) {
        // Make the first filter group open by default (optional)
        if (header.parentElement?.querySelector('#project_status')) {
            header.classList.add('active');
            const content = header.nextElementSibling;
            if (content?.classList.contains('filter-group-content')) {
                content.classList.add('open');
                content.style.maxHeight = `${content.scrollHeight}px`;
            }
        }

        header.addEventListener('click', () => {
            header.classList.toggle('active');
            const content = header.nextElementSibling;
            if (content?.classList.contains('filter-group-content')) {
                if (content.classList.contains('open')) {
                    content.classList.remove('open');
                    content.style.maxHeight = null;
                } else {
                    content.classList.add('open');
                    content.style.maxHeight = `${content.scrollHeight}px`;
                }
            }
        });
    }

    // If Google Maps API is not loaded via script tag's callback,
    // you might try to initialize it here, but it's less reliable.
    // The `window.initMap` approach is preferred.
    // For now, if the Google Maps script is commented out or fails,
    // initMap won't be called, and the map won't load.
    // The loadAndDisplayData function has a guard for this.

    // If the Google Maps script with the callback is NOT included,
    // you could uncomment the line below to *attempt* to load data as text.
    // However, it's best to get the Google Maps API key setup.
    if (!window.google || !window.google.maps) {
         console.warn("Google Maps API not yet loaded or script missing. Map will not display. Call to loadAndDisplayData() deferred until API loads or will show error.");
         // loadAndDisplayData(); // This would show data as list if map API is missing
         // For this demo, we rely on the initMap callback.
         // If you've commented out the Maps API script in HTML, this message is expected.
         document.getElementById('map-container').innerHTML =
            `<p><strong>Important:</strong> The Google Maps API script is currently commented out or not loaded. <br>
            To see the map, you need to: <br>
            1. Get a Google Maps JavaScript API key. <br>
            2. Uncomment the script tag in <code>index.html</code> and insert your API key. <br>
            <code>&lt;script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBeW1JdW4-bZrXgDAxR68YeZwqc6Obv9Us&amp;callback=initMap"&gt;&lt;/script&gt;</code>
            </p>`;
    }
});