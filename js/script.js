let map;
let activeMarkers = [];
let infoWindow;
let directionsService;
let directionsRenderer;
let contextMenu;
let selectedMarker = null;
let routeWaypoints = [];
let isDistanceMeasuring = false;
let measureStartPoint = null;
let measureMarker = null;
let distancePolyline = null;
let distanceMarkers = [];
let isRoutePlanning = false;
let routeMarkers = [];
let routePoints = [];
let infoWindows = [];
let dropdownControllers = {};

// Initialize searchable dropdowns
const dropdowns = {
    projectStatus: {
        input: null,
        list: null,
        options: ['Live', 'Archived', 'Cancelled', 'Suspended'],
        selected: ''
    },
    billingLocation: {
        input: null,
        list: null,
        options: [],
        selected: ''
    },
    resourceLocation: {
        input: null,
        list: null,
        options: [],
        selected: ''
    },
    role: {
        input: null,
        list: null,
        options: [],
        selected: ''
    },
    resourceStatus: {
        input: null,
        list: null,
        options: ['Active', 'Inactive', 'On Bench'],
        selected: ''
    }
};

// Initialize dropdowns
function initializeDropdowns() {
    // Initialize dropdown elements
    dropdowns.projectStatus.input = document.getElementById('project-status-search');
    dropdowns.projectStatus.list = document.getElementById('project-status-list');
    dropdowns.billingLocation.input = document.getElementById('billing-location-search');
    dropdowns.billingLocation.list = document.getElementById('billing-location-list');
    dropdowns.resourceLocation.input = document.getElementById('resource-location-search');
    dropdowns.resourceLocation.list = document.getElementById('resource-location-list');
    dropdowns.role.input = document.getElementById('role-search');
    dropdowns.role.list = document.getElementById('role-list');
    dropdowns.resourceStatus.input = document.getElementById('resource-status-search');
    dropdowns.resourceStatus.list = document.getElementById('resource-status-list');

    for (const key of Object.keys(dropdowns)) {
        const dropdown = dropdowns[key];
        if (!dropdown.input || !dropdown.list) {
            console.error(`Dropdown elements not found for ${key}`);
            continue;
        }
        
        // Setup input event
        dropdown.input.addEventListener('input', () => {
            const searchTerm = dropdown.input.value.toLowerCase();
            const filteredOptions = dropdown.options.filter(option => 
                option?.toLowerCase().includes(searchTerm)
            );
            updateDropdownList(key, filteredOptions);
            dropdown.list.classList.add('show');
        });

        // Setup focus event
        dropdown.input.addEventListener('focus', () => {
            updateDropdownList(key, dropdown.options);
            dropdown.list.classList.add('show');
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.input.contains(e.target) && !dropdown.list.contains(e.target)) {
                dropdown.list.classList.remove('show');
            }
        });
    }
}

function updateDropdownList(dropdownKey, options) {
    const dropdown = dropdowns[dropdownKey];
    if (!dropdown.list) return;
    
    dropdown.list.innerHTML = '';
    for (const option of options) {
        if (!option) continue;
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = option;
        item.addEventListener('click', () => {
            dropdown.selected = option;
            dropdown.input.value = option;
            dropdown.list.classList.remove('show');
        });
        dropdown.list.appendChild(item);
    }
}

// Initialize UI elements and event listeners
function initializeUI() {
    const startRouteBtn = document.getElementById('start-route-btn');
    if (startRouteBtn) {
        startRouteBtn.addEventListener('click', startRoutePlanning);
    }

    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            loadAndDisplayData(collectFilters());
        });
    }

    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetAllFilters);
    }

    const viewDetailsBtn = document.getElementById('view-details');
    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', handleViewDetails);
    }

    const startRoutePointBtn = document.getElementById('start-route');
    if (startRoutePointBtn) {
        startRoutePointBtn.addEventListener('click', () => handleRoutePoint('start'));
    }

    const addToRouteBtn = document.getElementById('add-to-route');
    if (addToRouteBtn) {
        addToRouteBtn.addEventListener('click', () => handleRoutePoint('waypoint'));
    }

    const endRouteBtn = document.getElementById('end-route');
    if (endRouteBtn) {
        endRouteBtn.addEventListener('click', () => handleRoutePoint('end'));
    }
}

// Google Maps initialization
window.initMap = () => {
    console.log("Google Maps API loaded. Initializing map...");
    const mapElement = document.getElementById('map-container');
    mapElement.innerHTML = '';
    const actualMapDiv = document.createElement('div');
    actualMapDiv.id = 'map';
    mapElement.appendChild(actualMapDiv);

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
        mapTypeControl: false,
        streetViewControl: false,
        mapId: 'DEMO_MAP_ID' // Replace with your actual Map ID from Google Cloud Console
    });

    infoWindow = new google.maps.InfoWindow();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true
    });

    // Initialize context menu
    contextMenu = document.getElementById('map-context-menu');
    
    // Setup satellite view toggle
    const toggleSatelliteBtn = document.getElementById('toggle-satellite-btn');
    if (toggleSatelliteBtn) {
        toggleSatelliteBtn.addEventListener('click', () => {
            const currentType = map.getMapTypeId();
            map.setMapTypeId(
                currentType === 'satellite' ? 'roadmap' : 'satellite'
            );
        });
    }

    // Add click listener for both distance measurement and route planning
    map.addListener('click', (e) => {
        const clickedPoint = e.latLng;

        if (isRoutePlanning) {
            addMarkerToRoute(clickedPoint);
        } else if (isDistanceMeasuring) {
            if (!measureStartPoint) {
                measureStartPoint = clickedPoint;
                // Add a marker at the start point
                const startMarker = createDistanceMarker(clickedPoint, 'A');
                distanceMarkers.push(startMarker);
                
                infoWindow.setContent('Click anywhere on the map to measure distance from this point');
                infoWindow.setPosition(clickedPoint);
                infoWindow.open(map);
            } else {
                // Add end point marker
                const endMarker = createDistanceMarker(clickedPoint, 'B');
                distanceMarkers.push(endMarker);
                
                // Calculate distance
                const distance = google.maps.geometry.spherical.computeDistanceBetween(
                    measureStartPoint,
                    clickedPoint
                );
                const distanceKm = (distance / 1000).toFixed(2);
                
                // Draw a line between points
                if (distancePolyline) {
                    distancePolyline.setMap(null);
                }
                distancePolyline = new google.maps.Polyline({
                    path: [measureStartPoint, clickedPoint],
                    geodesic: true,
                    strokeColor: '#4285F4',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                distancePolyline.setMap(map);

                // Show distance in info window
                const content = `
                    <div style="text-align: center;">
                        <p><strong>Distance:</strong> ${distanceKm} km</p>
                        <button onclick="startNewMeasurement()">Measure New Distance</button>
                    </div>
                `;
                infoWindow.setContent(content);
                infoWindow.setPosition(clickedPoint);
                
                // Add global function for the button
                window.startNewMeasurement = () => {
                    measureStartPoint = null;
                    clearDistanceMeasurement();
                    infoWindow.setContent('Click anywhere on the map to set the first point');
                };
            }
        } else {
            if (contextMenu) {
                contextMenu.style.display = 'none';
            }
        }
    });

    // Add right-click listener for setting end point in route planning
    map.addListener('rightclick', (e) => {
        if (isRoutePlanning && routePoints.length > 0) {
            const clickedPoint = e.latLng;
            addMarkerToRoute(clickedPoint);
            isRoutePlanning = false;
            map.setOptions({ draggableCursor: null });
        }
    });

    // Initialize route planning button
    const routePlanBtn = document.createElement('button');
    routePlanBtn.textContent = 'Plan Route';
    routePlanBtn.className = 'map-control-btn';
    routePlanBtn.onclick = startRoutePlanning;
    
    const mapControls = document.querySelector('.map-type-control');
    if (mapControls) {
        mapControls.appendChild(routePlanBtn);
    }

    // Prevent default context menu on the map
    map.addListener('contextmenu', (e) => {
        e.preventDefault();
    });

    loadAndDisplayData();
    populateDropdownOptions();
}

function startDistanceMeasurement() {
    isDistanceMeasuring = true;
    measureStartPoint = null;
    clearDistanceMeasurement();
    infoWindow.close();
    infoWindow.setContent('Click anywhere on the map to set the first point');
    map.setOptions({ draggableCursor: 'crosshair' });
}

function clearDistanceMeasurement() {
    // Clear existing markers
    for (const marker of distanceMarkers) {
        marker.setMap(null);
    }
    distanceMarkers = [];
    
    // Clear existing line
    if (distancePolyline) {
        distancePolyline.setMap(null);
    }
    
    if (measureMarker) {
        measureMarker.setMap(null);
    }
}

function resetDistanceMeasurement() {
    isDistanceMeasuring = false;
    measureStartPoint = null;
    clearDistanceMeasurement();
    infoWindow.close();
    map.setOptions({ draggableCursor: null });
}

function createDistanceMarker(position, label) {
    return new google.maps.Marker({
        position,
        map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
        },
        label: {
            text: label,
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 'bold'
        }
    });
}

function handleViewDetails() {
    if (selectedMarker) {
        const location = selectedMarker.location;
        const content = `
            <h3>${location.name}</h3>
            <p><strong>Address:</strong> ${location.address}</p>
            <p><strong>Project Status:</strong> ${location.project_status}</p>
            <p><strong>Billing Location:</strong> ${location.billing_location}</p>
            <p><strong>Resource Location:</strong> ${location.resource_location}</p>
            <p><strong>Role:</strong> ${location.role}</p>
            <p><strong>Resource Status:</strong> ${location.resource_status}</p>
            <p><a href="#" onclick="showProjectSummary('${location.id}')">View Project Summary</a></p>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, selectedMarker);
    }
    contextMenu.style.display = 'none';
}

function handleRoutePoint(type) {
    if (!selectedMarker) return;
    
    const location = selectedMarker.location;
    const waypoint = {
        location: new google.maps.LatLng(location.lat, location.lng),
        name: location.name
    };

    const routeInstructions = document.getElementById('route-instructions');

    switch(type) {
        case 'start':
            routeWaypoints = [waypoint];
            if (routeInstructions) {
                routeInstructions.textContent = 'Select additional waypoints or an end point';
            }
            break;
        case 'waypoint':
            if (routeWaypoints.length > 0 && routeWaypoints.length < 8) {
                routeWaypoints.push(waypoint);
                if (routeInstructions) {
                    routeInstructions.textContent = `Added ${location.name}. Select more waypoints or an end point`;
                }
            }
            break;
        case 'end':
            if (routeWaypoints.length > 0) {
                routeWaypoints.push(waypoint);
                calculateRoute();
            }
            break;
    }

    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

function calculateRoute() {
    if (routePoints.length < 2) return;

    const origin = routePoints[0].location;
    const destination = routePoints[routePoints.length - 1].location;
    const waypoints = routePoints.slice(1, -1).map(point => ({
        location: point.location,
        stopover: true
    }));

    directionsService.route({
        origin,
        destination,
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
            displayRouteInfo(response);
        } else {
            const routeInstructions = document.getElementById('route-instructions');
            if (routeInstructions) {
                routeInstructions.textContent = `Could not calculate route: ${status}`;
            }
        }
    });
}

function displayRouteInfo(response) {
    const route = response.routes[0];
    const legs = route.legs;
    const totalDistance = legs.reduce((acc, leg) => acc + leg.distance.value, 0);
    const totalDuration = legs.reduce((acc, leg) => acc + leg.duration.value, 0);
    const waypointOrder = route.waypoint_order;

    // Clear existing info windows
    for (const infoWindow of infoWindows) {
        infoWindow.close();
    }
    infoWindows = [];
    
    // Create info windows for each leg of the journey
    legs.forEach((leg, index) => {
        const midPoint = new google.maps.LatLng(
            (leg.start_location.lat() + leg.end_location.lat()) / 2,
            (leg.start_location.lng() + leg.end_location.lng()) / 2
        );

        const infoWindow = new google.maps.InfoWindow({
            position: midPoint,
            content: `
                <div class="route-info-window">
                    <p><strong>Distance:</strong> ${leg.distance.text}</p>
                    <p><strong>Time:</strong> ${leg.duration.text}</p>
                </div>
            `
        });

        infoWindow.open(map);
        infoWindows.push(infoWindow);
    });
    
    // Generate waypoints list
    const waypointsList = waypointOrder
        .map(index => `<li>${routePoints[index + 1].name}</li>`)
        .join('');
    
    const routeDetails = `
        <h4>Route Details:</h4>
        <ol>
            <li>${routePoints[0].name}</li>
            ${waypointsList}
            <li>${routePoints[routePoints.length - 1].name}</li>
        </ol>
        <p><strong>Total Distance:</strong> ${(totalDistance / 1000).toFixed(2)} km</p>
        <p><strong>Estimated Time:</strong> ${Math.round(totalDuration / 60)} minutes</p>
        <button onclick="clearRoute(); startRoutePlanning();">Plan New Route</button>
    `;
    
    const routeInfoPanel = document.getElementById('route-info-panel');
    const routeDetailsElement = document.getElementById('route-details');

    if (routeDetailsElement) {
        routeDetailsElement.innerHTML = routeDetails;
    }
    
    if (routeInfoPanel) {
        routeInfoPanel.classList.add('show');
    }
}

function startRoutePlanning() {
    isRoutePlanning = true;
    clearRoute();
    map.setOptions({ draggableCursor: 'crosshair' });
    
    const routeInstructions = document.getElementById('route-instructions');
    if (routeInstructions) {
        routeInstructions.textContent = 'Click anywhere on the map to set the start point';
    }
}

function clearRoute() {
    // Clear existing route markers
    for (const marker of routeMarkers) {
        marker.setMap(null);
    }
    // Clear info windows
    for (const infoWindow of infoWindows) {
        infoWindow.close();
    }
    infoWindows = [];
    routeMarkers = [];
    routePoints = [];
    routeWaypoints = [];
    
    // Clear directions
    if (directionsRenderer) {
        directionsRenderer.setDirections({ routes: [] });
    }
    
    // Hide route info panel
    const routeInfoPanel = document.getElementById('route-info-panel');
    if (routeInfoPanel) {
        routeInfoPanel.classList.remove('show');
    }
}

function createRouteMarker(position, label) {
    return new google.maps.Marker({
        position,
        map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#FF4081',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
        },
        label: {
            text: label,
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 'bold'
        }
    });
}

function addMarkerToRoute(position, name = null) {
    const pointName = name || (routePoints.length === 0 ? 'Start Point' : 
        (routePoints.length === 1 && !isRoutePlanning ? 'End Point' : `Waypoint ${routePoints.length}`));
    
    routePoints.push({
        location: position,
        name: pointName
    });
    
    const label = String.fromCharCode(65 + routePoints.length - 1); // A, B, C, etc.
    const marker = createRouteMarker(position, label);
    routeMarkers.push(marker);
    
    if (routePoints.length > 1) {
        calculateRoute();
    }
    
    const routeInstructions = document.getElementById('route-instructions');
    if (routeInstructions) {
        if (routePoints.length === 1) {
            routeInstructions.textContent = 'Click on map or markers to add waypoints, right-click for end point';
        } else if (!isRoutePlanning) {
            routeInstructions.textContent = 'Route planning completed';
        }
    }
}

function initializeMarkerForRouting(marker, markerData) {
    marker.addListener('click', () => {
        if (isRoutePlanning) {
            addMarkerToRoute(marker.position, markerData.name);
        }
    });

    // Add right-click handling for markers
    marker.addListener('rightclick', () => {
        if (isRoutePlanning && routePoints.length > 0) {
            addMarkerToRoute(marker.position, markerData.name);
            isRoutePlanning = false;
            map.setOptions({ draggableCursor: null });
        }
    });
}

function addMarkerToMap(location) {
    if (!map || !google || !google.maps) {
        console.warn("Map not initialized or Google Maps API not ready");
        return;
    }

    const position = {
        lat: Number.parseFloat(location.lat),
        lng: Number.parseFloat(location.lng)
    };

    const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        map,
        title: location.name
    });

    // Store location data with marker
    marker.location = location;

    // Add click listener using the new gmp-click event
    marker.addEventListener('gmp-click', () => {
        const content = `
            <h3>${location.name}</h3>
            <p><strong>Status:</strong> ${location.project_status}</p>
            <p><strong>Role:</strong> ${location.role}</p>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
    });

    // Add right-click listener
    marker.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        selectedMarker = marker;
        if (contextMenu) {
            // Get the marker's pixel position on the map
            const scale = 2 ** map.getZoom();
            const nw = new google.maps.LatLng(
                map.getBounds().getNorthEast().lat(),
                map.getBounds().getSouthWest().lng()
            );
            const worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
            const worldCoordinate = map.getProjection().fromLatLngToPoint(marker.position);
            const pixelOffset = new google.maps.Point(
                Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
                Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
            );

            // Get the map container's position
            const mapContainer = map.getDiv();
            const rect = mapContainer.getBoundingClientRect();

            // Calculate the actual pixel position on the page
            const x = rect.left + pixelOffset.x;
            const y = rect.top + pixelOffset.y;

            // Position the context menu
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${x}px`;
            contextMenu.style.top = `${y}px`;

            // Add click listener to close context menu when clicking outside
            setTimeout(() => {
                const closeContextMenu = (event) => {
                    if (!contextMenu.contains(event.target)) {
                        contextMenu.style.display = 'none';
                        document.removeEventListener('click', closeContextMenu);
                    }
                };
                document.addEventListener('click', closeContextMenu);
            }, 0);
        }
    });

    activeMarkers.push(marker);

    initializeMarkerForRouting(marker, location);

    return marker;
}

async function populateDropdownOptions() {
    try {
        const response = await fetchMockReportData();
        const locations = response.data;

        // Extract unique values
        const billingLocations = [...new Set(locations.map(l => l.billing_location))];
        const resourceLocations = [...new Set(locations.map(l => l.resource_location))];
        const roles = [...new Set(locations.map(l => l.role))];

        // Update dropdowns
        dropdowns.billingLocation.options = billingLocations;
        dropdowns.resourceLocation.options = resourceLocations;
        dropdowns.role.options = roles;

        // Update dropdown lists
        for (const key of Object.keys(dropdowns)) {
            updateDropdownList(key, dropdowns[key].options);
        }
    } catch (error) {
        console.error("Error populating dropdown options:", error);
    }
}

function collectFilters() {
    return {
        project_status: dropdowns.projectStatus.selected,
        billing_location: dropdowns.billingLocation.selected,
        resource_location: dropdowns.resourceLocation.selected,
        role: dropdowns.role.selected,
        resource_status: dropdowns.resourceStatus.selected
    };
}

function resetAllFilters() {
    for (const key of Object.keys(dropdowns)) {
        dropdowns[key].selected = '';
        dropdowns[key].input.value = '';
    }
    loadAndDisplayData();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeDropdowns();
    initializeUI();
});

// Function to show project summary (placeholder)
function showProjectSummary(projectId) {
    alert(`Project summary for ID ${projectId} would open in a new tab`);
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

// Add styles for info windows
const infoWindowStyles = `
    .info-window {
        padding: 12px;
        max-width: 300px;
        font-family: Arial, sans-serif;
    }
    .info-window h3 {
        color: var(--primary-blue);
        margin: 0 0 10px 0;
        font-size: 16px;
    }
    .info-window p {
        margin: 5px 0;
        font-size: 14px;
        line-height: 1.4;
    }
    .info-window strong {
        color: var(--secondary-blue);
    }
`;

// Add the styles to document
const styleElement = document.createElement('style');
styleElement.textContent = infoWindowStyles;
document.head.appendChild(styleElement);

function createMarker(data) {
    const style = dropdownControllers.projectStatus.getSelected().includes(data.projectStatus) ? MARKER_STYLES[data.projectStatus] || MARKER_STYLES.default : MARKER_STYLES.default;
    
    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: data.position,
        map,
        title: data.name,
        content: new google.maps.marker.PinElement({
            scale: style.scale,
            background: style.fillColor,
            borderColor: style.strokeColor,
            glyph: data.projectStatus[0] // First letter of status
        })
    });

    // Add click listener for marker
    marker.addListener('click', () => {
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
        
        const content = `
            <div class="info-window">
                <h3>${data.name}</h3>
                <p><strong>Project Status:</strong> ${data.projectStatus}</p>
                <p><strong>Billing Location:</strong> ${data.billingLocation}</p>
                <p><strong>Resource Location:</strong> ${data.resourceLocation}</p>
                <p><strong>Roles:</strong> ${data.roles.join(', ')}</p>
                <p><strong>Resource Status:</strong> ${data.resourceStatus}</p>
            </div>
        `;

        if (infoWindow) {
            infoWindow.close();
        }
        infoWindow = new google.maps.InfoWindow({
            content: content
        });
        infoWindow.open(map, marker);
    });

    initializeMarkerForRouting(marker, data);
    return marker;
}

function updateMapMarkers(filteredData) {
    // Use a DocumentFragment for better performance
    const bounds = new google.maps.LatLngBounds();
    const newMarkers = [];

    // Clear existing markers efficiently
    for (const marker of activeMarkers) {
        marker.setMap(null);
    }
    activeMarkers = [];

    // Create all new markers
    for (const location of filteredData) {
        const marker = createMarker(location);
        newMarkers.push(marker);
        bounds.extend(marker.position);
    }

    // Batch update the map
    requestAnimationFrame(() => {
        activeMarkers = newMarkers;
        if (newMarkers.length > 0) {
            map.fitBounds(bounds);
        }
    });
}

function initializeSearchableDropdown(inputId, listId, options, onSelectionChange) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    let selectedItems = new Set();

    function updateDropdown() {
        const searchTerm = input.value.toLowerCase();
        const filteredOptions = options.filter(option => 
            option.toLowerCase().includes(searchTerm)
        );

        list.innerHTML = '';
        for (const option of filteredOptions) {
            const item = document.createElement('div');
            item.className = `dropdown-item${selectedItems.has(option) ? ' selected' : ''}`;
            item.textContent = option;
            
            // Simpler click handler for immediate update
            item.addEventListener('click', () => {
                const wasSelected = selectedItems.has(option);
                
                // Toggle selection
                if (wasSelected) {
                    selectedItems.delete(option);
                    item.classList.remove('selected');
                } else {
                    selectedItems.add(option);
                    item.classList.add('selected');
                }
                
                // Clear input and trigger update
                input.value = '';
                
                // Immediately call the change handler
                onSelectionChange(Array.from(selectedItems));
            });
            
            list.appendChild(item);
        }
    }

    // Show dropdown on focus
    input.addEventListener('focus', () => {
        list.style.display = 'block';
        updateDropdown();
    });

    // Update dropdown on input
    input.addEventListener('input', () => {
        list.style.display = 'block';
        updateDropdown();
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !list.contains(e.target)) {
            list.style.display = 'none';
        }
    });

    return {
        getSelected: () => Array.from(selectedItems),
        setSelected: (items) => {
            selectedItems = new Set(items);
            updateDropdown();
        },
        clear: () => {
            selectedItems.clear();
            input.value = '';
            updateDropdown();
            onSelectionChange([]); // Trigger update when clearing
        }
    };
}

function initializeFilters() {
    // Initialize all dropdowns with their options and immediate filtering
    dropdownControllers = {
        projectStatus: initializeSearchableDropdown(
            'project-status-search',
            'project-status-list',
            mockProjectStatuses,
            () => applyFilters() // Direct call to applyFilters
        ),
        billingLocation: initializeSearchableDropdown(
            'billing-location-search',
            'billing-location-list',
            mockBillingLocations,
            () => applyFilters() // Direct call to applyFilters
        ),
        resourceLocation: initializeSearchableDropdown(
            'resource-location-search',
            'resource-location-list',
            mockResourceLocations,
            () => applyFilters() // Direct call to applyFilters
        ),
        role: initializeSearchableDropdown(
            'role-search',
            'role-list',
            mockRoles,
            () => applyFilters() // Direct call to applyFilters
        ),
        resourceStatus: initializeSearchableDropdown(
            'resource-status-search',
            'resource-status-list',
            mockResourceStatuses,
            () => applyFilters() // Direct call to applyFilters
        )
    };

    // Initialize reset button
    const resetButton = document.getElementById('reset-filters-btn');
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }

    // Initial load of all data
    applyFilters();
}

function resetFilters() {
    // Clear all dropdowns
    for (const controller of Object.values(dropdownControllers)) {
        controller.clear();
    }
    
    // Reset the map to show all markers
    applyFilters();
}

function applyFilters() {
    const filters = {
        projectStatuses: dropdownControllers.projectStatus.getSelected(),
        billingLocations: dropdownControllers.billingLocation.getSelected(),
        resourceLocations: dropdownControllers.resourceLocation.getSelected(),
        roles: dropdownControllers.role.getSelected(),
        resourceStatuses: dropdownControllers.resourceStatus.getSelected()
    };

    // Filter the data based on selected values
    const filteredData = mockData.filter(location => {
        return (
            (filters.projectStatuses.length === 0 || filters.projectStatuses.includes(location.projectStatus)) &&
            (filters.billingLocations.length === 0 || filters.billingLocations.includes(location.billingLocation)) &&
            (filters.resourceLocations.length === 0 || filters.resourceLocations.includes(location.resourceLocation)) &&
            (filters.roles.length === 0 || filters.roles.some(role => location.roles.includes(role))) &&
            (filters.resourceStatuses.length === 0 || filters.resourceStatuses.includes(location.resourceStatus))
        );
    });

    // Update markers immediately
    updateMapMarkers(filteredData);
}

// Define marker styles for different types
const MARKER_STYLES = {
    'Active': {
        scale: 1.2,
        fillColor: '#4CAF50', // Green
        strokeColor: '#ffffff'
    },
    'On Hold': {
        scale: 1.0,
        fillColor: '#FFC107', // Amber
        strokeColor: '#ffffff'
    },
    'Completed': {
        scale: 0.9,
        fillColor: '#2196F3', // Blue
        strokeColor: '#ffffff'
    },
    'Cancelled': {
        scale: 0.8,
        fillColor: '#F44336', // Red
        strokeColor: '#ffffff'
    },
    'default': {
        scale: 1.0,
        fillColor: '#757575', // Gray
        strokeColor: '#ffffff'
    }
};