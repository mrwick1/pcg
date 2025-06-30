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
        options: ['Completed', 'Live', 'Archived', 'Cancelled', 'Suspended', 'In Progress'],
        selected: ''
    },
    userRole: {
        input: null,
        list: null,
        options: [],
        selected: ''
    },
    employeeType: {
        input: null,
        list: null,
        options: ['Full Time', 'Contract'],
        selected: ''
    },
    resourceStatus: {
        input: null,
        list: null,
        options: ['Active', 'Inactive', 'On Bench'],
        selected: ''
    },
    billingStatus: {
        input: null,
        list: null,
        options: [],
        selected: ''
    },
    paymentType: {
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
    dropdowns.billingStatus.input = document.getElementById('billing-status-search');
    dropdowns.billingStatus.list = document.getElementById('billing-status-list');
    dropdowns.paymentType.input = document.getElementById('payment-type-search');
    dropdowns.paymentType.list = document.getElementById('payment-type-list');

    for (const key of Object.keys(dropdowns)) {
        const dropdown = dropdowns[key];
        if (!dropdown.input || !dropdown.list) {
            console.error(`Dropdown elements not found for ${key}`);
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
    for (const option of options) {
        // Skip undefined, null, or invalid options
        if (!option) continue;
        
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        
        // Handle project search with object structure
        if (dropdownKey === 'projectSearch' && typeof option === 'object') {
            // Skip if required fields are missing
            if (!option.displayText || !option.pccNumber || !option.projectName) continue;
            
            item.textContent = option.displayText;
            item.addEventListener('click', () => {
                dropdown.selected = option.pccNumber;
                dropdown.input.value = option.displayText;
                dropdown.list.classList.remove('show');
                applyFilters(dropdownKey);
            });
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

async function populateDropdownOptions() {
    try {
        // Fetch only projects data (simplified)
        const projectsData = await getProjectsData({});

        // Create project options with project number and project name for search
        // Only include projects with valid coordinates
        console.log(`🔍 Raw projects data length: ${projectsData.length}`);
        
        const validProjects = projectsData.filter(p => p && p.projectNumber && p.projectName && hasValidCoordinates(p));
        console.log(`✅ Projects with valid coordinates for dropdown: ${validProjects.length}`);
        
        const projects = validProjects.map(p => ({
            pccNumber: p.projectNumber,
            projectName: p.projectName,
            displayText: `${p.projectNumber} - ${p.projectName}`
        }));
        
        // Get unique values from projects data (simplified)
        const projectTypes = [...new Set(projectsData.map(p => p.projectType).filter(Boolean))];
        const accountNames = [...new Set(projectsData.map(p => p.accountName).filter(Boolean))];
        
        // COMMENTED OUT: Functions not available in simplified version
        // const userRoles = getUniqueUserRoles().filter(role => role && typeof role === 'string');
        // const billingStatuses = getUniqueBillingStatuses().filter(status => status && typeof status === 'string');
        // const paymentTypes = getUniquePaymentTypes().filter(type => type && typeof type === 'string');

        dropdowns.projectSearch.options = projects;
        dropdowns.projectType.options = projectTypes;
        dropdowns.accountName.options = accountNames;
        
        // COMMENTED OUT: Dropdowns not available in simplified version
        // dropdowns.userRole.options = userRoles;
        // dropdowns.billingStatus.options = billingStatuses;
        // dropdowns.paymentType.options = paymentTypes;

        for (const key of Object.keys(dropdowns)) {
            updateDropdownList(key, dropdowns[key].options);
        }
    } catch (error) {
        console.error("Error populating dropdown options:", error);
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
        status: dropdowns.resourceStatus.selected,
        billingStatus: dropdowns.billingStatus.selected,
        paymentType: dropdowns.paymentType.selected
    };
}

function resetAllFilters() {
    for (const key of Object.keys(dropdowns)) {
        dropdowns[key].selected = '';
        dropdowns[key].input.value = '';
    }
    applyFilters();
}

function applyFilters(changedFilter = null) {
    const filters = collectFilters();
    loadAndDisplayData(filters, changedFilter);
}

// Widget mode - no authentication needed

// Initialize filter manager
window.filterManager = {
    initializeDropdowns,
    populateDropdownOptions,
    collectFilters,
    resetAllFilters,
    applyFilters
};