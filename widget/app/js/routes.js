// New Route Planning System with Search-based Interface
let routePlanningActive = false;
let routeMarkers = [];
let routePoints = [];
let routeDirectionsRenderer;
let routeDirectionsService;
let routeDropdowns = {};
let waypointCount = 0;
let activeWaypoints = []; // Track active waypoint indices

// Local copy of coordinate validation utility (in case data.js hasn't loaded yet)
function hasValidCoordinates(location) {
    if (!location) return false;
    
    // Use root-level lat/lng fields
    const lat = location.lat;
    const lng = location.lng;
    
    // Check if coordinates are valid numbers and within proper ranges
    return lat !== null && lng !== null && 
           !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180 &&
           lat !== 0 && lng !== 0; // Exclude default 0,0 coordinates
}

// Initialize route planning system
function initializeRoutePlanning() {
    
    // Initialize directions service and renderer
    if (google && google.maps && !routeDirectionsService) {
        routeDirectionsService = new google.maps.DirectionsService();
        routeDirectionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            draggable: false
        });
    }

    // Initialize dropdown objects for route planning
    routeDropdowns = {
        start: {
            input: null,
            list: null,
            options: [],
            selected: null
        },
        end: {
            input: null,
            list: null,
            options: [],
            selected: null
        },
        waypoints: []
    };

    // Only populate options here, event listeners already set up in UI init
    populateRouteDropdownOptions();
}

// Initialize UI immediately (doesn't need Google Maps)
function initializeRoutePlanningUI() {
    
    // Initialize dropdown objects for route planning
    routeDropdowns = {
        start: {
            input: null,
            list: null,
            options: [],
            selected: null
        },
        end: {
            input: null,
            list: null,
            options: [],
            selected: null
        },
        waypoints: []
    };

    // Setup event listeners immediately
    setupRoutePlanningEventListeners();
    
    // Populate options immediately if possible, or wait for data
    populateRouteDropdownOptions();
}

function setupRoutePlanningEventListeners() {
    
    // Panel toggle button
    const togglePanelBtn = document.getElementById('toggle-route-panel');
    if (togglePanelBtn) {
        togglePanelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleRoutePanel();
        });
    } else {
    }

    // Add waypoint button
    const addWaypointBtn = document.getElementById('add-waypoint-btn');
    if (addWaypointBtn) {
        // Remove any existing event listeners first
        addWaypointBtn.removeEventListener('click', addWaypoint);
        addWaypointBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addWaypoint();
        });
    } else {
    }

    // Calculate route button
    const calculateRouteBtn = document.getElementById('calculate-route-btn');
    if (calculateRouteBtn) {
        calculateRouteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            calculateRoute();
        });
    } else {
    }

    // Clear route button
    const clearRouteBtn = document.getElementById('clear-route-btn');
    if (clearRouteBtn) {
        clearRouteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearRoute();
        });
    } else {
    }

    // Google Maps button
    const googleMapsBtn = document.getElementById('open-in-google-maps-btn');
    if (googleMapsBtn) {
        googleMapsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openInGoogleMaps();
        });
    } else {
    }

    // Setup start and end dropdowns
    setupRouteDropdown('start');
    setupRouteDropdown('end');
}

// Route planning is now always active and visible
routePlanningActive = true;

function toggleRoutePanel() {
    const panelContent = document.getElementById('route-panel-content');
    const toggleBtn = document.getElementById('toggle-route-panel');
    
    if (!panelContent) {
        return;
    }
    
    if (!toggleBtn) {
        return;
    }
    
    
    if (panelContent.classList.contains('collapsed')) {
        panelContent.classList.remove('collapsed');
        toggleBtn.textContent = '−';
    } else {
        panelContent.classList.add('collapsed');
        toggleBtn.textContent = '+';
    }
}

function setupRouteDropdown(type) {
    const dropdown = routeDropdowns[type];
    const inputId = `route-${type}-search`;
    const listId = `route-${type}-list`;
    
    
    dropdown.input = document.getElementById(inputId);
    dropdown.list = document.getElementById(listId);


    if (!dropdown.input || !dropdown.list) {
        return;
    }

    // Input event listener for search
    dropdown.input.addEventListener('input', () => {
        const searchTerm = dropdown.input.value.toLowerCase();
        
        const filteredOptions = dropdown.options.filter(option => {
            if (!option || !option.name || typeof option.name !== 'string') return false;
            
            if (option.type === 'project' && option.id) {
                return option.id.toString().toLowerCase().includes(searchTerm) ||
                       option.name.toLowerCase().includes(searchTerm);
            } else {
                return option.name.toLowerCase().includes(searchTerm);
            }
        });
        
        updateRouteDropdownList(type, filteredOptions);
        dropdown.list.classList.add('show');
    });

    // Focus event listener
    dropdown.input.addEventListener('focus', () => {
        updateRouteDropdownList(type, dropdown.options);
        dropdown.list.classList.add('show');
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!dropdown.input.contains(e.target) && !dropdown.list.contains(e.target)) {
            dropdown.list.classList.remove('show');
        }
    });
}

function setupWaypointDropdown(index) {
    const waypoint = routeDropdowns.waypoints[index];
    if (!waypoint) return;

    waypoint.input = document.getElementById(`route-waypoint-${index}-search`);
    waypoint.list = document.getElementById(`route-waypoint-${index}-list`);

    if (!waypoint.input || !waypoint.list) {
        return;
    }

    // Input event listener for search
    waypoint.input.addEventListener('input', () => {
        const searchTerm = waypoint.input.value.toLowerCase();
        const filteredOptions = waypoint.options.filter(option => {
            if (!option || !option.name || typeof option.name !== 'string') return false;
            
            if (option.type === 'project' && option.id) {
                return option.id.toString().toLowerCase().includes(searchTerm) ||
                       option.name.toLowerCase().includes(searchTerm);
            } else {
                return option.name.toLowerCase().includes(searchTerm);
            }
        });
        updateRouteDropdownList(`waypoint-${index}`, filteredOptions);
        waypoint.list.classList.add('show');
    });

    // Focus event listener
    waypoint.input.addEventListener('focus', () => {
        updateRouteDropdownList(`waypoint-${index}`, waypoint.options);
        waypoint.list.classList.add('show');
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!waypoint.input.contains(e.target) && !waypoint.list.contains(e.target)) {
            waypoint.list.classList.remove('show');
        }
    });
}

function updateRouteDropdownList(dropdownKey, options) {
    let dropdown, list;
    
    if (dropdownKey === 'start' || dropdownKey === 'end') {
        dropdown = routeDropdowns[dropdownKey];
        list = dropdown ? dropdown.list : null;
    } else if (dropdownKey.startsWith('waypoint-')) {
        const index = parseInt(dropdownKey.split('-')[1]);
        dropdown = routeDropdowns.waypoints[index];
        list = dropdown ? dropdown.list : null;
    }

    if (!list || !dropdown) return;

    list.innerHTML = '';
    for (const option of options) {
        // Skip undefined, null, or invalid options
        if (!option || !option.name || typeof option.name !== 'string') continue;
        
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        
        // Create display text based on option type
        let displayText;
        if (option.type === 'project' && option.projectNumber) {
            displayText = `${option.projectNumber} - ${option.name}`;
        } else if (option.type === 'project' && option.id) {
            displayText = `${option.id} - ${option.name}`;
        } else if (option.type && option.name) {
            displayText = `${option.name} (${option.type})`;
        } else {
            displayText = option.name;
        }
        
        item.textContent = displayText;
        item.addEventListener('click', () => {
            dropdown.selected = option;
            dropdown.input.value = displayText;
            list.classList.remove('show');
        });
        list.appendChild(item);
    }
}

async function populateRouteDropdownOptions() {
    try {
        // Check if filter manager is available
        if (!window.filterManager || typeof window.filterManager.getAllLocationsForRouting !== 'function') {
            setTimeout(populateRouteDropdownOptions, 500);
            return;
        }
        
        // Get ALL locations with valid coordinates for routing (ignoring filters)
        const routingData = await window.filterManager.getAllLocationsForRouting();
        
        // Use the combined locations (all already filtered by valid coordinates)
        const allOptions = routingData.combined.map(location => ({
            id: location.id,
            name: location.name,
            lat: location.lat,
            lng: location.lng,
            type: location.type,
            address: location.address,
            displayText: location.displayText,
            projectNumber: location.projectNumber
        }));

        console.log(`Route planning loaded ${allOptions.length} locations:`, {
            projects: routingData.byType.projects.length,
            resources: routingData.byType.resources.length,
            billing: routingData.byType.billing.length,
            total: allOptions.length
        });


        // Populate all dropdowns with all options
        routeDropdowns.start.options = allOptions;
        routeDropdowns.end.options = allOptions;
        
        // Update waypoint options
        routeDropdowns.waypoints.forEach(waypoint => {
            if (waypoint) {
                waypoint.options = allOptions;
            }
        });
        
        
        // Re-setup the dropdowns now that we have data
        if (routeDropdowns.start.input && routeDropdowns.end.input) {
        } else {
            setupRouteDropdown('start');
            setupRouteDropdown('end');
        }

    } catch (error) {
    }
}

function addWaypoint() {
    const waypointsContainer = document.getElementById('route-waypoints-container');
    
    if (!waypointsContainer) {
        return;
    }

    const waypointIndex = waypointCount++;
    activeWaypoints.push(waypointIndex);
    const waypointDisplayNumber = activeWaypoints.length;
    

    // Create waypoint HTML with same UI as start/end
    const waypointDiv = document.createElement('div');
    waypointDiv.className = 'route-search-field';
    waypointDiv.id = `route-waypoint-${waypointIndex}`;
    waypointDiv.innerHTML = `
        <label for="route-waypoint-${waypointIndex}-search">
            Waypoint ${waypointDisplayNumber}:
            <button class="remove-waypoint-btn" onclick="removeWaypoint(${waypointIndex})" title="Remove waypoint">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 6h18l-1.5 15H4.5L3 6zm3-4h12v2H6V2zm2 6v10h2V8H8zm4 0v10h2V8h-2z"/>
                </svg>
            </button>
        </label>
        <div class="searchable-dropdown" id="route-waypoint-${waypointIndex}-dropdown">
            <input type="text" id="route-waypoint-${waypointIndex}-search" placeholder="Search waypoint location...">
            <div class="dropdown-list" id="route-waypoint-${waypointIndex}-list"></div>
        </div>
    `;

    waypointsContainer.appendChild(waypointDiv);

    // Initialize dropdown for this waypoint
    const waypointDropdown = {
        input: null,
        list: null,
        options: routeDropdowns.start.options || [], // Copy options from start dropdown
        selected: null
    };
    
    routeDropdowns.waypoints[waypointIndex] = waypointDropdown;
    setupWaypointDropdown(waypointIndex);
    
}

function removeWaypoint(index) {
    const waypointDiv = document.getElementById(`route-waypoint-${index}`);
    if (waypointDiv) {
        waypointDiv.remove();
        delete routeDropdowns.waypoints[index];
        
        // Remove from active waypoints array
        const activeIndex = activeWaypoints.indexOf(index);
        if (activeIndex > -1) {
            activeWaypoints.splice(activeIndex, 1);
        }
        
        // Renumber all remaining waypoints
        renumberWaypoints();
        
    } else {
    }
}

function renumberWaypoints() {
    activeWaypoints.forEach((waypointIndex, displayIndex) => {
        const waypointDiv = document.getElementById(`route-waypoint-${waypointIndex}`);
        if (waypointDiv) {
            const labelElement = waypointDiv.querySelector('label');
            if (labelElement) {
                // Keep the remove button but update the label text
                const removeBtn = labelElement.querySelector('.remove-waypoint-btn');
                const removeBtnHTML = removeBtn ? removeBtn.outerHTML : '';
                labelElement.innerHTML = `Waypoint ${displayIndex + 1}: ${removeBtnHTML}`;
            }
        }
    });
}

function calculateRoute() {
    // Clear existing route
    clearRouteMarkers();

    // Check if we have at least start and end
    if (!routeDropdowns.start.selected || !routeDropdowns.end.selected) {
        alert('Please select both start and end locations');
        return;
    }

    // Collect all selected locations
    const startLocation = routeDropdowns.start.selected;
    const endLocation = routeDropdowns.end.selected;
    const waypoints = [];

    // Get waypoints
    routeDropdowns.waypoints.forEach(waypoint => {
        if (waypoint && waypoint.selected) {
            waypoints.push(waypoint.selected);
        }
    });

    // Create route points array
    routePoints = [startLocation, ...waypoints, endLocation];

    // Create markers for route points
    createRouteMarkers();

    // Calculate route using Google Directions API
    if (routeDirectionsService && routePoints.length >= 2) {
        const origin = new google.maps.LatLng(startLocation.lat, startLocation.lng);
        const destination = new google.maps.LatLng(endLocation.lat, endLocation.lng);
        const waypointLatLngs = waypoints.map(wp => ({
            location: new google.maps.LatLng(wp.lat, wp.lng),
            stopover: true
        }));

        routeDirectionsService.route({
            origin: origin,
            destination: destination,
            waypoints: waypointLatLngs,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING
        }, (response, status) => {
            if (status === 'OK') {
                routeDirectionsRenderer.setDirections(response);
                displayRouteInformation(response);
                showGoogleMapsButton();
            } else {
                alert('Could not calculate route: ' + status);
            }
        });
    }
}

function createRouteMarkers() {
    routePoints.forEach((point, index) => {
        const position = new google.maps.LatLng(point.lat, point.lng);
        let label, color;
        
        if (index === 0) {
            label = 'A';
            color = '#00C851'; // Green for start
        } else if (index === routePoints.length - 1) {
            label = 'B';
            color = '#ff4444'; // Red for end
        } else {
            label = String.fromCharCode(65 + index); // C, D, E, etc.
            color = '#ff8800'; // Orange for waypoints
        }
        
        const pinElement = new google.maps.marker.PinElement({
            background: color,
            borderColor: '#ffffff',
            glyphColor: '#ffffff',
            glyph: label,
            scale: 1.2
        });

        const marker = new google.maps.marker.AdvancedMarkerElement({
            position: position,
            map: map,
            content: pinElement.element,
            title: `${point.name} (${point.type})`
        });

        routeMarkers.push(marker);
    });
}

function displayRouteInformation(response) {
    const route = response.routes[0];
    const legs = route.legs;
    const totalDistance = legs.reduce((acc, leg) => acc + leg.distance.value, 0);
    const totalDuration = legs.reduce((acc, leg) => acc + leg.duration.value, 0);

    const routeDetails = `
        <h4>Route Summary:</h4>
        <p><strong>Total Distance:</strong> ${(totalDistance / 1000).toFixed(2)} km</p>
        <p><strong>Estimated Time:</strong> ${Math.round(totalDuration / 60)} minutes</p>
        <ol>
            ${routePoints.map((point, index) => 
                `<li>${point.name} (${point.type})</li>`
            ).join('')}
        </ol>
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

function showGoogleMapsButton() {
    const googleMapsDiv = document.getElementById('google-maps-directions');
    if (googleMapsDiv) {
        googleMapsDiv.style.display = 'block';
    }
}

function openInGoogleMaps() {
    if (routePoints.length < 2) {
        alert('No route calculated to open in Google Maps');
        return;
    }

    // Create Google Maps URL
    const origin = `${routePoints[0].lat},${routePoints[0].lng}`;
    const destination = `${routePoints[routePoints.length - 1].lat},${routePoints[routePoints.length - 1].lng}`;
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    
    // Add waypoints if any
    if (routePoints.length > 2) {
        const waypoints = routePoints.slice(1, -1).map(point => `${point.lat},${point.lng}`).join('|');
        url += `&waypoints=${waypoints}`;
    }

    window.open(url, '_blank');
}

function clearRoute() {
    clearRouteMarkers();
    
    if (routeDirectionsRenderer) {
        routeDirectionsRenderer.setDirections({ routes: [] });
    }

    // Clear all input fields
    if (routeDropdowns.start.input) routeDropdowns.start.input.value = '';
    if (routeDropdowns.end.input) routeDropdowns.end.input.value = '';
    routeDropdowns.start.selected = null;
    routeDropdowns.end.selected = null;

    // Clear waypoints
    const waypointsContainer = document.getElementById('route-waypoints-container');
    if (waypointsContainer) {
        waypointsContainer.innerHTML = '';
    }
    routeDropdowns.waypoints = [];
    waypointCount = 0;
    activeWaypoints = [];

    // Hide route info and Google Maps button
    const routeInfoPanel = document.getElementById('route-info-panel');
    if (routeInfoPanel) {
        routeInfoPanel.classList.remove('show');
    }

    const googleMapsDiv = document.getElementById('google-maps-directions');
    if (googleMapsDiv) {
        googleMapsDiv.style.display = 'none';
    }

    routePoints = [];
}

function clearRouteMarkers() {
    routeMarkers.forEach(marker => {
        marker.map = null;
    });
    routeMarkers = [];
}

// Expose global functions for button onclick handlers
window.removeWaypoint = removeWaypoint;
window.setupRoutePlanningEventListeners = setupRoutePlanningEventListeners;
window.renumberWaypoints = renumberWaypoints;

// Initialize route manager
window.routeManager = {
    initializeRoutePlanning,
    initializeRoutePlanningUI,
    toggleRoutePanel,
    calculateRoute,
    clearRoute,
    openInGoogleMaps,
    get routePlanningActive() { return routePlanningActive; },
    get routePoints() { return routePoints; }
};