# app.js Documentation

## Overview
Main application initialization file that coordinates all modules and manages the application lifecycle. Handles dynamic Google Maps API loading, UI initialization, and module coordination.

## Key Functions

### loadGoogleMapsAPI()
- Dynamically loads Google Maps API with comprehensive error handling
- Checks if Google Maps is already loaded to prevent duplicate loading
- Sets up global callback `googleMapsLoaded` for API initialization
- Includes 10-second timeout protection with detailed error logging
- Validates API availability after callback execution

### initializeMapAndFeatures()
- Initializes all managers after Google Maps API is available
- Sets up filter dropdown initialization
- Initializes route planning UI and Google Maps-dependent features
- Uses polling mechanism to ensure map readiness before route initialization
- Calls `initializeTestInputs()` for debugging support

### initializeNonMapFeatures()
- Fallback initialization for features that don't require maps
- Initializes filter dropdowns and test inputs only
- Provides graceful degradation when Google Maps is unavailable

### initializeTestInputs()
- Sets up debugging event listeners for route input fields
- Adds test event handlers with console logging
- Delayed execution with 1-second timeout for DOM readiness

### initializeUI()
- Sets up core UI event handlers
- Initializes reset filters button functionality
- Sets up view details button handler
- Configures mobile menu toggle functionality
- Implements click-outside-to-close behavior for mobile sidebar

## Event Handling
- **Reset Filters**: Calls `filterManager.resetAllFilters()`
- **View Details**: Calls `handleViewDetails()` function
- **Mobile Menu Toggle**: Toggles `mobile-open` class on sidebar
- **Click Outside**: Closes mobile menu when clicking outside sidebar area

## Dependencies
- **Google Maps JavaScript API**: Core mapping functionality
- **Filter Manager** (`filterManager`): Filter dropdown management
- **Route Manager** (`routeManager`): Route planning functionality
- **Map functionality** (`map.js`): Map rendering and marker management

## Error Handling
- Comprehensive Google Maps API loading error handling
- Graceful fallback when Google Maps API fails to load
- Timeout protection for API loading (10 seconds)
- Detailed console logging for debugging API issues
- Fallback to non-map features when maps are unavailable

## Global Callbacks
- **`window.googleMapsLoaded`**: Global callback function for Google Maps API
- **`window.initMap`**: Alternative callback that triggers map initialization

## Mobile Support
- Mobile menu toggle functionality
- Responsive sidebar behavior
- Touch-friendly click handlers

## Initialization Sequence
1. DOM content loaded event triggers main initialization
2. `initializeUI()` sets up basic UI handlers
3. `loadGoogleMapsAPI()` dynamically loads Maps API
4. On success: `initializeMapAndFeatures()` sets up all features
5. On failure: `initializeNonMapFeatures()` provides fallback

## Notes
- Uses event-driven architecture with DOM content loaded event
- Maintains clear separation between map-dependent and independent features
- Implements defensive programming with null checks and error boundaries
- Supports both development debugging and production deployment