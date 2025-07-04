# map.js Documentation

## Overview
Comprehensive Google Maps integration module providing interactive map visualization with custom markers, info windows, and context menus. Supports multiple data types (projects, resources, billing) with status-based styling and detailed information displays.

## Global Variables
```javascript
let map;                    // Google Maps instance
let infoWindow;            // Shared info window for markers
let directionsService;     // Google Directions service
let directionsRenderer;    // Directions renderer for routes
let contextMenu;           // Custom context menu element
let selectedMarker = null; // Currently selected marker
let activeMarkers = [];    // Array of all active markers
let infoWindows = [];      // Array of info windows (deprecated)
```

## Core Functions

### initializeMap()
Primary map initialization function with comprehensive error handling.

**Features:**
- Google Maps API availability validation
- Dynamic map div creation if missing
- Error handling with user-friendly fallback messages
- Map configuration with custom styling
- Service initialization (DirectionsService, InfoWindow)
- UI component setup (satellite toggle, context menu)
- Automatic data loading after initialization

**Map Configuration:**
```javascript
{
    center: { lat: 20.5937, lng: 78.9629 },  // Center of India
    zoom: 5,
    mapTypeControl: false,
    streetViewControl: false,
    mapId: 'fb4518226e59c4892eee2d21'          // Advanced markers support
}
```

### showMapError(message)
Displays user-friendly error messages when map initialization fails.

**Features:**
- Replaces map container with styled error display
- Includes visual indicators (map emoji)
- Provides clear error messaging
- Maintains responsive design

## Marker Management

### getMarkerStyle(location, markerType)
Determines marker appearance based on type. All markers use consistent colors regardless of status.

**Marker Types:**
- **Project (P)**: `#4CAF50` (Green) with 'P' glyph - consistent color for all project statuses
- **Resource (R)**: `#9C27B0` (Purple) with 'R' glyph
- **Billing (B)**: `#FF9800` (Orange) with 'B' glyph

**Note:** Project markers no longer use status-based colors. All projects display with green markers to maintain visual consistency while status information is available through filtering and info windows.

### addMarkerToMap(location, markerType = 'project')
Creates and adds custom markers to the map with advanced features.

**Features:**
- Advanced marker elements with custom styling
- Dynamic title generation based on marker type
- Click event handling for info windows
- Context menu support with right-click
- Coordinate validation and parsing
- Comprehensive error handling

**Info Window Content:**
Detailed information displays with:
- Styled headers with status indicators
- Structured data presentation
- Action buttons (directions, view details)
- Responsive design for mobile devices

### clearAllMarkers()
Removes all markers from the map and clears the markers array.

## Data Loading and Display

### loadAndDisplayData(filters = {}, changedFilter = null)
Main function for loading and displaying filtered data on the map.

**Process Flow:**
1. Validates Google Maps availability
2. Clears existing markers
3. Fetches data from multiple sources (projects, resources)
4. Filters data based on coordinates validity
5. Creates markers for valid locations
6. Implements intelligent zoom behavior
7. Handles empty result scenarios

**Data Sources:**
- **Projects**: `getProjectsData()` with filtering support
- **Resources**: `getResourcesData()` with filtering support
- **Billing**: `getBillingData()` with filtering support

**Smart Zoom Behavior:**
- **Single Project Selection**: Zoom to level 15
- **Multiple Markers**: Fit bounds to show all markers
- **Single Marker**: Zoom to level 10
- **Role-based Selection**: Focus on specific resource roles

## Info Window System

### Project Info Windows
Comprehensive project information display:

```javascript
{
    header: "Project icon + name + status badge",
    content: {
        pccNumber: "Project identification",
        projectType: "Report type information", 
        accountName: "Client information",
        claimNumber: "Insurance claim details",
        contactName: "Primary contact",
        insurer: "Insurance company",
        address: "Physical location",
        dateOfLoss: "Incident date (optional)"
    },
    actions: [
        "Get Directions button",
        "View Summary button"
    ]
}
```

### Billing Info Windows
Billing location information display:

```javascript
{
    header: "Billing icon + code ID + status",
    content: {
        codeId: "Location identifier",
        population: "Area population data",
        status: "Location status (Active/Inactive)",
        address: "Billing location address"
    },
    actions: [
        "Get Directions button"
    ]
}
```

### Resource Info Windows
Employee/resource information display:

```javascript
{
    header: "Resource icon + name + status",
    content: {
        employeeId: "Employee identification",
        role: "Job role/position",
        employeeType: "Employment classification",
        personalEmail: "Contact email (optional)",
        phoneNumber: "Contact phone (optional)",
        paymentType: "Payment classification (optional)",
        address: "Employee address"
    },
    actions: [
        "Get Directions button",
        "View Profile button"
    ]
}
```

## Context Menu System

### Context Menu Features
- Right-click activation on markers
- Intelligent positioning to stay within viewport
- Auto-close on outside clicks
- Viewport boundary detection and adjustment

### Context Menu Actions
- **View Details**: Opens detailed info window
- **Get Directions**: Opens Google Maps directions
- **Additional Actions**: Configurable based on marker type

## User Interaction

### Event Handlers
- **Map Click**: Closes context menus and info windows
- **Map Context Menu**: Prevents default browser context menu
- **Marker Click**: Opens info window with details
- **Marker Right-Click**: Shows custom context menu
- **Satellite Toggle**: Switches between roadmap and satellite views

### Action Functions

#### openDirections(lat, lng, name)
Opens Google Maps in new tab with directions to specified coordinates.

#### viewProjectSummary(projectId)
Displays comprehensive project summary in modal dialog:
- Project overview with status styling
- Client information section
- Location and timeline details
- Coordinate display
- Modal interaction handling

## Global Window Functions
Exported functions for global access:
- `window.viewProjectSummary(projectId)`
- `window.openDirections(lat, lng, locationName)`

## Error Handling

### Map Initialization Errors
- API key validation
- Network connectivity issues
- Browser compatibility problems
- Graceful fallback to error display

### Data Loading Errors
- API call failures
- Invalid coordinate data
- Network timeouts
- Empty dataset handling

### User Experience
- Loading state management
- No-data scenarios with user guidance
- Auto-removal of temporary messages
- Comprehensive error logging

## Styling and CSS

### Info Window Styling
Injected CSS for consistent info window appearance:
```css
.info-window {
    padding: 12px;
    max-width: 300px;
    font-family: Arial, sans-serif;
}
```

### Status-based Styling
Dynamic CSS classes for project status indicators:
- `.status-completed`, `.status-live`, `.status-archived`, etc.
- Consistent color scheme across UI elements
- Mobile-responsive design considerations

## Dependencies
- **Google Maps JavaScript API**: Core mapping functionality
- **data.js**: `hasValidCoordinates()` validation function
- **zohoApiService.js**: Data fetching functions
- **filters.js**: Filter management integration

## Global Callbacks
- **`window.initMap`**: Google Maps API callback function

## Performance Optimizations
- Efficient marker management with array tracking
- Conditional map recreation only when necessary
- Optimized data filtering before marker creation
- Memory management for large datasets
- Debounced UI updates for smooth interaction

## Mobile Support
- Touch-friendly marker interaction
- Responsive info window layouts
- Mobile-optimized context menu positioning
- Gesture support for map navigation

## Notes
- Designed for 6000+ location datasets
- Supports both online and offline marker display
- Implements Google Maps best practices
- Provides comprehensive debugging and error logging
- Maintains consistent UX across different data types