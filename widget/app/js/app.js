// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    
    // Load Google Maps API dynamically
    loadGoogleMapsAPI().then(() => {
        initializeMapAndFeatures();
    }).catch(error => {
        // Fallback: continue without maps
        initializeNonMapFeatures();
    });
});

// Dynamically load Google Maps API
function loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
        // Check if Google Maps is already loaded
        if (typeof google !== 'undefined' && google.maps) {
            resolve();
            return;
        }

        
        // Create script element
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaz7EGp-94C2Zs4H_hJY2ffV-kRzV-LOU&callback=googleMapsLoaded&libraries=marker,geometry,places&loading=async';
        script.async = true;
        script.defer = true;
        
        // Set up global callback for initial API load
        window.googleMapsLoaded = function() {
            // Validate that Google Maps actually loaded
            if (typeof google !== 'undefined' && google.maps) {
                // Now call the actual map initialization
                if (typeof window.initMap === 'function') {
                    window.initMap();
                }
                resolve();
            } else {
                reject(new Error('Google Maps API validation failed'));
            }
        };
        
        script.onerror = (error) => {
            reject(new Error('Google Maps API script failed to load - check API key'));
        };
        
        // Timeout handling
        setTimeout(() => {
            if (typeof google === 'undefined' || !google.maps) {
                reject(new Error('Google Maps API loading timeout - check API key and network'));
            }
        }, 10000); // 10 second timeout
        
        document.head.appendChild(script);
    });
}

// Initialize map and map-dependent features
function initializeMapAndFeatures() {
    // Initialize all managers
    if (window.filterManager) {
        window.filterManager.initializeDropdowns();
    }
    
    // Initialize route planning UI immediately
    if (window.routeManager) {
        window.routeManager.initializeRoutePlanningUI();
        
        // Initialize Google Maps-dependent features when ready
        const checkGoogleMaps = () => {
            if (typeof google !== 'undefined' && google.maps && window.map) {
                window.routeManager.initializeRoutePlanning();
            } else {
                setTimeout(checkGoogleMaps, 100);
            }
        };
        checkGoogleMaps();
    } else {
    }
    
    initializeTestInputs();
}

// Initialize features that don't require maps
function initializeNonMapFeatures() {
    
    if (window.filterManager) {
        window.filterManager.initializeDropdowns();
    }
    
    initializeTestInputs();
}

// Initialize test inputs
function initializeTestInputs() {
    // Test search inputs directly
    setTimeout(() => {
        const startInput = document.getElementById('route-start-search');
        const endInput = document.getElementById('route-end-search');
        
        if (startInput) {
            startInput.addEventListener('input', function() {
            });
        }
        
        if (endInput) {
            endInput.addEventListener('input', function() {
            });
        }
    }, 1000);
}

function initializeUI() {
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (window.filterManager) {
                window.filterManager.resetAllFilters();
            }
        });
    }

    const viewDetailsBtn = document.getElementById('view-details');
    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', handleViewDetails);
    }

    // Initialize mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('filters');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (sidebar && mobileMenuBtn && 
            !sidebar.contains(e.target) && 
            !mobileMenuBtn.contains(e.target) &&
            sidebar.classList.contains('mobile-open')) {
            sidebar.classList.remove('mobile-open');
        }
    });
}