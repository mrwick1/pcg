// Data management functions

// Coordinate validation utility
function hasValidCoordinates(location) {
    if (!location) return false;
    
    // Use root-level lat/lng fields (now extracted from rawData during processing)
    const lat = location.lat;
    const lng = location.lng;
    
    // Check if coordinates are valid numbers and within proper ranges
    return lat !== null && lng !== null && 
           !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180 &&
           lat !== 0 && lng !== 0; // Exclude default 0,0 coordinates
}