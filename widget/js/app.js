// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    
    // Load Google Maps API dynamically
    loadGoogleMapsAPI().then(() => {
        console.log('Google Maps API loaded successfully');
        initializeMapAndFeatures();
    }).catch(error => {
        console.error('Failed to load Google Maps API:', error);
        // Fallback: continue without maps
        initializeNonMapFeatures();
    });
});

// Dynamically load Google Maps API
function loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
        // Check if Google Maps is already loaded
        if (typeof google !== 'undefined' && google.maps) {
            console.log('Google Maps already loaded');
            resolve();
            return;
        }

        console.log('Loading Google Maps API...');
        
        // Create script element
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAkNYoqjjXZtVhqDE2KnviUlaPIhX7nEUc&callback=googleMapsLoaded&libraries=marker,geometry,places';
        script.async = true;
        script.defer = true;
        
        // Set up global callback for initial API load
        window.googleMapsLoaded = function() {
            console.log('Google Maps script loaded successfully');
            // Now call the actual map initialization
            if (typeof window.initMap === 'function') {
                window.initMap();
            }
            resolve();
        };
        
        script.onerror = () => {
            reject(new Error('Failed to load Google Maps API'));
        };
        
        console.log('Adding Google Maps script to head');
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
        console.log('routeManager found, initializing UI');
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
        console.log('routeManager not found!');
    }
    
    initializeTestInputs();
}

// Initialize features that don't require maps
function initializeNonMapFeatures() {
    console.log('Initializing non-map features only');
    
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
            console.log('Adding test event listener to start input');
            startInput.addEventListener('input', function() {
                console.log('TEST: Start input working, value:', this.value);
            });
        }
        
        if (endInput) {
            console.log('Adding test event listener to end input');
            endInput.addEventListener('input', function() {
                console.log('TEST: End input working, value:', this.value);
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