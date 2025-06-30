# `map.js`

## Overview

This file is responsible for all Google Maps functionality. It handles map initialization, adding and managing markers, displaying information windows, and loading data onto the map.

## Global Variables

-   `map`: The main Google Maps map object.
-   `infoWindow`: A single `InfoWindow` object used to display details for markers.
-   `directionsService` and `directionsRenderer`: Used for calculating and displaying routes.
-   `contextMenu`: The right-click context menu for map markers.
-   `selectedMarker`: The marker that is currently selected (right-clicked).
-   `activeMarkers`: An array of all markers currently displayed on the map.

## Key Functions

### `initializeMap()`

-   **Purpose:** Initializes the Google Map and its components.
-   **Process:**
    1.  Creates the `google.maps.Map` instance.
    2.  Initializes the `InfoWindow`, `DirectionsService`, and `DirectionsRenderer`.
    3.  Sets up event listeners for the map (e.g., `click`, `contextmenu`).
    4.  Attaches a click listener to the satellite/roadmap toggle button.
    5.  Triggers the initial data load.

### `initMap()` (Global Callback)

-   **Purpose:** This function is the global callback that is executed by the Google Maps API script once it has loaded. It simply calls `initializeMap()`.

### `getMarkerStyle(location, markerType)`

-   **Purpose:** Determines the visual style (color, icon) for a map marker based on its type (project, resource, or billing).
-   **Returns:** An object with properties for `background`, `borderColor`, and `glyph`.

### `addMarkerToMap(location, markerType)`

-   **Purpose:** Creates and adds a single marker to the map.
-   **Process:**
    1.  Creates a `PinElement` for a custom marker appearance.
    2.  Creates an `AdvancedMarkerElement` with the specified position, style, and title.
    3.  Attaches a `gmp-click` listener to the marker to show a detailed, styled `InfoWindow` with comprehensive information about the location.
    4.  Attaches a `contextmenu` listener to show a custom context menu.
    5.  Adds the marker to the `activeMarkers` array.

### `clearAllMarkers()`

-   **Purpose:** Removes all currently displayed markers from the map.

### `loadAndDisplayData(filters, changedFilter)`

-   **Purpose:** Fetches data based on the provided filters and displays it on the map.
-   **Process:**
    1.  Clears any existing markers.
    2.  Fetches project data using the `getProjectsData` function.
    3.  Iterates through the data and adds a marker for each location that has valid coordinates.
    4.  Adjusts the map's zoom and center to fit the displayed markers, with special handling for zooming to a single selected project.

### `handleViewDetails()`

-   **Purpose:** Handles the "View Details" action from the context menu, displaying the `InfoWindow` for the `selectedMarker`.

### `viewProjectSummary(projectId)`

-   **Purpose:** Displays a modal with a detailed summary of a selected project.
-   **Process:**
    1.  Finds the corresponding project marker in the `activeMarkers` array.
    2.  Constructs an HTML summary of the project's details.
    3.  Populates and displays a modal dialog with the summary.

## Global Functions

-   **`window.viewProjectSummary(projectId)`**: A globally exposed function to allow the info window's button to trigger the summary modal.
-   **`window.openDirections(lat, lng, locationName)`**: A globally exposed function to open Google Maps directions in a new tab.
