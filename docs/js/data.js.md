# data.js Documentation

## Overview
Utility module containing data management and validation functions. Provides coordinate validation for location data used across the application.

## Key Functions

### hasValidCoordinates(location)
Central validation function for geographic coordinates used throughout the application.

**Parameters:**
- `location` (Object): Location object containing coordinate data

**Returns:**
- `boolean`: `true` if coordinates are valid, `false` otherwise

**Validation Logic:**
1. Checks if location object exists
2. Extracts `lat` and `lng` from root-level fields
3. Validates coordinates are not null
4. Ensures coordinates are valid numbers (not NaN)
5. Verifies latitude is within range [-90, 90]
6. Verifies longitude is within range [-180, 180]
7. Excludes default (0, 0) coordinates as invalid

**Usage:**
Used by map.js, routes.js, and filter functions to determine if locations can be displayed on the map or used in route planning.

**Example:**
```javascript
const location = { lat: 25.7617, lng: -80.1918 };
if (hasValidCoordinates(location)) {
    // Location can be displayed on map
    addMarkerToMap(location);
}
```

## Data Structure
The function expects location objects with the following structure:
```javascript
{
    lat: number,     // Latitude (-90 to 90)
    lng: number,     // Longitude (-180 to 180)
    // ... other location properties
}
```

## Dependencies
- None (pure utility function)

## Notes
- Coordinates extracted from rawData during data processing in other modules
- Excludes (0, 0) coordinates as they typically indicate missing or default data
- Used as a gatekeeper function to prevent invalid coordinates from being processed
- Critical for maintaining data quality across map and route functionality