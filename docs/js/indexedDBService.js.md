# `indexedDBService.js`

## Overview

This file provides a comprehensive service for managing client-side data storage using IndexedDB, with Dexie.js as a wrapper. It is designed to handle large datasets for projects, resources, and billing, providing a caching layer to reduce API calls and improve performance.

## Database Schema

-   **Database Name:** `PCGDatabase`
-   **Version:** 3
-   **Stores (Tables):**
    -   `projects`: Stores project data with an expanded set of fields including `projectType`, `claimNumber`, `contactName`, etc.
    -   `resources`: Stores resource (employee) data.
    -   `billing`: Stores billing location data.
    -   `metadata`: Stores metadata about the other tables, such as the last sync time and record count.

## Key Functions

### Data Storage (`store...Data`)

-   **Functions:** `storeProjectsData`, `storeResourcesData`, `storeBillingData`
-   **Purpose:** To store arrays of data into their respective IndexedDB tables.
-   **Process:**
    1.  Adds a `lastUpdated` timestamp to each record.
    2.  Clears the existing data in the table.
    3.  Uses `bulkAdd` for efficient insertion of the new data.
    4.  Updates the corresponding metadata table with the new sync time and record count.

### Data Retrieval (`get...FromDB`)

-   **Functions:** `getProjectsFromDB`, `getResourcesFromDB`, `getBillingFromDB`
-   **Purpose:** To retrieve data from IndexedDB, with optional filtering.
-   **Process:**
    1.  Starts with a collection of all records in the table.
    2.  Applies filters based on the provided `filters` object.
    3.  The `getProjectsFromDB` function returns the filtered array of projects directly. Other retrieval functions return a structured object with `data`, `total`, and `filtered` counts.

### Sync Management

-   **`needsSync(tableName)`**: Checks if a table's data is stale and needs to be re-fetched from the API. It does this by comparing the `lastSync` time in the metadata with a configured expiration time (30 days).
-   **`forceRefresh()`**: Clears all sync metadata, which will force a data refresh from the API on the next data request.

### Utility Functions

-   **`getDBStats()`**: Returns statistics about the database, including record counts for each table.
-   **`clearAllData()`**: Wipes all data from all tables in the IndexedDB database.

## Global Object

-   **`window.indexedDBService`**: An object exposed to the global scope that contains all the public methods for interacting with the IndexedDB service.
-   **`window.debugIndexedDB`**: A global function for logging database statistics to the console for debugging purposes.