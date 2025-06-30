# `refreshManager.js`

## Overview

This file manages the manual data refresh process. It provides a user interface with a confirmation modal to prevent accidental data refreshes, shows a loading state during the refresh, and provides feedback on success or failure.

## Global Object

-   **`refreshManager`**: An object that encapsulates all the functionality for the data refresh process.

## Key Properties

-   `modal`: The confirmation modal element.
-   `loadingOverlay`: The loading overlay element.
-   `refreshButton`, `confirmButton`, `cancelButton`, `closeButton`: The various button elements for interacting with the modal.
-   `legendToggle`, `legendContent`: Elements for the map legend.

## Key Methods

### `init()`

-   **Purpose:** Initializes the refresh manager by getting all the necessary DOM elements and setting up event listeners.

### `setupEventListeners()`

-   **Purpose:** Attaches all the necessary event listeners for the refresh button, modal buttons, and legend.

### `showConfirmationModal()` / `hideConfirmationModal()`

-   **Purpose:** To show or hide the refresh confirmation modal.
-   **Note:** The `showConfirmationModal` function includes a fallback to the browser's `confirm()` dialog if the modal element is not found. It also dynamically applies CSS to ensure the modal displays correctly.

### `showLoadingOverlay()` / `hideLoadingOverlay()`

-   **Purpose:** To show or hide the loading overlay that is displayed while data is being fetched.

### `performRefresh()`

-   **Purpose:** Executes the actual data refresh process.
-   **Process:**
    1.  Shows the loading overlay.
    2.  Calls `indexedDBService.forceRefresh()` to clear the sync metadata, ensuring fresh data will be fetched.
    3.  Calls `getProjectsData()` to trigger the API call.
    4.  If successful, it calls `refreshUIComponents()` to update the application with the new data and shows a success message.
    5.  If it fails, it shows an error message.
    6.  Hides the loading overlay.

### `refreshUIComponents()`

-   **Purpose:** Refreshes all parts of the application that display the data, such as the map, route options, and filter dropdowns.

### `showSuccessMessage(recordCount)` / `showErrorMessage(error)`

-   **Purpose:** Displays temporary notifications at the top of the screen to provide feedback to the user about the result of the refresh operation.

### `toggleLegend()`

-   **Purpose:** Toggles the collapsed/expanded state of the map legend.

## Global Object

-   **`window.refreshManager`**: An object exposed to the global scope that contains the main functions for managing the refresh process.
