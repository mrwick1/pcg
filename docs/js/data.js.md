# `data.js`

## Overview

This file provides utility functions for handling and validating data, particularly geographic coordinates.

## Key Functions

### `hasValidCoordinates(location)`

-   **Purpose:** Checks if a given location object has valid latitude and longitude coordinates.
-   **Parameters:**
    -   `location`: An object that should contain `lat` and `lng` properties.
-   **Validation Rules:**
    -   The `lat` and `lng` properties must not be `null`.
    -   The `lat` and `lng` must be valid numbers (`!isNaN`).
    -   Latitude must be between -90 and 90.
    -   Longitude must be between -180 and 180.
    -   Coordinates cannot be (0, 0), which is often a default or invalid value.
-   **Returns:** `true` if the coordinates are valid, `false` otherwise.
