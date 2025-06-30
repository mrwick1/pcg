# routes.js Documentation

## Overview
Advanced route planning system providing multi-waypoint route calculation with Google Directions API integration. Features search-based location selection, dynamic waypoint management, and route optimization with export capabilities.

## Global State Variables
```javascript
let routePlanningActive = false;    // Route planning activation state (always true)
let routeMarkers = [];             // Array of route point markers
let routePoints = [];              // Array of selected route locations
let routeDirectionsRenderer;       // Google Directions renderer
let routeDirectionsService;        // Google Directions service
let routeDropdowns = {};           // Dropdown configurations for location selection
let waypointCount = 0;             // Counter for waypoint creation
let activeWaypoints = [];          // Array of active waypoint indices
```

## Core Functions

### initializeRoutePlanning()
Initializes Google Maps-dependent route planning features.

**Features:**
- Google Directions service and renderer setup
- Route dropdown initialization
- Automatic route options population
- Integration with Google Maps instance

**Configuration:**
```javascript
routeDirectionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,    // Use custom markers
    draggable: false         // Prevent route dragging
});
```

### initializeRoutePlanningUI()
Sets up route planning UI components independent of Google Maps.

**Features:**
- Dropdown object initialization
- Event listener setup
- UI component preparation
- Early route options population

**Dropdown Structure:**
```javascript
routeDropdowns = {
    start: { input, list, options: [], selected: null },
    end: { input, list, options: [], selected: null },
    waypoints: []  // Dynamic array for waypoint dropdowns
}
```

## Event Handler Setup

### setupRoutePlanningEventListeners()
Comprehensive event listener configuration for all UI components.

**Event Bindings:**
- **Panel Toggle**: Expand/collapse route planning panel
- **Add Waypoint**: Dynamic waypoint creation
- **Calculate Route**: Route computation trigger
- **Clear Route**: Route and marker cleanup
- **Google Maps Export**: External navigation integration

**Button Event Handlers:**
- Prevention of default form submission behavior
- Event propagation stopping for isolated functionality
- Comprehensive error logging for debugging

### setupRouteDropdown(type)
Configures individual dropdown functionality for location selection.

**Features:**
- Real-time search filtering
- Focus-triggered dropdown display
- Click-outside-to-close behavior
- Special handling for project search (PCC number + name)

**Search Logic:**
```javascript
// Project search supports both PCC number and name
if (option.type === 'project' && option.id) {
    return option.id.toString().toLowerCase().includes(searchTerm) ||
           option.name.toLowerCase().includes(searchTerm);
}
```

## UI Management

### toggleRoutePanel()
Handles route planning panel expand/collapse functionality.

**Features:**
- CSS class-based state management
- Toggle button text updates (+ / -)
- State logging for debugging
- Smooth CSS transitions

### updateRouteDropdownList(dropdownKey, options)
Updates dropdown lists with filtered location options.

**Features:**
- Dynamic dropdown content generation
- Click event handlers for option selection
- Display text formatting based on option type
- Data validation to prevent invalid options

**Display Text Generation:**
- **Projects**: `"06132 - Project Name"`
- **Resources**: `"Employee Name (resource)"`
- **Generic**: Option name only

## Waypoint Management

### addWaypoint()
Dynamically creates new waypoint selection dropdowns.

**Process:**
1. Increments waypoint counter
2. Updates active waypoints array
3. Creates HTML structure for new waypoint
4. Initializes dropdown functionality
5. Copies options from existing dropdowns

**HTML Structure:**
```html
<div class="route-search-field" id="route-waypoint-{index}">
    <label>
        Waypoint {number}:
        <button class="remove-waypoint-btn" onclick="removeWaypoint({index})">
            <svg><!-- Delete icon --></svg>
        </button>
    </label>
    <div class="searchable-dropdown">
        <input type="text" placeholder="Search waypoint location...">
        <div class="dropdown-list"></div>
    </div>
</div>
```

### removeWaypoint(index)
Removes specific waypoint and renumbers remaining waypoints.

**Process:**
1. Removes waypoint DOM element
2. Deletes dropdown configuration
3. Updates active waypoints array
4. Triggers waypoint renumbering
5. Maintains consistent numbering display

### renumberWaypoints()
Updates waypoint display numbers after removal operations.

**Features:**
- Preserves remove button functionality
- Updates label text with correct numbering
- Maintains waypoint configuration integrity

## Data Integration

### populateRouteDropdownOptions()
Fetches and processes location data for route planning.

**Data Sources:**
- **Projects**: Retrieved from IndexedDB via `getProjectsFromDB({})`
- **Resources**: Currently commented out for simplification
- **Billing**: Currently commented out for simplification

**Data Processing:**
```javascript
// Project option creation
{
    id: project.projectNumber,
    name: project.projectName,
    lat: project.lat,
    lng: project.lng,
    type: 'project',
    address: project.address
}
```

**Validation:**
- Coordinate validation using `hasValidCoordinates()`
- Required field validation (name, address)
- Data type verification

## Route Calculation

### calculateRoute()
Orchestrates complete route calculation workflow.

**Process:**
1. **Validation**: Ensures start and end locations are selected
2. **Data Collection**: Gathers all selected locations and waypoints
3. **Marker Creation**: Creates custom route markers
4. **Route Request**: Uses Google Directions API for route calculation
5. **Display**: Shows route on map with information panel

**Google Directions Configuration:**
```javascript
{
    origin: startLatLng,
    destination: endLatLng,
    waypoints: waypointLatLngs,
    optimizeWaypoints: true,      // Automatic waypoint optimization
    travelMode: google.maps.TravelMode.DRIVING
}
```

### createRouteMarkers()
Creates custom markers for route points with distinctive styling.

**Marker Configuration:**
- **Start Point**: Green marker with 'A' label
- **End Point**: Red marker with 'B' label  
- **Waypoints**: Orange markers with 'C', 'D', 'E', etc. labels
- **Scaling**: 1.2x scale for better visibility

### displayRouteInformation(response)
Processes route calculation results and displays summary information.

**Information Display:**
- Total distance in kilometers
- Estimated travel time in minutes
- Ordered list of route points
- Route optimization results

**Calculation:**
```javascript
const totalDistance = legs.reduce((acc, leg) => acc + leg.distance.value, 0);
const totalDuration = legs.reduce((acc, leg) => acc + leg.duration.value, 0);
```

## Export Functionality

### openInGoogleMaps()
Generates Google Maps URL for external navigation.

**URL Structure:**
```
https://www.google.com/maps/dir/?api=1
&origin={lat},{lng}
&destination={lat},{lng}
&waypoints={lat1},{lng1}|{lat2},{lng2}
&travelmode=driving
```

**Features:**
- Multi-waypoint support via pipe-separated coordinates
- Automatic waypoint ordering
- External tab opening for seamless navigation

### showGoogleMapsButton()
Displays export button after successful route calculation.

## Route Management

### clearRoute()
Comprehensive route cleanup and reset functionality.

**Cleanup Process:**
1. **Markers**: Remove all route markers from map
2. **Directions**: Clear Google Directions renderer
3. **Inputs**: Reset all dropdown selections and input values
4. **Waypoints**: Remove all dynamic waypoint elements
5. **UI**: Hide route information panel and export button
6. **State**: Reset all tracking variables

### clearRouteMarkers()
Removes route markers from map and clears marker array.

## Global Exports

### window.routeManager
Main route manager object exported for global access:

```javascript
{
    initializeRoutePlanning,
    initializeRoutePlanningUI,
    toggleRoutePanel,
    calculateRoute,
    clearRoute,
    openInGoogleMaps,
    get routePlanningActive() { return routePlanningActive; },
    get routePoints() { return routePoints; }
}
```

### Global Functions
Functions exposed for HTML onclick handlers:
- `window.removeWaypoint(index)`
- `window.setupRoutePlanningEventListeners()`
- `window.renumberWaypoints()`

## Error Handling

### Route Calculation Errors
- Google Directions API status validation
- User-friendly error messages for failed routes
- Comprehensive console error logging
- Graceful degradation for service failures

### Data Validation
- Start/end location requirement validation
- Coordinate validation for all route points
- API availability checking
- Service initialization verification

## Dependencies
- **Google Maps JavaScript API**: Directions service and rendering
- **indexedDBService.js**: Data retrieval functions
- **data.js**: `hasValidCoordinates()` validation function
- **Google Directions API**: Route calculation service

## Performance Optimizations
- Efficient dropdown option filtering
- Minimal DOM manipulation during waypoint management
- Optimized marker creation and cleanup
- Batched UI updates for smooth interaction

## Accessibility Features
- Keyboard navigation support
- Screen reader friendly labels
- Focus management for dropdown interactions
- Clear visual indicators for interactive elements

## Notes
- Always-active route planning (routePlanningActive = true)
- Simplified data sources (projects only) for current implementation
- Support for unlimited waypoints with dynamic management
- Integration with external Google Maps for full navigation features
- Optimized for mobile and desktop interaction patterns