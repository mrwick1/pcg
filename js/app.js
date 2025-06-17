// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    
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
            if (typeof google !== 'undefined' && google.maps && map) {
                window.routeManager.initializeRoutePlanning();
            } else {
                setTimeout(checkGoogleMaps, 100);
            }
        };
        checkGoogleMaps();
    } else {
        console.log('routeManager not found!');
    }
    
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
});

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