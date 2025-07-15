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
    // Check if Google Maps API is available
    if (typeof google === 'undefined' || !google.maps) {
        showMapError('Google Maps API not loaded. Please check your internet connection.');
        return;
    }
    // Don't clear the entire map container, just ensure the map div exists
    let actualMapDiv = document.getElementById('map');
    if (!actualMapDiv) {
        actualMapDiv = document.createElement('div');
        actualMapDiv.id = 'map';
        actualMapDiv.style.width = '100%';
        actualMapDiv.style.height = '100%';
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.appendChild(actualMapDiv);
        } else {
            return;
        }
    }
    try {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 39.833, lng: -98.583 },
            zoom: 4,
            mapTypeControl: false,
            streetViewControl: false,
            mapId: 'fb4518226e59c4892eee2d21'
        });
    } catch (error) {
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
    
    // Setup legend toggle event listener
    const toggleLegendBtn = document.getElementById('toggle-legend');
    if (toggleLegendBtn) {
        toggleLegendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleLegend();
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
    initializeMap();
};
function getMarkerStyle(location, markerType) {
    // Define marker styles for different types - single color per type
    const markerStyles = {
        project: {
            background: '#4CAF50',    // Green for all Project markers (regardless of status)
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
        title = `Billing Location ${location.codeId || 'Unknown'}`;
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
        // Show info window
        let content = '';
        if (markerType === 'project') {
            // Simple direct field access - no complex fallbacks needed
            const projectName = location.projectName || 'Unknown Project';
            const projectNumber = location.projectNumber || 'N/A';
            const projectAddress = location.address || 'Address not available';
            // Use displayStatus for combined status display, fallback to status for backward compatibility
            const displayStatus = location.displayStatus || location.status || 'N/A';
            // Use primaryStatus for CSS styling, fallback to status for backward compatibility
            const primaryStatus = location.primaryStatus || location.status || 'N/A';
            const accountName = location.accountName || 'N/A';
            const projectType = location.projectType || 'N/A';
            const claimNumber = location.claimNumber || 'N/A';
            const contactName = location.contactName || 'N/A';
            const dateOfLoss = location.dateOfLoss || null;
            const insurer = location.insurer || 'N/A';
            const statusClass = primaryStatus.toLowerCase().replace(/\s+/g, '-');
            content = `
                <div class="project-info-window">
                    <div class="info-header status-${statusClass}">
                        <div class="project-icon">
                            <span class="icon-text">P</span>
                        </div>
                        <div class="project-title">
                            <h3>${projectName}</h3>
                            <span class="project-status status-${statusClass}">${displayStatus}</span>
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
                            <span class="project-status status-${statusClass}">${displayStatus}</span>
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
                    </div>
                </div>
            `;
        } else if (markerType === 'billing') {
            const codeId = location.codeId || 'N/A';
            const status = location.status || 'N/A';
            const population = location.population || 'N/A';
            const address = location.address || 'Address not available';
            const statusClass = status.toLowerCase().replace(/\s+/g, '-');
            content = `
                <div class="project-info-window">
                    <div class="info-header">
                        <div class="project-icon billing-icon">
                            <span class="icon-text">B</span>
                        </div>
                        <div class="project-title">
                            <h3>Billing Location ${codeId}</h3>
                            <span class="project-status status-${statusClass}">${status === 'false' ? 'Inactive' : status}</span>
                        </div>
                    </div>
                    <div class="info-content">
                        <div class="info-row">
                            <span class="info-label">Code ID:</span>
                            <span class="info-value">${codeId}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Population:</span>
                            <span class="info-value">${Number(population).toLocaleString()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Status:</span>
                            <span class="info-value">${status === 'false' ? 'Inactive' : 'Active'}</span>
                        </div>
                        <div class="info-row address-row">
                            <span class="info-label">Address:</span>
                            <span class="info-value">${address}</span>
                        </div>
                    </div>
                    <div class="info-actions">
                        <button class="action-btn primary" onclick="openDirections(${location.lat}, ${location.lng}, 'Billing Location ${codeId.replace(/'/g, "\\'")}')">
                            <span class="btn-icon">📍</span>
                            Get Directions
                        </button>
                    </div>
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
        selectedMarker = marker;
        if (contextMenu) {
            // Simple approach: use the mouse event coordinates
            const x = e.domEvent ? e.domEvent.clientX : window.event.clientX;
            const y = e.domEvent ? e.domEvent.clientY : window.event.clientY;
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
        // Fetch from separate APIs independently
        const projectFilters = {
            projectNumber: filters.pccNumber,
            reportType: filters.projectType,
            accountName: filters.accountName,
            status: filters.project_status
        };
        console.log('Project filters being applied:', projectFilters);
        const projectResponse = await getProjectsData(projectFilters);
        console.log('Project response:', projectResponse);
        const projectLocations = projectResponse.data || [];
        
        // Count all projects by status (including those without coordinates)
        // For dual-status projects, count them in each applicable status
        const allProjectsByStatus = projectLocations.reduce((acc, p) => {
            if (p.statuses && Array.isArray(p.statuses)) {
                p.statuses.forEach(status => {
                    acc[status] = (acc[status] || 0) + 1;
                });
            } else {
                // Fallback for backward compatibility
                acc[p.status] = (acc[p.status] || 0) + 1;
            }
            return acc;
        }, {});
        const resourcesResponse = await getResourcesData({
            role: filters.userRole,
            employeeType: filters.employeeType,
            status: filters.resourceStatus
        });
        const billingResponse = await getBillingData({
            status: filters.billingStatus,
            paymentType: filters.paymentType
        });
        const billingLocations = billingResponse.data || [];
        // Add project markers (P) - only for projects with valid coordinates
        let projectsWithCoords = 0;
        let projectsWithoutCoords = 0;
        
        // Count projects by status that have valid coordinates (displayed on map)
        const projectsOnMapByStatus = {};
        
        for (const location of projectLocations) {
            if (hasValidCoordinates(location)) {
                addMarkerToMap(location, 'project');
                projectsWithCoords++;
                
                // Count projects with coordinates by status
                // For dual-status projects, count them in each applicable status
                if (location.statuses && Array.isArray(location.statuses)) {
                    location.statuses.forEach(status => {
                        projectsOnMapByStatus[status] = (projectsOnMapByStatus[status] || 0) + 1;
                    });
                } else {
                    // Fallback for backward compatibility
                    const status = location.status || 'Unknown';
                    projectsOnMapByStatus[status] = (projectsOnMapByStatus[status] || 0) + 1;
                }
            } else {
                projectsWithoutCoords++;
            }
        }
        
        // Add resource location markers (R) - only for resources with valid coordinates
        const resourceLocations = resourcesResponse.data || [];
        let addedCount = 0;
        let skippedCount = 0;
        for (const location of resourceLocations) {
            if (hasValidCoordinates(location)) {
                addMarkerToMap(location, 'resource');
                addedCount++;
            } else {
                skippedCount++;
            }
        }
        // Add billing location markers (B) - only for billing with valid coordinates
        let billingAddedCount = 0;
        let billingSkippedCount = 0;
        for (const location of billingLocations) {
            if (hasValidCoordinates(location)) {
                addMarkerToMap(location, 'billing');
                billingAddedCount++;
            } else {
                billingSkippedCount++;
            }
        }
        
        // Update filter counts after all data is processed
        updateFilterCounts(projectsWithCoords, addedCount, billingAddedCount);
        
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
            } else if (changedFilter === 'resourceSearch' && filters.resourceSearch) {
                // Zoom to specific resource
                const resourceMarker = activeMarkers.find(marker => 
                    marker.markerType === 'resource' && marker.location.id === filters.resourceSearch
                );
                if (resourceMarker) {
                    map.setCenter(resourceMarker.position);
                    map.setZoom(15);
                }
            } else if (changedFilter === 'billingSearch' && filters.billingSearch) {
                // Zoom to specific billing location
                const billingMarker = activeMarkers.find(marker => 
                    marker.markerType === 'billing' && marker.location.id === filters.billingSearch
                );
                if (billingMarker) {
                    map.setCenter(billingMarker.position);
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
        if (projectLocations.length === 0 && resourceLocations.length === 0 && billingLocations.length === 0) {
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
    }
}

// Update filter count badges with current marker counts
function updateFilterCounts(projectCount, resourceCount, billingCount) {
    const projectsCountEl = document.getElementById('projects-count');
    const resourcesCountEl = document.getElementById('resources-count');
    const billingCountEl = document.getElementById('billing-count');
    
    if (projectsCountEl) {
        projectsCountEl.textContent = `(${projectCount})`;
    }
    if (resourcesCountEl) {
        resourcesCountEl.textContent = `(${resourceCount})`;
    }
    if (billingCountEl) {
        billingCountEl.textContent = `(${billingCount})`;
    }
}

// Toggle legend visibility
function toggleLegend() {
    const legendContent = document.getElementById('legend-content');
    const toggleBtn = document.getElementById('toggle-legend');
    
    if (!legendContent || !toggleBtn) {
        return;
    }
    
    if (legendContent.classList.contains('collapsed')) {
        legendContent.classList.remove('collapsed');
        toggleBtn.textContent = '−';
    } else {
        legendContent.classList.add('collapsed');
        toggleBtn.textContent = '+';
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
            // Use displayStatus for combined status display, fallback to status for backward compatibility
            const displayStatus = location.displayStatus || location.status || 'N/A';
            // Use primaryStatus for CSS styling, fallback to status for backward compatibility  
            const primaryStatus = location.primaryStatus || location.status || 'N/A';
            const accountName = location.accountName || 'N/A';
            const projectType = location.projectType || 'N/A';
            const claimNumber = location.claimNumber || 'N/A';
            const contactName = location.contactName || 'N/A';
            const dateOfLoss = location.dateOfLoss || null;
            const insurer = location.insurer || 'N/A';
            const statusClass = primaryStatus.toLowerCase().replace(/\s+/g, '-');
            content = `
                <div class="project-info-window">
                    <div class="info-header status-${statusClass}">
                        <div class="project-icon">
                            <span class="icon-text">P</span>
                        </div>
                        <div class="project-title">
                            <h3>${projectName}</h3>
                            <span class="project-status status-${statusClass}">${displayStatus}</span>
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
            // Use the same data structure as the regular click handler
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
                            <span class="project-status status-${statusClass}">${displayStatus}</span>
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
                    </div>
                </div>
            `;
        } else if (markerType === 'billing') {
            const codeId = location.codeId || 'N/A';
            const status = location.status || 'N/A';
            const population = location.population || 'N/A';
            const address = location.address || 'Address not available';
            const statusClass = status.toLowerCase().replace(/\s+/g, '-');
            content = `
                <div class="project-info-window">
                    <div class="info-header">
                        <div class="project-icon billing-icon">
                            <span class="icon-text">B</span>
                        </div>
                        <div class="project-title">
                            <h3>Billing Location ${codeId}</h3>
                            <span class="project-status status-${statusClass}">${status === 'false' ? 'Inactive' : status}</span>
                        </div>
                    </div>
                    <div class="info-content">
                        <div class="info-row">
                            <span class="info-label">Code ID:</span>
                            <span class="info-value">${codeId}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Population:</span>
                            <span class="info-value">${Number(population).toLocaleString()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Status:</span>
                            <span class="info-value">${status === 'false' ? 'Inactive' : 'Active'}</span>
                        </div>
                        <div class="info-row address-row">
                            <span class="info-label">Address:</span>
                            <span class="info-value">${address}</span>
                        </div>
                    </div>
                    <div class="info-actions">
                        <button class="action-btn primary" onclick="openDirections(${location.lat}, ${location.lng}, 'Billing Location ${codeId.replace(/'/g, "\\'")}')">
                            <span class="btn-icon">📍</span>
                            Get Directions
                        </button>
                    </div>
                </div>
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
                        <span class="project-status-badge status-${statusClass}">${project.displayStatus || project.status || 'Unknown'}</span>
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
            <div class="project-summary-actions">
                <button class="action-btn primary" onclick="openProjectRecord('${project.id}')">
                    <span class="btn-icon">🔗</span>
                    Open Project Record
                </button>
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
};
window.viewResourceSummary = function(resourceId) {
    alert(`Resource profile for ID ${resourceId} would open in a new tab`);
};

window.openProjectRecord = function(projectId) {
    if (!projectId || projectId === 'undefined' || projectId === '') {
        alert('Project ID not available for this record');
        return;
    }
    
    const url = `https://creatorapp.zoho.com/premaconsultinggroupllc/pemo/#Page:Project_Summary_Page?project_num=${projectId}`;
    window.open(url, '_blank');
};