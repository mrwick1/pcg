# `filters.js`

## Overview

This file manages all the filter dropdowns in the application. It handles their initialization, populating them with data, collecting selected filter values, and applying them to the dataset.

## Global Variables

-   **`dropdowns`**: An object that holds the state for each filter dropdown, including its input element, list element, options, and the currently selected value.

## Key Functions

### `initializeDropdowns()`

-   **Purpose:** Initializes all the filter dropdowns by getting their DOM elements and attaching event listeners.
-   **Process:**
    1.  Gets the input and list elements for each dropdown.
    2.  Attaches `input` and `focus` event listeners to the input fields to handle filtering and showing the dropdown list. If an input is cleared, the filter is reset.
    3.  Attaches a `click` listener to the `document` to close dropdowns when clicking outside of them.

### `updateDropdownList(dropdownKey, options)`

-   **Purpose:** Updates the list of options displayed in a specific dropdown.
-   **Process:**
    1.  Clears the current list.
    2.  Iterates through the provided `options` and creates a `div` element for each.
    3.  Attaches a `click` listener to each option to set the selected value, update the input field, and apply the filters.

### `populateDropdownOptions()`

-   **Purpose:** Fetches data from the API and populates the dropdowns with unique values.
-   **Process:**
    1.  Fetches project data using `getProjectsData`.
    2.  Filters out projects that do not have valid coordinates.
    3.  Extracts unique project types (from the `projectType` field) and account names.
    4.  Creates a structured list of projects for the project search dropdown.
    5.  Updates the `options` array for each relevant dropdown and calls `updateDropdownList`.

### `collectFilters()`

-   **Purpose:** Gathers the currently selected values from all filter dropdowns.
-   **Returns:** An object where keys are the filter names and values are the selected options.

### `resetAllFilters()`

-   **Purpose:** Clears all selected filter values and input fields, then reapplies the (now empty) filters to show all data.

### `applyFilters(changedFilter)`

-   **Purpose:** Triggers the data loading and display process with the current set of filters.
-   **Parameters:**
    -   `changedFilter` (optional): The key of the filter that was just changed, which can be used for specific behaviors (e.g., zooming to a selected project).

## Global Object

-   **`window.filterManager`**: An object exposed to the global scope that contains the main functions for managing filters, allowing other parts of the application to interact with the filter system.
