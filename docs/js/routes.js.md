# `routes.js`

## Overview

This file implements the route planning functionality. It provides a user interface for selecting a start point, an end point, and multiple waypoints, and then calculates and displays the optimal route on the map.

## Key Functions

### `initializeRoutePlanning()`

-   **Purpose:** Initializes the Google Maps Directions Service and Renderer, which are required for route calculations.

### `initializeRoutePlanningUI()`

-   **Purpose:** Initializes the user interface components for route planning, such as event listeners for buttons and dropdowns. This can be called before the Google Maps API is fully loaded.

### `setupRoutePlanningEventListeners()`

-   **Purpose:** Attaches all the necessary event listeners for the route planning panel, including buttons for toggling the panel, adding waypoints, calculating the route, and clearing the route.

### `toggleRoutePanel()`

-   **Purpose:** Expands or collapses the route planning panel.

### `setupRouteDropdown(type)` / `setupWaypointDropdown(index)`

-   **Purpose:** Sets up the searchable dropdowns for the start, end, and waypoint inputs. This includes attaching `input`, `focus`, and `click` event listeners.

### `updateRouteDropdownList(dropdownKey, options)`

-   **Purpose:** Populates the dropdown list with filtered options based on user input.

### `populateRouteDropdownOptions()`

-   **Purpose:** Fetches all available location data and populates the `options` array for all route-related dropdowns.
-   **Process:**
    1.  Fetches project data using `fetchProjectsData`.
    2.  Filters the projects to only include those that have valid coordinates.
    3.  Populates the start, end, and waypoint dropdowns with the valid locations.

### `addWaypoint()` / `removeWaypoint(index)`

-   **Purpose:** Dynamically adds or removes waypoint input fields from the UI. `renumberWaypoints()` is called after a removal to keep the display consistent.

### `calculateRoute()`

-   **Purpose:** The core function for calculating a route.
-   **Process:**
    1.  Collects the selected start, end, and waypoint locations.
    2.  Creates markers on the map for each point in the route.
    3.  Calls the Google Maps Directions Service with the collected locations.
    4.  If successful, it uses the `DirectionsRenderer` to draw the route on the map and displays a summary of the route information (distance, time).

### `clearRoute()`

-   **Purpose:** Resets the entire route planning interface, clearing the map, input fields, and route information.

### `openInGoogleMaps()`

-   **Purpose:** Opens the calculated route in a new tab on the Google Maps website.

## Global Object

-   **`window.routeManager`**: An object exposed to the global scope that contains the main functions for managing the route planning system.