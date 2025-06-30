# `app.js`

## Overview

This file is the main entry point for the application. It handles the initialization of the user interface, dynamic loading of the Google Maps API, and the subsequent initialization of map-dependent and non-map-dependent features.

## Key Functions

### `loadGoogleMapsAPI()`

-   **Purpose:** Dynamically loads the Google Maps API script.
-   **Process:**
    1.  Checks if the Google Maps API is already loaded.
    2.  If not, it creates a `<script>` tag with the API URL (including a new API key) and a callback function (`googleMapsLoaded`).
    3.  Appends the script to the document's `<head>`.
    4.  Returns a `Promise` that resolves when the API is loaded or rejects on error.

### `initializeMapAndFeatures()`

-   **Purpose:** Initializes features that depend on the Google Maps API.
-   **Process:**
    1.  Initializes the `filterManager` dropdowns.
    2.  Initializes the `routeManager` UI and, once Google Maps is ready, the route planning functionality.
    3.  Sets up test inputs for debugging.

### `initializeNonMapFeatures()`

-   **Purpose:** Initializes features that do not require the Google Maps API. This serves as a fallback if the API fails to load.
-   **Process:**
    1.  Initializes `filterManager` dropdowns.
    2.  Sets up test inputs.

### `initializeUI()`

-   **Purpose:** Sets up general user interface event listeners.
-   **Process:**
    1.  Attaches a click listener to the "Reset Filters" button.
    2.  Attaches a click listener to the "View Details" button.
    3.  Initializes the mobile menu toggle button and handles closing the menu when clicking outside of it.

## Event Listeners

-   **`DOMContentLoaded`**: The main event listener that kicks off the entire application initialization process.
-   **`click` on `#reset-filters-btn`**: Resets all active filters.
-   **`click` on `#view-details`**: Handles the action when the "View Details" button is clicked.
-   **`click` on `#mobile-menu-btn`**: Toggles the visibility of the sidebar on mobile devices.
-   **`click` on `document`**: Closes the mobile sidebar if a click occurs outside of it.