# `zohoApiService.js`

## Overview

This file provides a simplified and robust service for interacting with the Zoho Creator API, specifically for fetching data from the `All_Projects` report. It includes features like pagination, request deduplication, IndexedDB integration for caching, and a mock data fallback for offline or non-Zoho environments.

## Key Functions

### `isZohoAPIAvailable()`

-   **Purpose:** Checks if the `ZOHO` global object and its necessary API methods are available.

### `fetchAllProjectsData()`

-   **Purpose:** Fetches all records from the `All_Projects` report, automatically handling pagination.
-   **Process:**
    1.  Starts with an initial API request.
    2.  If the response contains a `record_cursor`, it makes subsequent requests for the next page of data until no more cursors are returned.
    3.  It attempts to use `ZOHO.CREATOR.DATA.getRecords` first and falls back to `ZOHO.CREATOR.PUBLISH.getRecords`.
    4.  Aggregates the records from all pages into a single array.

### `processAPIResponse(response)`

-   **Purpose:** Extracts the data array from various possible Zoho API response formats.

### `getMockProjectsData()`

-   **Purpose:** Provides a small set of sample data to be used for testing or when the Zoho API is not available.

### `processProjectData(rawProjects)`

-   **Purpose:** Transforms the raw data received from the Zoho API into a more structured and consistent format. This includes parsing coordinates and mapping a comprehensive set of fields like `projectType`, `claimNumber`, `contactName`, `insurer`, `policyNumber`, etc.

### `getProjectsData(filters)`

-   **Purpose:** This is the main function that other modules should use to get project data. It orchestrates the process of fetching data from the cache (IndexedDB) or the live API.
-   **Process:**
    1.  Checks if the `indexedDBService` is available.
    2.  Calls `indexedDBService.needsSync('projects')` to determine if the cached data is stale.
    3.  If a sync is needed, it calls `fetchAllProjectsData`, processes the results using `processProjectData`, and stores them in IndexedDB.
    4.  It then retrieves the (potentially filtered) data from IndexedDB using `getProjectsFromDB`.
    5.  If IndexedDB is not available, it falls back to fetching data directly from the API.

## Global Functions

-   **`window.fetchProjectsData` / `window.getProjectsData`**: These are the globally exposed functions that provide access to the project data, handling all the caching and fetching logic internally.
-   **`window.debugZohoAPI` / `window.testAllProjectsAPI`**: Global functions provided for debugging and testing the API connection and data retrieval process.