# `geocoding.js`

## Overview

This file provides a service for converting street addresses into geographic coordinates (latitude and longitude) using the OpenCageData API. It includes functionality for geocoding single addresses and batches of addresses.

## Global Object

-   **`geocodingService`**: An object that encapsulates all geocoding functionality.

## Key Properties

-   **`apiKey`**: The API key for the OpenCageData service.
-   **`baseUrl`**: The base URL for the OpenCageData API.

## Key Methods

### `geocodeAddress(address)`

-   **Purpose:** Geocodes a single address string.
-   **Parameters:**
    -   `address`: The address to geocode.
-   **Process:**
    1.  Validates that the address is not empty.
    2.  Constructs the API request URL.
    3.  If running in a Zoho environment, it uses `ZOHO.CREATOR.API.invoke` to make the request.
    4.  Otherwise, it uses the standard `fetch` API.
    5.  Handles errors and provides a fallback location if the request fails.
-   **Returns:** A `Promise` that resolves with the geocoding API response.

### `geocodeBatch(addresses)`

-   **Purpose:** Geocodes an array of addresses.
-   **Parameters:**
    -   `addresses`: An array of address strings.
-   **Process:**
    1.  Iterates through the array of addresses.
    2.  Calls `geocodeAddress` for each address.
    3.  Includes a small delay between requests to avoid rate limiting.
    4.  Handles errors for individual addresses within the batch.
-   **Returns:** A `Promise` that resolves with an array of geocoding results.

### `extractCoordinates(geocodeResult)`

-   **Purpose:** Extracts the latitude, longitude, and formatted address from a geocoding API response.
-   **Parameters:**
    -   `geocodeResult`: The JSON response from the geocoding API.
-   **Returns:** An object containing `lat`, `lng`, and `formatted` address, or `null` if no valid coordinates are found.
