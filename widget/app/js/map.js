// Map management functions
let map;
let infoWindow;
let directionsService;
let directionsRenderer;
let contextMenu;
let selectedMarker = null;
let activeMarkers = [];
let infoWindows = [];

// Show map error message
function showMapError(message) {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border: 2px dashed #dee2e6;">
                <div style="text-align: center; padding: 2rem; color: #6c757d;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
                    <div style="font-size: 1.2rem; font-weight: 500; margin-bottom: 0.5rem;">Map Unavailable</div>
                    <div style="font-size: 1rem;">${message}</div>
                </div>
            </div>
        `;
    }
}

// Initialize Google Maps
function initializeMap() {
    console.log('initializeMap() called');
    
    // Check if Google Maps API is available
    if (typeof google === 'undefined' || !google.maps) {
        console.error('Google Maps API not available');
        showMapError('Google Maps API not loaded. Please check your internet connection.');
        return;
    }
    
    // Don't clear the entire map container, just ensure the map div exists
    let actualMapDiv = document.getElementById('map');
    if (!actualMapDiv) {
        console.log('Creating map div element');
        actualMapDiv = document.createElement('div');
        actualMapDiv.id = 'map';
        actualMapDiv.style.width = '100%';
        actualMapDiv.style.height = '100%';
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.appendChild(actualMapDiv);
        } else {
            console.error('map-container element not found!');
            return;
        }
    }

    console.log('Creating new Google Maps instance');
    try {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 20.5937, lng: 78.9629 },
            zoom: 5,
            mapTypeControl: false,
            streetViewControl: false,
            mapId: 'fb4518226e59c4892eee2d21'
        });
        console.log('Google Maps initialized successfully');
    } catch (error) {
        console.error('Error initializing Google Maps:', error);
        showMapError('Failed to initialize Google Maps. API key may be invalid.');
        return;
    }

    infoWindow = new google.maps.InfoWindow();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true
    });

    contextMenu = document.getElementById('map-context-menu');
    
    const toggleSatelliteBtn = document.getElementById('toggle-satellite-btn');
    if (toggleSatelliteBtn) {
        toggleSatelliteBtn.addEventListener('click', () => {
            const currentType = map.getMapTypeId();
            map.setMapTypeId(
                currentType === 'satellite' ? 'roadmap' : 'satellite'
            );
        });
    }

    map.addListener('click', (e) => {
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
    });

    map.addListener('contextmenu', (e) => {
        e.preventDefault();
    });

    console.log('Map components initialized successfully');
    
    // Load and display data
    setTimeout(() => {
        loadAndDisplayData();
        if (window.filterManager) {
            window.filterManager.populateDropdownOptions();
        }
    }, 100);
}

// Global callback for Google Maps API
window.initMap = () => {
    console.log('Google Maps API available, initializing map');
    initializeMap();
};

function getMarkerStyle(location, markerType) {
    // For project markers, use status-based colors
    if (markerType === 'project' && location.status) {
        const statusColors = {
            'Completed': '#4CAF50',      // Green
            'Live': '#FF9800',           // Orange  
            'Archived': '#9E9E9E',       // Gray
            'Cancelled': '#F44336',      // Red
            'Suspended': '#FFC107',      // Amber/Yellow
            'In Progress': '#2196F3',    // Blue
            'Unknown': '#424242'         // Dark gray
        };
        
        const statusColor = statusColors[location.status] || statusColors['Unknown'];
        
        return {
            background: statusColor,
            borderColor: '#FFFFFF',
            glyph: 'P',
            glyphColor: '#FFFFFF'
        };
    }
    
    // Define marker styles for different types - single color per type (non-project markers)
    const markerStyles = {
        project: {
            background: '#4CAF50',    // Green for Project markers (fallback)
            glyph: 'P',
            borderColor: '#FFFFFF'
        },
        resource: {
            background: '#9C27B0',    // Purple for all Resource markers
            glyph: 'R',
            borderColor: '#FFFFFF'
        },
        billing: {
            background: '#FF9800',    // Orange for all Billing markers
            glyph: 'B',
            borderColor: '#FFFFFF'
        }
    };

    const style = markerStyles[markerType];
    if (!style) {
        return {
            background: '#757575',
            borderColor: '#FFFFFF', 
            glyph: '?',
            glyphColor: '#FFFFFF'
        };
    }

    return {
        background: style.background,
        borderColor: style.borderColor,
        glyph: style.glyph,
        glyphColor: '#FFFFFF'
    };
}

function addMarkerToMap(location, markerType = 'project') {
    if (!map || !google || !google.maps) {
        return;
    }


    const position = {
        lat: Number.parseFloat(location.lat),
        lng: Number.parseFloat(location.lng)
    };

    const markerStyle = getMarkerStyle(location, markerType);
    
    // Create custom pin element with appropriate style
    const pinElement = new google.maps.marker.PinElement({
        background: markerStyle.background,
        borderColor: markerStyle.borderColor,
        glyphColor: markerStyle.glyphColor,
        glyph: markerStyle.glyph
    });

    let title = 'Unknown Location';
    if (markerType === 'project') {
        title = location.projectName || 'Unknown Project';
    } else if (markerType === 'resource') {
        // Resource data is stored directly in the location object
        title = location.fullName || `${location.firstName || ''} ${location.lastName || ''}`.trim() || 'Unknown Employee';
    } else if (markerType === 'billing') {
        title = location.billing?.resourceName || 'Unknown Resource';
    }

    const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        map,
        title: title,
        content: pinElement.element
    });

    marker.location = location;
    marker.markerType = markerType;

    marker.addEventListener('gmp-click', (event) => {
        
        // Debug: Log the actual location object structure
        console.log('🔍 DEBUG: Marker clicked, markerType:', markerType);
        console.log('🔍 DEBUG: Location object:', location);
        console.log('🔍 DEBUG: Location keys:', Object.keys(location));
        
        // Show info window
        let content = '';
        if (markerType === 'project') {
            // Simple direct field access - no complex fallbacks needed
            const projectName = location.projectName || 'Unknown Project';
            const projectNumber = location.projectNumber || 'N/A';
            const projectAddress = location.address || 'Address not available';
            const status = location.status || 'N/A';
            const accountName = location.accountName || 'N/A';
            const projectType = location.projectType || 'N/A';
            const claimNumber = location.claimNumber || 'N/A';
            const contactName = location.contactName || 'N/A';
            const dateOfLoss = location.dateOfLoss || null;
            const insurer = location.insurer || 'N/A';
            
            const statusClass = status.toLowerCase().replace(/\s+/g, '-');
            
            content = `
                <div class="project-info-window">
                    <div class="info-header status-${statusClass}">
                        <div class="project-icon">
                            <span class="icon-text">P</span>
                        </div>
                        <div class="project-title">
                            <h3>${projectName}</h3>
                            <span class="project-status status-${statusClass}">${status}</span>
                        </div>
                    </div>
                    
                    <div class="info-content">
                        <div class="info-row">
                            <span class="info-label">PCC Number:</span>
                            <span class="info-value">${projectNumber}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Project Type:</span>
                            <span class="info-value">${projectType}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Account:</span>
                            <span class="info-value">${accountName}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Claim Number:</span>
                            <span class="info-value">${claimNumber}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Contact:</span>
                            <span class="info-value">${contactName}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Insurer:</span>
                            <span class="info-value">${insurer}</span>
                        </div>
                        
                        <div class="info-row address-row">
                            <span class="info-label">Address:</span>
                            <span class="info-value">${projectAddress}</span>
                        </div>
                        
                        ${dateOfLoss ? `
                        <div class="info-row">
                            <span class="info-label">Date of Loss:</span>
                            <span class="info-value">${dateOfLoss}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="info-actions">
                        <button class="action-btn primary" onclick="openDirections(${location.lat}, ${location.lng}, '${projectName.replace(/'/g, "\\'")}')">
                            <span class="btn-icon">📍</span>
                            Get Directions
                        </button>
                        <button class="action-btn secondary" onclick="viewProjectSummary('${location.id || projectNumber}')">
                            <span class="btn-icon">📄</span>
                            View Summary
                        </button>
                    </div>
                </div>
            `;
        } else if (markerType === 'resource') {
            // Resource data is stored directly in the location object
            const fullName = location.fullName || `${location.firstName || ''} ${location.lastName || ''}`.trim();
            const resourceAddress = location.address || 'Address not available';
            const employeeId = location.employeeId || location.id || 'N/A';
            const role = location.role || 'N/A';
            const employeeType = location.employeeType || 'N/A';
            const status = location.status || 'N/A';
            const personalEmail = location.personalEmail || 'N/A';
            const phoneNumber = location.phoneNumber || 'N/A';
            const paymentType = location.paymentType || 'N/A';
            
            const statusClass = status.toLowerCase().replace(/\s+/g, '-');
            
            content = `
                <div class="project-info-window">
                    <div class="info-header status-${statusClass}">
                        <div class="project-icon">
                            <span class="icon-text">R</span>
                        </div>
                        <div class="project-title">
                            <h3>${fullName || 'Unknown Employee'}</h3>
                            <span class="project-status status-${statusClass}">${status}</span>
                        </div>
                    </div>
                    
                    <div class="info-content">
                        <div class="info-row">
                            <span class="info-label">Employee ID:</span>
                            <span class="info-value">${employeeId}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Role:</span>
                            <span class="info-value">${role}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Employee Type:</span>
                            <span class="info-value">${employeeType}</span>
                        </div>
                        
                        ${personalEmail !== 'N/A' ? `
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">${personalEmail}</span>
                        </div>
                        ` : ''}
                        
                        ${phoneNumber !== 'N/A' ? `
                        <div class="info-row">
                            <span class="info-label">Phone:</span>
                            <span class="info-value">${phoneNumber}</span>
                        </div>
                        ` : ''}
                        
                        ${paymentType !== 'N/A' ? `
                        <div class="info-row">
                            <span class="info-label">Payment Type:</span>
                            <span class="info-value">${paymentType}</span>
                        </div>
                        ` : ''}
                        
                        <div class="info-row address-row">
                            <span class="info-label">Address:</span>
                            <span class="info-value">${resourceAddress}</span>
                        </div>
                    </div>
                    
                    <div class="info-actions">
                        <button class="action-btn primary" onclick="openDirections(${location.lat}, ${location.lng}, '${fullName.replace(/'/g, "\\'")}')">
                            <span class="btn-icon">📍</span>
                            Get Directions
                        </button>
                        <button class="action-btn secondary" onclick="viewResourceSummary('${location.id || employeeId}')">
                            <span class="btn-icon">👤</span>
                            View Profile
                        </button>
                    </div>
                </div>
            `;
        } else if (markerType === 'billing') {
            content = `
                <div class="info-window">
                    <h3>${location.billing?.resourceName || 'Unknown Resource'}</h3>
                    <p><strong>Type:</strong> Billing</p>
                    <p><strong>PCC Number:</strong> ${location.billing?.projectPccNumber || 'N/A'}</p>
                    <p><strong>Claim Number:</strong> ${location.billing?.claimNumber || 'N/A'}</p>
                    <p><strong>Payment Type:</strong> ${location.billing?.paymentType || 'N/A'}</p>
                    <p><strong>Billing Status:</strong> ${location.billing?.billingStatus || 'N/A'}</p>
                </div>
            `;
        }
        
        if (content) {
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        }
    });

    marker.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Right-click detected on marker:', marker.markerType);
        selectedMarker = marker;
        
        if (contextMenu) {
            // Simple approach: use the mouse event coordinates
            const x = e.domEvent ? e.domEvent.clientX : window.event.clientX;
            const y = e.domEvent ? e.domEvent.clientY : window.event.clientY;
            
            console.log('Context menu position:', {x, y});
            
            // Ensure the context menu stays within viewport
            const menuWidth = 120;
            const menuHeight = 40;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            let finalX = x + 10; // Small offset to the right
            let finalY = y - 10; // Small offset above
            
            // Adjust if menu would go off-screen
            if (finalX + menuWidth > viewportWidth) {
                finalX = x - menuWidth - 10; // Place to the left
            }
            if (finalY + menuHeight > viewportHeight) {
                finalY = y - menuHeight;
            }
            if (finalY < 0) {
                finalY = y + 30; // Place below
            }
            
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${finalX}px`;
            contextMenu.style.top = `${finalY}px`;
            
            console.log('Context menu positioned at:', {finalX, finalY});

            setTimeout(() => {
                const closeContextMenu = (event) => {
                    if (!contextMenu.contains(event.target)) {
                        contextMenu.style.display = 'none';
                        document.removeEventListener('click', closeContextMenu);
                    }
                };
                document.addEventListener('click', closeContextMenu);
            }, 0);
        }
    });

    activeMarkers.push(marker);

    return marker;
}

function clearAllMarkers() {
    for (const marker of activeMarkers) {
        marker.map = null;
    }
    activeMarkers = [];
}

// These functions are no longer needed since we have separate APIs

async function loadAndDisplayData(filters = {}, changedFilter = null) {
    if (!map && (!google || !google.maps)) {
        document.getElementById('map-container').innerHTML =
            `<p>Google Maps API not loaded. Please check your API key and internet connection.</p>`;
        return;
    }

    clearAllMarkers();
    const mapContainer = document.getElementById('map-container');
    
    if (!document.getElementById('map') && mapContainer) {
        // Only create the map div if it doesn't exist, don't clear the container
        const actualMapDiv = document.createElement('div');
        actualMapDiv.id = 'map';
        mapContainer.appendChild(actualMapDiv);
        
        if (google?.maps && !map) {
             map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: 20.5937, lng: 78.9629 },
                zoom: 5,
                mapId: "fb4518226e59c4892eee2d21",
             });
        }
    }

    try {
        // Show loading state (simplified - just console log)
        console.log('🔄 Loading data from Zoho Creator...');
        
        // Fetch from separate APIs independently
        const projectLocations = await getProjectsData({
            projectNumber: filters.pccNumber,
            reportType: filters.projectType,
            accountName: filters.accountName,
            status: filters.project_status
        });
        
        // Fetch resources data
        console.log('🔄 Fetching resources data...');
        const resourcesResponse = await getResourcesData({
            role: filters.userRole,
            employeeType: filters.employeeType,
            status: filters.resourceStatus
        });
        
        console.log('📋 Resources response:', resourcesResponse);
        
        // COMMENTED OUT: Billing removed for simplification  
        // const billingResponse = await fetchBillingData({
        //     employeeType: filters.employeeType,
        //     status: filters.status
        // });
        // const billingResponse = await fetchBillingData({
        //     billingStatus: filters.billingStatus,
        //     paymentType: filters.paymentType
        // });
        // const resourceLocations = resourcesResponse.data;
        // const billingLocations = billingResponse.data;

        // Add project markers (P) - only for projects with valid coordinates
        for (const location of projectLocations) {
            if (hasValidCoordinates(location)) {
                addMarkerToMap(location, 'project');
            }
        }
        
        // Add resource location markers (R) - only for resources with valid coordinates
        const resourceLocations = resourcesResponse.data || [];
        console.log(`📍 Adding ${resourceLocations.length} resource markers to map`);
        for (const location of resourceLocations) {
            if (hasValidCoordinates(location)) {
                addMarkerToMap(location, 'resource');
            } else {
                console.log('⚠️ Resource skipped - no valid coordinates:', location);
            }
        }
        
        // COMMENTED OUT: Billing markers removed for simplification
        // // Add billing location markers (B)
        // for (const location of billingLocations) {
        //     addMarkerToMap(location, 'billing');
        // }
            
        if (activeMarkers.length > 0 && google && google.maps) {
            // Handle specific zoom cases for project and resource selection
            if (changedFilter === 'projectSearch' && filters.pccNumber) {
                // Zoom to specific project
                const projectMarker = activeMarkers.find(marker => 
                    marker.markerType === 'project' && marker.location.projectNumber === filters.pccNumber
                );
                if (projectMarker) {
                    map.setCenter(projectMarker.position);
                    map.setZoom(15);
                }
            } else if (changedFilter === 'userRole' && filters.userRole) {
                // Zoom to resource markers with specific role
                const resourceMarkers = activeMarkers.filter(marker => 
                    marker.markerType === 'resource' && marker.location.resource?.userRole === filters.userRole
                );
                if (resourceMarkers.length > 0) {
                    if (resourceMarkers.length === 1) {
                        map.setCenter(resourceMarkers[0].position);
                        map.setZoom(15);
                    } else {
                        const bounds = new google.maps.LatLngBounds();
                        resourceMarkers.forEach(marker => bounds.extend(marker.position));
                        map.fitBounds(bounds);
                    }
                }
            } else {
                // Default behavior - fit all markers
                const bounds = new google.maps.LatLngBounds();
                for (const marker of activeMarkers) {
                    bounds.extend(marker.position);
                }
                map.fitBounds(bounds);
                if (activeMarkers.length === 1) map.setZoom(10);
            }
        }
        
        // Hide loading state
        console.log('✅ Data loading complete');
        
        if (projectLocations.length === 0 && resourceLocations.length === 0 && billingLocations.length === 0) {
            console.log("No locations to display for the current filters.");
            
            // Show a message when no data is found
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                const noDataMessage = document.createElement('div');
                noDataMessage.className = 'no-data-message';
                noDataMessage.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #666;">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📍</div>
                        <div style="font-size: 1.1rem; font-weight: 500;">No locations found</div>
                        <div style="font-size: 0.9rem;">Try adjusting your filters</div>
                    </div>
                `;
                
                // Remove existing no-data messages
                const existingMessages = mapContainer.querySelectorAll('.no-data-message');
                existingMessages.forEach(el => el.remove());
                
                mapContainer.appendChild(noDataMessage);
                
                // Auto-remove after 5 seconds
                setTimeout(() => {
                    if (noDataMessage.parentElement) {
                        noDataMessage.remove();
                    }
                }, 5000);
            }
        }
    } catch (error) {
        console.error("Error fetching or displaying data:", error);
        
        // Hide loading state and show error
        console.log('✅ Data loading complete');
        console.error('❌ Data loading error:', error);
    }
}

function handleViewDetails() {
    if (selectedMarker) {
        const location = selectedMarker.location;
        const markerType = selectedMarker.markerType;
        
        let content = '';
        if (markerType === 'project') {
            const projectName = location.projectName || 'Unknown Project';
            const projectNumber = location.projectNumber || 'N/A';
            const projectAddress = location.address || 'Address not available';
            const status = location.status || 'N/A';
            const accountName = location.accountName || 'N/A';
            const projectType = location.projectType || 'N/A';
            const claimNumber = location.claimNumber || 'N/A';
            const contactName = location.contactName || 'N/A';
            const dateOfLoss = location.dateOfLoss || null;
            const insurer = location.insurer || 'N/A';
            
            const statusClass = status.toLowerCase().replace(/\s+/g, '-');
            
            content = `
                <div class="project-info-window">
                    <div class="info-header status-${statusClass}">
                        <div class="project-icon">
                            <span class="icon-text">P</span>
                        </div>
                        <div class="project-title">
                            <h3>${projectName}</h3>
                            <span class="project-status status-${statusClass}">${status}</span>
                        </div>
                    </div>
                    
                    <div class="info-content">
                        <div class="info-row">
                            <span class="info-label">PCC Number:</span>
                            <span class="info-value">${projectNumber}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Project Type:</span>
                            <span class="info-value">${projectType}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Account:</span>
                            <span class="info-value">${accountName}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Claim Number:</span>
                            <span class="info-value">${claimNumber}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Contact:</span>
                            <span class="info-value">${contactName}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Insurer:</span>
                            <span class="info-value">${insurer}</span>
                        </div>
                        
                        <div class="info-row address-row">
                            <span class="info-label">Address:</span>
                            <span class="info-value">${projectAddress}</span>
                        </div>
                        
                        ${dateOfLoss ? `
                        <div class="info-row">
                            <span class="info-label">Date of Loss:</span>
                            <span class="info-value">${dateOfLoss}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="info-actions">
                        <button class="action-btn primary" onclick="openDirections(${location.lat}, ${location.lng}, '${projectName.replace(/'/g, "\\'")}')">
                            <span class="btn-icon">📍</span>
                            Get Directions
                        </button>
                        <button class="action-btn secondary" onclick="viewProjectSummary('${location.id || projectNumber}')">
                            <span class="btn-icon">📄</span>
                            View Summary
                        </button>
                    </div>
                </div>
            `;
        } else if (markerType === 'resource') {
            const fullName = `${location.resource?.employeeName?.firstName || ''} ${location.resource?.employeeName?.lastName || ''}`.trim();
            const resourceAddress = `${location.resource?.addresses?.permanent?.addressLine1 || ''}, ${location.resource?.addresses?.permanent?.city || ''}, ${location.resource?.addresses?.permanent?.state || ''}`.replace(/^,\s*|,\s*$/g, '');
            content = `
                <h3>${fullName || 'Unknown Employee'}</h3>
                <p><strong>Employee ID:</strong> ${location.resource?.employeeId || 'N/A'}</p>
                <p><strong>Address:</strong> ${resourceAddress || 'Address not available'}</p>
                <p><strong>Role:</strong> ${location.resource?.userRole || 'N/A'}</p>
                <p><strong>Employee Type:</strong> ${location.resource?.employeeType || 'N/A'}</p>
                <p><strong>Status:</strong> ${location.resource?.status || 'N/A'}</p>
            `;
        } else if (markerType === 'billing') {
            content = `
                <h3>${location.billing?.resourceName || 'Unknown Resource'}</h3>
                <p><strong>PCC Number:</strong> ${location.billing?.projectPccNumber || 'N/A'}</p>
                <p><strong>Claim Number:</strong> ${location.billing?.claimNumber || 'N/A'}</p>
                <p><strong>Payment Type:</strong> ${location.billing?.paymentType || 'N/A'}</p>
                <p><strong>Billing Status:</strong> ${location.billing?.billingStatus || 'N/A'}</p>
            `;
        }
        
        infoWindow.setContent(content);
        infoWindow.open(map, selectedMarker);
    }
    contextMenu.style.display = 'none';
}

function showProjectSummary(projectId) {
    alert(`Project summary for ID ${projectId} would open in a new tab`);
}

function openDirections(lat, lng, name) {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(googleMapsUrl, '_blank');
}

// Add styles for info windows
const infoWindowStyles = `
    .info-window {
        padding: 12px;
        max-width: 300px;
        font-family: Arial, sans-serif;
    }
    .info-window h3 {
        color: var(--primary-blue);
        margin: 0 0 10px 0;
        font-size: 16px;
    }
    .info-window p {
        margin: 5px 0;
        font-size: 14px;
        line-height: 1.4;
    }
    .info-window strong {
        color: var(--secondary-blue);
    }
`;

const styleElement = document.createElement('style');
styleElement.textContent = infoWindowStyles;
document.head.appendChild(styleElement);

// Info window action functions
window.viewProjectSummary = function(projectId) {
    console.log('🔍 Opening project summary for:', projectId);
    
    const projectData = activeMarkers.find(marker => 
        marker.markerType === 'project' && 
        (marker.location.id === projectId || marker.location.projectNumber === projectId)
    );
    
    if (projectData) {
        const project = projectData.location;
        
        // Get status class for styling
        const statusClass = project.status ? project.status.toLowerCase().replace(/\s+/g, '-') : 'unknown';
        
        const summaryHTML = `
            <div class="project-summary-section">
                <h4>Project Overview</h4>
                <div class="project-detail-grid">
                    <span class="project-detail-label">Project Name:</span>
                    <span class="project-detail-value">${project.projectName || 'N/A'}</span>
                    
                    <span class="project-detail-label">PCC Number:</span>
                    <span class="project-detail-value">${project.projectNumber || 'N/A'}</span>
                    
                    <span class="project-detail-label">Status:</span>
                    <span class="project-detail-value">
                        <span class="project-status-badge status-${statusClass}">${project.status || 'Unknown'}</span>
                    </span>
                    
                    <span class="project-detail-label">Project Type:</span>
                    <span class="project-detail-value">${project.projectType || 'N/A'}</span>
                </div>
            </div>
            
            <div class="project-summary-section">
                <h4>Client Information</h4>
                <div class="project-detail-grid">
                    <span class="project-detail-label">Account:</span>
                    <span class="project-detail-value">${project.accountName || 'N/A'}</span>
                    
                    <span class="project-detail-label">Contact:</span>
                    <span class="project-detail-value">${project.contactName || 'N/A'}</span>
                    
                    <span class="project-detail-label">Insurer:</span>
                    <span class="project-detail-value">${project.insurer || 'N/A'}</span>
                    
                    <span class="project-detail-label">Claim Number:</span>
                    <span class="project-detail-value">${project.claimNumber || 'N/A'}</span>
                </div>
            </div>
            
            <div class="project-summary-section">
                <h4>Location & Timeline</h4>
                <div class="project-detail-grid">
                    <span class="project-detail-label">Address:</span>
                    <span class="project-detail-value">${project.address || 'N/A'}</span>
                    
                    ${project.dateOfLoss ? `
                    <span class="project-detail-label">Date of Loss:</span>
                    <span class="project-detail-value">${project.dateOfLoss}</span>
                    ` : ''}
                    
                    <span class="project-detail-label">Coordinates:</span>
                    <span class="project-detail-value">${project.lat && project.lng ? `${project.lat.toFixed(4)}, ${project.lng.toFixed(4)}` : 'N/A'}</span>
                </div>
            </div>
        `;
        
        // Populate and show modal
        const modalBody = document.getElementById('project-summary-body');
        const modal = document.getElementById('project-summary-modal');
        
        if (modalBody && modal) {
            modalBody.innerHTML = summaryHTML;
            modal.style.display = 'block';
            
            // Setup close functionality
            const closeBtn = document.getElementById('project-summary-close');
            if (closeBtn) {
                closeBtn.onclick = function() {
                    modal.style.display = 'none';
                };
            }
            
            // Close when clicking outside modal
            modal.onclick = function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        }
    } else {
        alert('Project details not found.');
    }
};

window.openDirections = function(lat, lng, locationName) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
    console.log(`🗺️ Opening directions to ${locationName} at ${lat}, ${lng}`);
};