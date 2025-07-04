// Filter management functions
let dropdowns = {
    projectSearch: {
        input: null,
        list: null,
        options: [],
        selected: ''
    },
    projectType: {
        input: null,
        list: null,
        options: [],
        selected: ''
    },
    accountName: {
        input: null,
        list: null,
        options: [],
        selected: ''
    },
    projectStatus: {
        input: null,
        list: null,
        options: ['Completed', 'Live', 'Archived', 'Cancelled', 'Suspended'],
        selected: ''
    },
    userRole: {
        input: null,
        list: null,
        options: ['Engineering Manager', 'Field Engineer', 'Nexus Engineers', 'Project Coordinator', 'Quality Reviewer', 'Technical Writer', 'Operations Manager', 'Business Development Manager', 'Nexus Engineering Manager'],
        selected: ''
    },
    employeeType: {
        input: null,
        list: null,
        options: ['Permanent', 'Contract'],
        selected: ''
    },
    resourceStatus: {
        input: null,
        list: null,
        options: ['Active', 'Inactive'],
        selected: ''
    },
    resourceSearch: {
        input: null,
        list: null,
        options: [],
        selected: ''
    },
    billingSearch: {
        input: null,
        list: null,
        options: [],
        selected: ''
    }
};

function initializeDropdowns() {
    dropdowns.projectSearch.input = document.getElementById('project-search');
    dropdowns.projectSearch.list = document.getElementById('project-search-list');
    dropdowns.projectType.input = document.getElementById('project-type-search');
    dropdowns.projectType.list = document.getElementById('project-type-list');
    dropdowns.accountName.input = document.getElementById('account-name-search');
    dropdowns.accountName.list = document.getElementById('account-name-list');
    dropdowns.projectStatus.input = document.getElementById('project-status-search');
    dropdowns.projectStatus.list = document.getElementById('project-status-list');
    dropdowns.userRole.input = document.getElementById('user-role-search');
    dropdowns.userRole.list = document.getElementById('user-role-list');
    dropdowns.employeeType.input = document.getElementById('employee-type-search');
    dropdowns.employeeType.list = document.getElementById('employee-type-list');
    dropdowns.resourceStatus.input = document.getElementById('resource-status-search');
    dropdowns.resourceStatus.list = document.getElementById('resource-status-list');
    dropdowns.resourceSearch.input = document.getElementById('resource-search');
    dropdowns.resourceSearch.list = document.getElementById('resource-search-list');
    dropdowns.billingSearch.input = document.getElementById('billing-search');
    dropdowns.billingSearch.list = document.getElementById('billing-search-list');

    for (const key of Object.keys(dropdowns)) {
        const dropdown = dropdowns[key];
        if (!dropdown.input || !dropdown.list) {
            continue;
        }
        
        dropdown.input.addEventListener('input', () => {
            const searchTerm = dropdown.input.value.toLowerCase();
            
            // If input is empty, reset the selection and apply filters
            if (searchTerm === '') {
                dropdown.selected = '';
                applyFilters(key);
                updateDropdownList(key, dropdown.options);
                dropdown.list.classList.add('show');
                return;
            }
            
            let filteredOptions;
            
            if (key === 'projectSearch') {
                // Filter by PCC number or project name for project search
                filteredOptions = dropdown.options.filter(option => {
                    if (!option || !option.pccNumber || !option.projectName) return false;
                    return option.pccNumber.toString().toLowerCase().includes(searchTerm) ||
                           option.projectName.toLowerCase().includes(searchTerm);
                });
            } else {
                filteredOptions = dropdown.options.filter(option => {
                    if (!option || typeof option !== 'string') return false;
                    return option.toLowerCase().includes(searchTerm);
                });
            }
            
            updateDropdownList(key, filteredOptions);
            dropdown.list.classList.add('show');
        });

        dropdown.input.addEventListener('focus', () => {
            updateDropdownList(key, dropdown.options);
            dropdown.list.classList.add('show');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.input.contains(e.target) && !dropdown.list.contains(e.target)) {
                dropdown.list.classList.remove('show');
            }
        });
    }
}

function updateDropdownList(dropdownKey, options) {
    const dropdown = dropdowns[dropdownKey];
    if (!dropdown || !dropdown.list) return;
    
    dropdown.list.innerHTML = '';
    
    // Handle empty options case
    if (!options || options.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'dropdown-item dropdown-empty';
        emptyItem.textContent = 'No options available';
        emptyItem.style.fontStyle = 'italic';
        emptyItem.style.color = '#999';
        dropdown.list.appendChild(emptyItem);
        return;
    }
    for (const option of options) {
        // Skip undefined, null, or invalid options
        if (!option) continue;
        
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        
        // Handle search dropdowns with object structure
        if (typeof option === 'object' && option.displayText) {
            // Handle project search
            if (dropdownKey === 'projectSearch') {
                if (!option.pccNumber || !option.projectName) continue;
                
                item.textContent = option.displayText;
                item.addEventListener('click', () => {
                    dropdown.selected = option.pccNumber;
                    dropdown.input.value = option.displayText;
                    dropdown.list.classList.remove('show');
                    applyFilters(dropdownKey);
                });
            }
            // Handle resource search
            else if (dropdownKey === 'resourceSearch') {
                if (!option.id || !option.name) continue;
                
                item.textContent = option.displayText;
                item.addEventListener('click', () => {
                    dropdown.selected = option.id;
                    dropdown.input.value = option.displayText;
                    dropdown.list.classList.remove('show');
                    applyFilters(dropdownKey);
                });
            }
            // Handle billing search
            else if (dropdownKey === 'billingSearch') {
                if (!option.id) continue;
                
                item.textContent = option.displayText;
                item.addEventListener('click', () => {
                    dropdown.selected = option.id;
                    dropdown.input.value = option.displayText;
                    dropdown.list.classList.remove('show');
                    applyFilters(dropdownKey);
                });
            }
        } else {
            // Skip if option is not a valid string
            if (typeof option !== 'string' || option.trim() === '') continue;
            
            item.textContent = option;
            item.addEventListener('click', () => {
                dropdown.selected = option;
                dropdown.input.value = option;
                dropdown.list.classList.remove('show');
                applyFilters(dropdownKey);
            });
        }
        dropdown.list.appendChild(item);
    }
}

async function populateDropdownOptions(appliedFilters = null) {
    try {
        // Get current filters if not provided
        const currentFilters = appliedFilters || collectFilters();
        
        // Fetch all data types
        const [projectsResponse, resourcesResponse, billingResponse] = await Promise.all([
            getProjectsData({}), // Get all projects first
            getResourcesData({}), // Get all resources first
            getBillingData({}) // Get all billing locations first
        ]);
        
        const allProjects = projectsResponse.data || projectsResponse || [];
        const allResources = resourcesResponse.data || resourcesResponse || [];
        const allBilling = billingResponse.data || billingResponse || [];
        
        // IMPORTANT: Filter ALL data by valid coordinates FIRST
        const validProjects = allProjects.filter(p => p && hasValidCoordinates(p));
        const validResources = allResources.filter(r => r && hasValidCoordinates(r));
        const validBilling = allBilling.filter(b => b && hasValidCoordinates(b));
        
        // Apply cascading filters to project search options (already filtered by coordinates)
        let filteredProjectsForSearch = validProjects.filter(p => p && p.projectNumber && p.projectName);
        
        // Apply project filters to project search dropdown
        if (currentFilters.project_status) {
            filteredProjectsForSearch = filteredProjectsForSearch.filter(p => p.status === currentFilters.project_status);
        }
        if (currentFilters.projectType) {
            filteredProjectsForSearch = filteredProjectsForSearch.filter(p => p.projectType === currentFilters.projectType);
        }
        if (currentFilters.accountName) {
            filteredProjectsForSearch = filteredProjectsForSearch.filter(p => p.accountName === currentFilters.accountName);
        }
        
        const projects = filteredProjectsForSearch.map(p => ({
            pccNumber: p.projectNumber,
            projectName: p.projectName,
            displayText: `${p.projectNumber} - ${p.projectName}`,
            status: p.status,
            projectType: p.projectType,
            accountName: p.accountName
        }));
        
        // Get unique values ONLY from projects with valid coordinates
        const projectTypes = [...new Set(validProjects.map(p => p.projectType).filter(Boolean))];
        const accountNames = [...new Set(validProjects.map(p => p.accountName).filter(Boolean))];
        
        // Apply cascading filters to resource search options (already filtered by coordinates)
        let filteredResourcesForSearch = validResources.filter(r => r && r.fullName);
        
        if (currentFilters.userRole) {
            filteredResourcesForSearch = filteredResourcesForSearch.filter(r => r.role === currentFilters.userRole);
        }
        if (currentFilters.resourceStatus) {
            filteredResourcesForSearch = filteredResourcesForSearch.filter(r => r.status === currentFilters.resourceStatus);
        }
        if (currentFilters.employeeType) {
            filteredResourcesForSearch = filteredResourcesForSearch.filter(r => r.employeeType === currentFilters.employeeType);
        }
        
        const resourceSearch = filteredResourcesForSearch.map(r => ({
            id: r.id,
            name: r.fullName,
            displayText: `${r.fullName} - ${r.role || 'Unknown Role'}`,
            role: r.role,
            status: r.status,
            employeeType: r.employeeType
        }));
        
        // Apply cascading filters to billing search options (already filtered by coordinates)
        let filteredBillingForSearch = validBilling.filter(b => b && b.address);
        
        
        const billingSearch = filteredBillingForSearch.map(b => ({
            id: b.id,
            codeId: b.codeId,
            displayText: `${b.codeId || b.id} - ${b.address}`,
            status: b.status,
            address: b.address
        }));
        
        // Update dropdown options
        dropdowns.projectSearch.options = projects;
        dropdowns.projectType.options = projectTypes;
        dropdowns.accountName.options = accountNames;
        
        // Add resource search dropdown if it exists
        if (dropdowns.resourceSearch) {
            dropdowns.resourceSearch.options = resourceSearch;
        }
        
        // Add billing search dropdown if it exists  
        if (dropdowns.billingSearch) {
            dropdowns.billingSearch.options = billingSearch;
        }
        
        // Update all dropdown lists
        for (const key of Object.keys(dropdowns)) {
            updateDropdownList(key, dropdowns[key].options);
        }
        
        // Log filtering results for debugging
        console.log(`Filter cascade results:`, {
            projects: `${projects.length}/${validProjects.length} (${allProjects.length - validProjects.length} without coords)`,
            resources: `${resourceSearch.length}/${validResources.length} (${allResources.length - validResources.length} without coords)`, 
            billing: `${billingSearch.length}/${validBilling.length} (${allBilling.length - validBilling.length} without coords)`,
            appliedFilters: currentFilters
        });
        
    } catch (error) {
        console.error('Error populating dropdown options:', error);
    }
}

function collectFilters() {
    return {
        pccNumber: dropdowns.projectSearch.selected,
        projectType: dropdowns.projectType.selected,
        accountName: dropdowns.accountName.selected,
        project_status: dropdowns.projectStatus.selected,
        userRole: dropdowns.userRole.selected,
        employeeType: dropdowns.employeeType.selected,
        resourceStatus: dropdowns.resourceStatus.selected,
        resourceSearch: dropdowns.resourceSearch.selected,
        billingSearch: dropdowns.billingSearch.selected
    };
}

async function resetAllFilters() {
    for (const key of Object.keys(dropdowns)) {
        dropdowns[key].selected = '';
        dropdowns[key].input.value = '';
    }
    // Refresh dropdown options with no filters applied
    await populateDropdownOptions({});
    applyFilters();
}

async function applyFilters(changedFilter = null) {
    const filters = collectFilters();
    
    // Only refresh dropdown options if a non-search filter changed
    const searchFilters = ['projectSearch', 'resourceSearch', 'billingSearch'];
    if (changedFilter && !searchFilters.includes(changedFilter)) {
        await populateDropdownOptions(filters);
    }
    
    loadAndDisplayData(filters, changedFilter);
}

// Function to get ALL locations with valid coordinates for route planning
// This ignores any active filters and returns everything that can be mapped
async function getAllLocationsForRouting() {
    try {
        // Fetch all data types without any filters
        const [projectsResponse, resourcesResponse, billingResponse] = await Promise.all([
            getProjectsData({}),
            getResourcesData({}), 
            getBillingData({})
        ]);
        
        const allProjects = projectsResponse.data || projectsResponse || [];
        const allResources = resourcesResponse.data || resourcesResponse || [];
        const allBilling = billingResponse.data || billingResponse || [];
        
        // Filter ONLY by valid coordinates - ignore all other filters
        const validProjects = allProjects.filter(p => p && hasValidCoordinates(p));
        const validResources = allResources.filter(r => r && hasValidCoordinates(r));
        const validBilling = allBilling.filter(b => b && hasValidCoordinates(b));
        
        // Format for route planning
        const routeLocations = {
            projects: validProjects.map(p => ({
                id: p.id,
                type: 'project',
                name: p.projectName,
                displayText: `P: ${p.projectNumber} - ${p.projectName}`,
                address: p.address,
                lat: p.lat,
                lng: p.lng,
                status: p.status,
                projectNumber: p.projectNumber
            })),
            resources: validResources.map(r => ({
                id: r.id,
                type: 'resource',
                name: r.fullName,
                displayText: `R: ${r.fullName} - ${r.role || 'Unknown Role'}`,
                address: r.address,
                lat: r.lat,
                lng: r.lng,
                role: r.role,
                status: r.status
            })),
            billing: validBilling.map(b => ({
                id: b.id,
                type: 'billing',
                name: b.codeId || `Billing ${b.id}`,
                displayText: `B: ${b.codeId || b.id} - ${b.address}`,
                address: b.address,
                lat: b.lat,
                lng: b.lng,
                status: b.status
            }))
        };
        
        // Combine all locations into a single array for route planning
        const allLocations = [
            ...routeLocations.projects,
            ...routeLocations.resources,
            ...routeLocations.billing
        ];
        
        console.log(`Route planning locations available:`, {
            projects: routeLocations.projects.length,
            resources: routeLocations.resources.length,
            billing: routeLocations.billing.length,
            total: allLocations.length
        });
        
        return {
            byType: routeLocations,
            combined: allLocations,
            total: allLocations.length
        };
        
    } catch (error) {
        console.error('Error fetching locations for routing:', error);
        return {
            byType: { projects: [], resources: [], billing: [] },
            combined: [],
            total: 0
        };
    }
}

// Widget mode - no authentication needed

// Initialize filter manager
window.filterManager = {
    initializeDropdowns,
    populateDropdownOptions,
    collectFilters,
    resetAllFilters,
    applyFilters,
    getAllLocationsForRouting
};