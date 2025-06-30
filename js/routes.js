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
    console.log('Initializing route planning...');
    
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
    console.log('Initializing route planning UI...');
    
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
    console.log('Setting up route planning event listeners...');
    
    // Panel toggle button
    const togglePanelBtn = document.getElementById('toggle-route-panel');
    if (togglePanelBtn) {
        console.log('Found toggle panel button, adding event listener');
        togglePanelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Toggle panel button clicked');
            toggleRoutePanel();
        });
    } else {
        console.error('Toggle panel button not found!');
    }

    // Add waypoint button
    const addWaypointBtn = document.getElementById('add-waypoint-btn');
    if (addWaypointBtn) {
        console.log('Found add waypoint button, adding event listener');
        // Remove any existing event listeners first
        addWaypointBtn.removeEventListener('click', addWaypoint);
        addWaypointBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Add waypoint button clicked');
            addWaypoint();
        });
    } else {
        console.error('Add waypoint button not found!');
    }

    // Calculate route button
    const calculateRouteBtn = document.getElementById('calculate-route-btn');
    if (calculateRouteBtn) {
        console.log('Found calculate route button, adding event listener');
        calculateRouteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Calculate route button clicked');
            calculateRoute();
        });
    } else {
        console.error('Calculate route button not found!');
    }

    // Clear route button
    const clearRouteBtn = document.getElementById('clear-route-btn');
    if (clearRouteBtn) {
        console.log('Found clear route button, adding event listener');
        clearRouteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Clear route button clicked');
            clearRoute();
        });
    } else {
        console.error('Clear route button not found!');
    }

    // Google Maps button
    const googleMapsBtn = document.getElementById('open-in-google-maps-btn');
    if (googleMapsBtn) {
        console.log('Found Google Maps button, adding event listener');
        googleMapsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Google Maps button clicked');
            openInGoogleMaps();
        });
    } else {
        console.log('Google Maps button not found (this is normal until route is calculated)');
    }

    // Setup start and end dropdowns
    setupRouteDropdown('start');
    setupRouteDropdown('end');
}

// Route planning is now always active and visible
routePlanningActive = true;

function toggleRoutePanel() {
    console.log('toggleRoutePanel called');
    const panelContent = document.getElementById('route-panel-content');
    const toggleBtn = document.getElementById('toggle-route-panel');
    
    if (!panelContent) {
        console.error('Panel content not found!');
        return;
    }
    
    if (!toggleBtn) {
        console.error('Toggle button not found!');
        return;
    }
    
    console.log('Current collapsed state:', panelContent.classList.contains('collapsed'));
    
    if (panelContent.classList.contains('collapsed')) {
        panelContent.classList.remove('collapsed');
        toggleBtn.textContent = '−';
        console.log('Panel expanded');
    } else {
        panelContent.classList.add('collapsed');
        toggleBtn.textContent = '+';
        console.log('Panel collapsed');
    }
}

function setupRouteDropdown(type) {
    console.log(`Setting up route dropdown for: ${type}`);
    const dropdown = routeDropdowns[type];
    const inputId = `route-${type}-search`;
    const listId = `route-${type}-list`;
    
    console.log(`Looking for input: ${inputId}`);
    console.log(`Looking for list: ${listId}`);
    
    dropdown.input = document.getElementById(inputId);
    dropdown.list = document.getElementById(listId);

    console.log(`Input found: ${!!dropdown.input}`);
    console.log(`List found: ${!!dropdown.list}`);
    console.log(`Current options count: ${dropdown.options.length}`);

    if (!dropdown.input || !dropdown.list) {
        console.error(`Route dropdown elements not found for ${type}`);
        console.error(`Input element: ${dropdown.input}`);
        console.error(`List element: ${dropdown.list}`);
        return;
    }

    // Input event listener for search
    console.log(`Adding input event listener for ${type}`);
    dropdown.input.addEventListener('input', () => {
        console.log(`Input event fired for ${type}, value: ${dropdown.input.value}`);
        const searchTerm = dropdown.input.value.toLowerCase();
        console.log(`Search term: ${searchTerm}`);
        console.log(`Available options count: ${dropdown.options.length}`);
        
        const filteredOptions = dropdown.options.filter(option => {
            if (!option || !option.name || typeof option.name !== 'string') return false;
            
            if (option.type === 'project' && option.id) {
                return option.id.toString().toLowerCase().includes(searchTerm) ||
                       option.name.toLowerCase().includes(searchTerm);
            } else {
                return option.name.toLowerCase().includes(searchTerm);
            }
        });
        
        console.log(`Filtered options count: ${filteredOptions.length}`);
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
        console.error(`Waypoint dropdown elements not found for index ${index}`);
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
        if (option.type === 'project' && option.id) {
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
    console.log('Populating route dropdown options...');
    try {
        // Check if IndexedDB service is available
        if (!window.indexedDBService || typeof window.indexedDBService.getProjectsFromDB !== 'function') {
            console.log('IndexedDB service not available yet, will retry...');
            setTimeout(populateRouteDropdownOptions, 500);
            return;
        }
        
        // Get projects directly from IndexedDB (no API call)
        const projects = await window.indexedDBService.getProjectsFromDB({});
        
        console.log('Fetched projects from IndexedDB count:', projects.length);
        if (projects.length > 0) {
            console.log('Sample project data:', projects[0]);
        }
        
        // COMMENTED OUT: Resources and billing APIs removed for simplification
        // const resourcesResponse = await fetchResourcesData({});
        // const billingResponse = await fetchBillingData({});
        // const resources = resourcesResponse.data || [];
        // const billing = billingResponse.data || [];

        // Create options for all location types
        const allOptions = [];

        // Add projects (only those with valid coordinates)
        projects.forEach(project => {
            console.log('Processing project for route dropdown:', project);
            if (project && project.projectName && project.address && hasValidCoordinates(project)) {
                const option = {
                    id: project.projectNumber || project.id,
                    name: project.projectName,
                    lat: project.lat,
                    lng: project.lng,
                    type: 'project',
                    address: project.address
                };
                console.log('Adding project option:', option);
                allOptions.push(option);
            } else {
                console.log('Project skipped - missing data or invalid coordinates:', {
                    hasName: !!project?.projectName,
                    hasAddress: !!project?.address,
                    hasValidCoords: project ? hasValidCoordinates(project) : false,
                    lat: project?.lat,
                    lng: project?.lng
                });
            }
        });

        // COMMENTED OUT: Resources and billing removed for simplification
        // // Add resources
        // resources.forEach(location => {
        //     if (location && location.resource && location.resource.employeeName && location.lat && location.lng) {
        //         const fullName = `${location.resource.employeeName.firstName || ''} ${location.resource.employeeName.lastName || ''}`.trim();
        //         const resourceAddress = `${location.resource.addresses?.permanent?.addressLine1 || ''}, ${location.resource.addresses?.permanent?.city || ''}, ${location.resource.addresses?.permanent?.state || ''}`.replace(/^,\s*|,\s*$/g, '');
        //         allOptions.push({
        //             id: location.resource.employeeId,
        //             name: fullName,
        //             lat: location.lat,
        //             lng: location.lng,
        //             type: 'resource',
        //             address: resourceAddress
        //         });
        //     }
        // });

        // // Add billing locations  
        // billing.forEach(location => {
        //     if (location && location.billing && location.billing.resourceName && location.lat && location.lng) {
        //         allOptions.push({
        //             id: location.billing.resourceId,
        //             name: location.billing.resourceName,
        //             lat: location.lat,
        //             lng: location.lng,
        //             type: 'billing',
        //             address: `Billing for ${location.billing.resourceName}`
        //         });
        //     }
        // });

        console.log('Total route options created:', allOptions.length);
        console.log('All route options:', allOptions);

        // Populate all dropdowns with all options
        routeDropdowns.start.options = allOptions;
        routeDropdowns.end.options = allOptions;
        
        // Update waypoint options
        routeDropdowns.waypoints.forEach(waypoint => {
            if (waypoint) {
                waypoint.options = allOptions;
            }
        });
        
        console.log('Route dropdown options populated successfully');
        console.log('Start dropdown options count:', routeDropdowns.start.options.length);
        console.log('End dropdown options count:', routeDropdowns.end.options.length);
        
        // Re-setup the dropdowns now that we have data
        if (routeDropdowns.start.input && routeDropdowns.end.input) {
            console.log('Dropdowns already initialized, options updated');
        } else {
            console.log('Re-initializing dropdowns with data');
            setupRouteDropdown('start');
            setupRouteDropdown('end');
        }

    } catch (error) {
        console.error("Error populating route dropdown options:", error);
    }
}

function addWaypoint() {
    console.log('=== addWaypoint function called ===');
    console.log('Current waypoint count:', waypointCount);
    console.log('Active waypoints:', activeWaypoints);
    const waypointsContainer = document.getElementById('route-waypoints-container');
    console.log('Waypoints container found:', !!waypointsContainer);
    
    if (!waypointsContainer) {
        console.error('Waypoints container not found!');
        return;
    }

    const waypointIndex = waypointCount++;
    activeWaypoints.push(waypointIndex);
    const waypointDisplayNumber = activeWaypoints.length;
    
    console.log('Creating waypoint with index:', waypointIndex, 'display number:', waypointDisplayNumber);

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
    
    console.log('Waypoint added successfully');
}

function removeWaypoint(index) {
    console.log('Removing waypoint with index:', index);
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
        
        console.log('Waypoint removed successfully');
    } else {
        console.error('Waypoint not found:', index);
    }
}

function renumberWaypoints() {
    console.log('Renumbering waypoints, active:', activeWaypoints);
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
                console.error('Directions request failed due to ' + status);
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