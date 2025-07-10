// Simplified Zoho Creator API Service - Functional Approach
// Focused only on All_Projects API calls
// Global configuration
const ZOHO_CONFIG = {
    appName: 'pemo',
    projectsReportName: 'All_Projects',
    customersReportName: 'All_Customers',
    billingReportName: 'All_Billing_Locations'
};
// Request deduplication to prevent multiple simultaneous API calls
let ongoingAPIRequest = null;
let ongoingResourcesAPIRequest = null;
let ongoingBillingAPIRequest = null;
// Check if Zoho Creator API is available
function isZohoAPIAvailable() {
    return typeof ZOHO !== 'undefined' && 
           ZOHO.CREATOR && 
           (ZOHO.CREATOR.DATA?.getRecords || ZOHO.CREATOR.PUBLISH?.getRecords);
}
// Initialize and test Zoho API
async function initializeZohoAPI() {
    if (!isZohoAPIAvailable()) {
        return false;
    }
    // Test API methods
    if (ZOHO.CREATOR.DATA?.getRecords) {
        return true;
    } else if (ZOHO.CREATOR.PUBLISH?.getRecords) {
        return true;
    }
    return false;
}
// Make API call to fetch All_Projects data with pagination
async function fetchAllProjectsData() {
    if (!isZohoAPIAvailable()) {
        return getMockProjectsData();
    }
    let allRecords = [];
    let recordCursor = null;
    let pageNumber = 1;
    let hasMoreRecords = true;
    while (hasMoreRecords) {
        // Build config for this page
        const config = {
            app_name: ZOHO_CONFIG.appName,
            report_name: ZOHO_CONFIG.projectsReportName,
            max_records: 1000
        };
        // Add record_cursor for subsequent pages
        if (recordCursor) {
            config.record_cursor = recordCursor;
        }
        let pageResponse = null;
        // Try DATA.getRecords first
        if (ZOHO.CREATOR.DATA?.getRecords) {
            try {
                pageResponse = await ZOHO.CREATOR.DATA.getRecords(config);
            } catch (error) {
            }
        }
        // Try PUBLISH.getRecords as fallback
        if (!pageResponse && ZOHO.CREATOR.PUBLISH?.getRecords) {
            try {
                pageResponse = await ZOHO.CREATOR.PUBLISH.getRecords(config);
            } catch (error) {
            }
        }
        if (!pageResponse) {
            break;
        }
        // Process this page's response
        const processedPage = processAPIResponse(pageResponse);
        if (processedPage.data && processedPage.data.length > 0) {
            allRecords = allRecords.concat(processedPage.data);
            // Check for pagination cursor in response
            recordCursor = extractRecordCursor(pageResponse);
            if (recordCursor) {
                pageNumber++;
            } else {
                hasMoreRecords = false;
            }
            // Safety check to prevent infinite loops
            if (pageNumber > 50) {
                hasMoreRecords = false;
            }
        } else {
            hasMoreRecords = false;
        }
    }
    return {
        data: allRecords,
        success: allRecords.length > 0,
        mock: false,
        totalPages: pageNumber,
        totalRecords: allRecords.length
    };
}
// Helper function to extract record_cursor from API response
function extractRecordCursor(response) {
    // Check various possible cursor field names based on Zoho API documentation
    if (response && response.record_cursor) {
        return response.record_cursor;
    }
    if (response && response.cursor) {
        return response.cursor;
    }
    if (response && response.next_cursor) {
        return response.next_cursor;
    }
    if (response && response.pagination && response.pagination.cursor) {
        return response.pagination.cursor;
    }
    if (response && response.pagination && response.pagination.record_cursor) {
        return response.pagination.record_cursor;
    }
    // Check if there are more records available (some APIs use has_more flag)
    if (response && response.has_more === false) {
        return null;
    }
    return null;
}
// Process API response to extract data
function processAPIResponse(response) {
    if (response && response.data && Array.isArray(response.data)) {
        return { data: response.data, success: true };
    } else if (response && Array.isArray(response)) {
        return { data: response, success: true };
    } else if (response && response.result && Array.isArray(response.result)) {
        return { data: response.result, success: true };
    } else {
        return { data: [], success: false };
    }
}
// Mock data for testing when API is not available
function getMockProjectsData() {
    return {
        data: [
            {
                ID: "mock1",
                Project_Number: "06132",
                Project_Name: "Vernon Test Project",
                Loss_Location_Street_Address: "12910 Parsons Road Tampa, FL 33635",
                Latitude: "27.9947",
                Longitude: "-82.3364",
                Account_Name: "Test Client LLC",
                Claim_Number: "HO0525434936",
                Insurer: "Test Insurance Company",
                Type_of_Report: "(20-04) Long-form Report (default)",
                Project_Completed: "false",
                "PS_5.Transmitted_Report_and_Invoice_to_the_Client": null,
                "PS_5.Project_Cancelled": "false",
                "PS_5.Project_Cancelled_Date": null,
                "PS_5.Project_Suspended": null,
                Contact_Name: "John Doe",
                Date_of_Loss: "Jun 12,2025"
            },
            {
                ID: "mock2", 
                Project_Number: "06133",
                Project_Name: "Sample Completed Project",
                Loss_Location_Street_Address: "123 Main St, Miami, FL 33101",
                Latitude: "25.7617",
                Longitude: "-80.1918",
                Account_Name: "Another Client Inc",
                Claim_Number: "HO0525434937",
                Insurer: "Sample Insurance Co",
                Type_of_Report: "(20-04) Long-form Report (default)",
                Project_Completed: "true",
                "PS_5.Transmitted_Report_and_Invoice_to_the_Client": "2025-05-20",
                "PS_5.Project_Cancelled": "false",
                "PS_5.Project_Cancelled_Date": null,
                "PS_5.Project_Suspended": null,
                Contact_Name: "Jane Smith",
                Date_of_Loss: "May 15,2025"
            },
            {
                ID: "mock3",
                Project_Number: "06134",
                Project_Name: "Live Project Demo",
                Loss_Location_Street_Address: "456 Ocean Drive, Fort Lauderdale, FL 33301",
                Latitude: "26.1224",
                Longitude: "-80.1373",
                Account_Name: "Live Client Corp",
                Claim_Number: "HO0525434938",
                Insurer: "Live Insurance Group",
                Type_of_Report: "(20-04) Long-form Report (default)",
                Project_Completed: "false",
                "PS_5.Transmitted_Report_and_Invoice_to_the_Client": null,
                "PS_5.Project_Cancelled": "false",
                "PS_5.Project_Cancelled_Date": null,
                "PS_5.Project_Suspended": null,
                Contact_Name: "Mike Johnson",
                Date_of_Loss: "Jul 1,2025"
            },
            {
                ID: "mock4",
                Project_Number: "06135",
                Project_Name: "Archived Project",
                Loss_Location_Street_Address: "789 Sunset Blvd, Orlando, FL 32801",
                Latitude: "28.5383",
                Longitude: "-81.3792",
                Account_Name: "Archive Corp",
                Claim_Number: "HO0525434939",
                Insurer: "Archive Insurance",
                Type_of_Report: "(20-04) Long-form Report (default)",
                Project_Completed: "false",
                "PS_5.Transmitted_Report_and_Invoice_to_the_Client": "2025-04-25",
                "PS_5.Project_Cancelled": "false",
                "PS_5.Project_Cancelled_Date": null,
                "PS_5.Project_Suspended": null,
                Contact_Name: "Sarah Davis",
                Date_of_Loss: "Apr 20,2025"
            },
            {
                ID: "mock5",
                Project_Number: "06136",
                Project_Name: "Cancelled Project",
                Loss_Location_Street_Address: "321 Pine Street, Jacksonville, FL 32202",
                Latitude: "30.3322",
                Longitude: "-81.6557",
                Account_Name: "Cancelled LLC",
                Claim_Number: "HO0525434940",
                Insurer: "Cancelled Insurance",
                Type_of_Report: "(20-04) Long-form Report (default)",
                Project_Completed: "false",
                "PS_5.Transmitted_Report_and_Invoice_to_the_Client": null,
                "PS_5.Project_Cancelled": "true",
                "PS_5.Project_Cancelled_Date": "2025-03-15",
                "PS_5.Project_Suspended": null,
                Contact_Name: "Tom Wilson",
                Date_of_Loss: "Mar 10,2025"
            },
            {
                ID: "mock6",
                Project_Number: "06137", 
                Project_Name: "Another Archived Project",
                Loss_Location_Street_Address: "222 Archive Ave, Tampa, FL 33602",
                Latitude: "27.9478",
                Longitude: "-82.4584",
                Account_Name: "Archive Holdings Inc",
                Claim_Number: "HO0525434999",
                Insurer: "Archive Insurance Co",
                Type_of_Report: "(20-04) Long-form Report (default)",
                Project_Completed: "false",
                "PS_5.Transmitted_Report_and_Invoice_to_the_Client": "2025-05-15",
                "PS_5.Project_Cancelled": "false",
                "PS_5.Project_Cancelled_Date": null,
                "PS_5.Project_Suspended": null,
                Contact_Name: "Archive Manager",
                Date_of_Loss: "May 1,2025"
            },
            {
                ID: "mock7",
                Project_Number: "06138",
                Project_Name: "Suspended Project",
                Loss_Location_Street_Address: "654 Bay Avenue, Naples, FL 34102",
                Latitude: "26.1420",
                Longitude: "-81.7948",
                Account_Name: "Suspended Inc",
                Claim_Number: "HO0525434941",
                Insurer: "Suspended Insurance",
                Type_of_Report: "(20-04) Long-form Report (default)",
                Project_Completed: "false",
                "PS_5.Transmitted_Report_and_Invoice_to_the_Client": null,
                "PS_5.Project_Cancelled": "false",
                "PS_5.Project_Cancelled_Date": null,
                "PS_5.Project_Suspended": "2025-05-10",
                "PS_5.Suspended_Projects_Released_On": null,
                Contact_Name: "Lisa Brown",
                Date_of_Loss: "May 5,2025"
            }
        ],
        success: false,
        mock: true
    };
}
// Test function for billing API
window.testBillingAPI = async function() {
    console.log('Billing API - Starting test...');
    try {
        const result = await fetchAllBillingData();
        console.log('Billing API - Test result:', result);
        if (result.data.length > 0) {
            console.log(`Billing API - Test success: ${result.data.length} records retrieved`);
            console.log('Billing API - Sample record:', result.data[0]);
        } else {
            console.warn('Billing API - Test warning: No records retrieved');
        }
        return result;
    } catch (error) {
        console.error('Billing API - Test error:', error);
        return null;
    }
};
// Helper function to determine project status based on business logic
function determineProjectStatus(project) {
    // Extract location fields
    const address = project.Loss_Location_Street_Address;
    const latitude = project.Latitude;
    const longitude = project.Longitude;
    
    // Check if location data is valid (not empty)
    const hasValidLocation = (address && address !== '') && 
                           (latitude && latitude !== '') && 
                           (longitude && longitude !== '');
    
    // Extract PS_5 fields
    const transmittedToClient = project["PS_5.Transmitted_Report_and_Invoice_to_the_Client"];
    const projectCancelled = project["PS_5.Project_Cancelled"] === 'true' || project["PS_5.Project_Cancelled"] === true;
    const projectCancelledDate = project["PS_5.Project_Cancelled_Date"];
    const projectSuspended = project["PS_5.Project_Suspended"];
    const suspendedReleasedOn = project["PS_5.Suspended_Projects_Released_On"];
    
    // All status types require location validation
    
    // 1. Cancelled Projects (highest priority)
    if (hasValidLocation &&
        projectCancelled === true && 
        projectCancelledDate !== null && projectCancelledDate !== undefined && projectCancelledDate !== '') {
        return 'Cancelled';
    }
    
    // 2. Suspended Projects
    if (hasValidLocation &&
        projectSuspended !== null && projectSuspended !== undefined && projectSuspended !== '' &&
        (transmittedToClient === null || transmittedToClient === undefined || transmittedToClient === '') &&
        (suspendedReleasedOn === null || suspendedReleasedOn === undefined || suspendedReleasedOn === '')) {
        return 'Suspended';
    }
    
    // 3. Archived Projects (priority over Completed - transmitted projects regardless of completion)
    if (hasValidLocation &&
        (transmittedToClient !== null && transmittedToClient !== undefined && transmittedToClient !== '') && 
        projectCancelled === false) {
        return 'Archived';
    }
    
    // 4. Completed Projects (only if not already archived)
    if (hasValidLocation && (project.Project_Completed === 'true' || project.Project_Completed === true)) {
        return 'Completed';
    }
    
    // 5. Live Projects
    if (hasValidLocation &&
        (transmittedToClient === null || transmittedToClient === undefined || transmittedToClient === '') &&
        projectCancelled === false &&
        (projectCancelledDate === null || projectCancelledDate === undefined || projectCancelledDate === '') &&
        (projectSuspended === null || projectSuspended === undefined || projectSuspended === '')) {
        return 'Live';
    }
    
    // If none of the conditions match, return Unknown
    return 'Unknown';
}
// Process raw project data into structured format
function processProjectData(rawProjects) {
    const processedProjects = rawProjects.map((project, index) => {
        // Extract and validate coordinates
        const rawLat = project.Latitude;
        const rawLng = project.Longitude;
        // Convert to numbers, set to null if empty/invalid
        const lat = (rawLat && rawLat !== '') ? Number.parseFloat(rawLat) : null;
        const lng = (rawLng && rawLng !== '') ? Number.parseFloat(rawLng) : null;
        // Calculate status based on business logic
        const calculatedStatus = determineProjectStatus(project);
        return {
            id: project.ID,
            projectNumber: project.Project_Number,
            projectName: project.Project_Name,
            projectType: project.Type_of_Report,
            accountName: project.Account_Name,
            claimNumber: project.Claim_Number,
            contactName: project.Contact_Name,
            address: project.Loss_Location_Street_Address,
            status: calculatedStatus,
            dateOfLoss: project.Date_of_Loss,
            insurer: project.Insurer,
            policyNumber: project.Policy_Number,
            completed: project.Project_Completed === 'true' || project.Project_Completed === true,
            lat: lat,
            lng: lng,
            lastUpdated: Date.now(),
            // Store PS_5 data for reference
            ps5Data: {
                transmittedToClient: project["PS_5.Transmitted_Report_and_Invoice_to_the_Client"],
                projectCancelled: project["PS_5.Project_Cancelled"],
                projectCancelledDate: project["PS_5.Project_Cancelled_Date"],
                projectSuspended: project["PS_5.Project_Suspended"],
                suspendedReleasedOn: project["PS_5.Suspended_Projects_Released_On"]
            }
        };
    });
    return processedProjects;
}
// Main function to get projects data with IndexedDB integration
async function getProjectsData(filters = {}) {
    try {
        // Check if IndexedDB service is available
        if (!window.indexedDBService) {
            return await getProjectsDataDirect(filters);
        }
        // Check if we need to sync data from API
        const needsSync = await window.indexedDBService.needsSync('projects');
        if (needsSync) {
            // Check if an API request is already in progress
            if (ongoingAPIRequest) {
                await ongoingAPIRequest;
            } else {
                // Start API request and store promise to prevent duplicates
                ongoingAPIRequest = (async () => {
                    try {
                        // Fetch fresh data from API
                        const response = await fetchAllProjectsData();
                        if (response.success && response.data.length > 0) {
                            // Process the data
                            const processedProjects = processProjectData(response.data);
                            // Store in IndexedDB
                            await window.indexedDBService.storeProjectsData(processedProjects);
                        } else {
                        }
                    } finally {
                        // Clear the ongoing request promise
                        ongoingAPIRequest = null;
                    }
                })();
                await ongoingAPIRequest;
            }
        } else {
        }
        // Get filtered data from IndexedDB
        const results = await window.indexedDBService.getProjectsFromDB(filters);
        return results;
    } catch (error) {
        // Fallback to direct API call
        return await getProjectsDataDirect(filters);
    }
}
// Fallback function for direct API calls (when IndexedDB is not available)
async function getProjectsDataDirect(filters = {}) {
    try {
        // Initialize API
        const apiAvailable = await initializeZohoAPI();
        // Fetch raw data
        const response = await fetchAllProjectsData();
        if (!response.success) {
            console.warn('Projects API response unsuccessful');
        }
        // Process data
        const processedProjects = processProjectData(response.data);
        // Apply filters
        let filteredProjects = processedProjects;
        if (filters.status) {
            filteredProjects = filteredProjects.filter(p => p.status === filters.status);
        }
        if (filters.projectNumber) {
            filteredProjects = filteredProjects.filter(p => 
                p.projectNumber && p.projectNumber.includes(filters.projectNumber)
            );
        }
        if (filters.reportType) {
            filteredProjects = filteredProjects.filter(p => 
                p.reportType && p.reportType.includes(filters.reportType)
            );
        }
        if (filters.accountName) {
            filteredProjects = filteredProjects.filter(p => 
                p.accountName && p.accountName.toLowerCase().includes(filters.accountName.toLowerCase())
            );
        }
        return {
            data: filteredProjects,
            total: processedProjects.length,
            filtered: filteredProjects.length,
            success: response.success,
            mock: response.mock
        };
    } catch (error) {
        return {
            data: [],
            total: 0,
            filtered: 0,
            success: false,
            error: error.message
        };
    }
}
// Debug functions for testing
window.debugZohoAPI = function() {
    if (typeof ZOHO !== 'undefined' && ZOHO.CREATOR) {
    }
};
window.testAllProjectsAPI = async function() {
    try {
        const result = await getProjectsData();
        if (result.data.length > 0) {
            console.log(`Projects API test success: ${result.data.length} records retrieved`);
        }
    } catch (error) {
        console.error('Projects API test error:', error);
    }
};
window.testPagination = async function() {
    if (!isZohoAPIAvailable()) {
        return;
    }
    
    try {
        // Test pagination by directly calling fetchAllProjectsData
        const result = await fetchAllProjectsData();
        return result;
    } catch (error) {
        return null;
    }
};
window.testAPIConfigs = async function() {
    if (!isZohoAPIAvailable()) {
        return;
    }
    const configs = [
        { app_name: 'pemo', report_name: 'All_Projects' },
        { app_name: 'pemo', report_name: 'All_Projects', max_records: 5 },
        { app_name: 'pemo', report_name: 'All_Projects', criteria: '', max_records: 5 },
        { report_name: 'All_Projects', max_records: 5 }
    ];
    for (let i = 0; i < configs.length; i++) {
        try {
            const response = await ZOHO.CREATOR.DATA.getRecords(configs[i]);
            break;
        } catch (error) {
        }
    }
};
// Export main functions for use by other modules
window.fetchProjectsData = getProjectsData;
window.getProjectsData = getProjectsData;
// For backward compatibility with existing code
async function fetchProjectsData(filters = {}) {
    return await getProjectsData(filters);
}
// ==================== RESOURCES (CUSTOMERS) API ====================
// Make API call to fetch All_Customers data with pagination
async function fetchAllCustomersData() {
    if (!isZohoAPIAvailable()) {
        return getMockCustomersData();
    }
    let allRecords = [];
    let recordCursor = null;
    let pageNumber = 1;
    let hasMoreRecords = true;
    while (hasMoreRecords) {
        const config = {
            app_name: ZOHO_CONFIG.appName,
            report_name: ZOHO_CONFIG.customersReportName,
            max_records: 1000
        };
        if (recordCursor) {
            config.record_cursor = recordCursor;
        }
        let pageResponse = null;
        // Try DATA.getRecords first
        if (ZOHO.CREATOR.DATA?.getRecords) {
            try {
                pageResponse = await ZOHO.CREATOR.DATA.getRecords(config);
            } catch (error) {
            }
        }
        // Try PUBLISH.getRecords as fallback
        if (!pageResponse && ZOHO.CREATOR.PUBLISH?.getRecords) {
            try {
                pageResponse = await ZOHO.CREATOR.PUBLISH.getRecords(config);
            } catch (error) {
            }
        }
        if (!pageResponse) {
            break;
        }
        const processedPage = processAPIResponse(pageResponse);
        if (processedPage.data && processedPage.data.length > 0) {
            allRecords = allRecords.concat(processedPage.data);
            recordCursor = extractRecordCursor(pageResponse);
            if (recordCursor) {
                pageNumber++;
            } else {
                hasMoreRecords = false;
            }
            if (pageNumber > 50) {
                hasMoreRecords = false;
            }
        } else {
            hasMoreRecords = false;
        }
    }
    return {
        data: allRecords,
        success: allRecords.length > 0,
        mock: false,
        totalPages: pageNumber,
        totalRecords: allRecords.length
    };
}
// Mock data for testing when API is not available
function getMockCustomersData() {
    return {
        data: [
            {
                ID: "mockCustomer1",
                Employee_Number: "EMP001",
                Employe_Name: {
                    first_name: "John",
                    last_name: "Doe",
                    zc_display_value: "John Doe"
                },
                User_Role: "Project Manager",
                Employee_Type: "Full Time",
                Status: "Active",
                Personal_Email: "john.doe@example.com",
                Phone_Number: "(555) 123-4567",
                Payment_Type: "Salary",
                Latitude: "27.9506",
                Longitude: "-82.4572",
                Permanent_Address: {
                    address_line_1: "123 Main St",
                    district_city: "Tampa",
                    state_province: "FL",
                    postal_code: "33601",
                    zc_display_value: "123 Main St, Tampa, FL 33601"
                }
            },
            {
                ID: "mockCustomer2",
                Employee_Number: "EMP002",
                Employe_Name: {
                    first_name: "Jane",
                    last_name: "Smith",
                    zc_display_value: "Jane Smith"
                },
                User_Role: "Field Technician",
                Employee_Type: "Contract",
                Status: "Active",
                Personal_Email: "jane.smith@example.com",
                Phone_Number: "(555) 987-6543",
                Payment_Type: "Hourly",
                Latitude: "25.7617",
                Longitude: "-80.1918",
                Temporary_Address: {
                    address_line_1: "456 Oak Ave",
                    district_city: "Miami",
                    state_province: "FL",
                    postal_code: "33101",
                    zc_display_value: "456 Oak Ave, Miami, FL 33101"
                }
            },
            {
                ID: "mockCustomer3",
                Employee_Number: "EMP003",
                Employe_Name: {
                    first_name: "Mike",
                    last_name: "Johnson",
                    zc_display_value: "Mike Johnson"
                },
                User_Role: "Estimator",
                Employee_Type: "Full Time",
                Status: "Inactive",
                Personal_Email: "mike.johnson@example.com",
                Phone_Number: "(555) 456-7890",
                Payment_Type: "Salary",
                Latitude: "28.5383",
                Longitude: "-81.3792",
                Permanent_Address: {
                    address_line_1: "789 Pine Dr",
                    district_city: "Orlando",
                    state_province: "FL",
                    postal_code: "32801",
                    zc_display_value: "789 Pine Dr, Orlando, FL 32801"
                }
            }
        ],
        success: false,
        mock: true
    };
}
// Test function for billing API
window.testBillingAPI = async function() {
    console.log('Billing API - Starting test...');
    try {
        const result = await fetchAllBillingData();
        console.log('Billing API - Test result:', result);
        if (result.data.length > 0) {
            console.log(`Billing API - Test success: ${result.data.length} records retrieved`);
            console.log('Billing API - Sample record:', result.data[0]);
        } else {
            console.warn('Billing API - Test warning: No records retrieved');
        }
        return result;
    } catch (error) {
        console.error('Billing API - Test error:', error);
        return null;
    }
};
// Process raw customer data into structured format
function processCustomerData(rawCustomers) {
    const processedCustomers = rawCustomers.map((customer, index) => {
        // Extract coordinates from root level fields
        const rawLat = customer.Latitude;
        const rawLng = customer.Longitude;
        // Convert to numbers, set to null if empty/invalid
        const lat = (rawLat && rawLat !== '') ? Number.parseFloat(rawLat) : null;
        const lng = (rawLng && rawLng !== '') ? Number.parseFloat(rawLng) : null;
        // Build address from either permanent or temporary address
        let address = null;
        let addressString = null;
        if (customer.Permanent_Address && customer.Permanent_Address.zc_display_value) {
            addressString = customer.Permanent_Address.zc_display_value;
            address = customer.Permanent_Address;
        } else if (customer.Temporary_Address && customer.Temporary_Address.zc_display_value) {
            addressString = customer.Temporary_Address.zc_display_value;
            address = customer.Temporary_Address;
        } else if (customer.Permanent_Address) {
            address = customer.Permanent_Address;
            addressString = `${address.address_line_1 || ''}, ${address.district_city || ''}, ${address.state_province || ''} ${address.postal_code || ''}`.replace(/^,\s*|,\s*$/g, '').trim();
        } else if (customer.Temporary_Address) {
            address = customer.Temporary_Address;
            addressString = `${address.address_line_1 || ''}, ${address.district_city || ''}, ${address.state_province || ''} ${address.postal_code || ''}`.replace(/^,\s*|,\s*$/g, '').trim();
        }
        const processedCustomer = {
            id: customer.ID,
            employeeId: customer.Employee_Number || customer.ID,
            firstName: customer.Employe_Name?.first_name || '',
            lastName: customer.Employe_Name?.last_name || '',
            fullName: customer.Employe_Name?.zc_display_value || `${customer.Employe_Name?.first_name || ''} ${customer.Employe_Name?.last_name || ''}`.trim(),
            role: customer.User_Role,
            employeeType: customer.Employee_Type,
            status: customer.Status,
            personalEmail: customer.Personal_Email,
            phoneNumber: customer.Phone_Number,
            paymentType: customer.Payment_Type,
            dateOfBirth: customer.Date_of_Birth,
            address: addressString,
            addressData: address,
            lat: lat,
            lng: lng,
            lastUpdated: Date.now()
        };
        return processedCustomer;
    });
    // Log coordinate statistics
    const withCoords = processedCustomers.filter(c => c.lat !== null && c.lng !== null);
    const withoutCoords = processedCustomers.length - withCoords.length;
    return processedCustomers;
}
// Main function to get customers data with IndexedDB integration
async function getCustomersData(filters = {}) {
    try {
        // Check if IndexedDB service is available
        if (!window.indexedDBService) {
            return await getCustomersDataDirect(filters);
        }
        // Check if we need to sync data from API
        const needsSync = await window.indexedDBService.needsSync('resources');
        if (needsSync) {
            // Check if an API request is already in progress
            if (ongoingResourcesAPIRequest) {
                await ongoingResourcesAPIRequest;
            } else {
                // Start API request and store promise to prevent duplicates
                ongoingResourcesAPIRequest = (async () => {
                    try {
                        // Fetch fresh data from API
                        const response = await fetchAllCustomersData();
                        if (response.success && response.data.length > 0) {
                            // Process the data
                            const processedCustomers = processCustomerData(response.data);
                            // Store in IndexedDB
                            await window.indexedDBService.storeResourcesData(processedCustomers);
                        } else {
                        }
                    } finally {
                        // Clear the ongoing request promise
                        ongoingResourcesAPIRequest = null;
                    }
                })();
                await ongoingResourcesAPIRequest;
            }
        } else {
        }
        // Get filtered data from IndexedDB
        return await window.indexedDBService.getResourcesFromDB(filters);
    } catch (error) {
        // Fallback to direct API call
        return await getCustomersDataDirect(filters);
    }
}
// Fallback function for direct API calls (when IndexedDB is not available)
async function getCustomersDataDirect(filters = {}) {
    try {
        // Initialize API
        const apiAvailable = await initializeZohoAPI();
        // Fetch raw data
        const response = await fetchAllCustomersData();
        if (!response.success) {
            console.warn('Customers API response unsuccessful');
        }
        // Process data
        const processedCustomers = processCustomerData(response.data);
        // Apply filters
        let filteredCustomers = processedCustomers;
        if (filters.role) {
            filteredCustomers = filteredCustomers.filter(c => c.role === filters.role);
        }
        if (filters.status) {
            filteredCustomers = filteredCustomers.filter(c => c.status === filters.status);
        }
        if (filters.employeeType) {
            filteredCustomers = filteredCustomers.filter(c => c.employeeType === filters.employeeType);
        }
        if (filters.name) {
            const searchTerm = filters.name.toLowerCase();
            filteredCustomers = filteredCustomers.filter(c => 
                c.fullName.toLowerCase().includes(searchTerm)
            );
        }
        const result = {
            data: filteredCustomers,
            total: processedCustomers.length,
            filtered: filteredCustomers.length,
            success: response.success,
            mock: response.mock
        };
        return result;
    } catch (error) {
        return {
            data: [],
            total: 0,
            filtered: 0,
            success: false,
            error: error.message
        };
    }
}
// Export resources/customers functions
window.fetchResourcesData = getCustomersData;
window.getResourcesData = getCustomersData;
window.fetchCustomersData = getCustomersData;
window.getCustomersData = getCustomersData;
// Test function for resources/customers API
window.testCustomersAPI = async function() {
    try {
        const result = await getCustomersData();
        if (result.data.length > 0) {
            console.log(`Customers API test success: ${result.data.length} records retrieved`);
        }
    } catch (error) {
        console.error('Customers API test error:', error);
    }
};
// Test the resources API call with IndexedDB integration
window.testResourcesAPICall = async function() {
    try {
        const result = await getResourcesData();
        if (result.data && result.data.length > 0) {
            // Check if any resources have coordinates
            const withCoords = result.data.filter(r => r.lat !== null && r.lng !== null && !isNaN(r.lat) && !isNaN(r.lng));
            if (withCoords.length > 0) {
                console.log(`Resources API test success: ${withCoords.length} resources with coordinates`);
            }
        }
        // Test IndexedDB stats
        if (window.indexedDBService) {
            const stats = await window.indexedDBService.getDBStats();
            console.log('IndexedDB stats:', stats);
        }
        return result;
    } catch (error) {
        return null;
    }
};
// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Auto-test resources API after a short delay
    setTimeout(() => {
        testResourcesAPICall();
    }, 2000);
});
// ==================== BILLING LOCATIONS API ====================
// Make API call to fetch All_Billing_Locations data with pagination
async function fetchAllBillingData() {
    if (!isZohoAPIAvailable()) {
        return getMockBillingData();
    }
    let allRecords = [];
    let recordCursor = null;
    let pageNumber = 1;
    let hasMoreRecords = true;
    while (hasMoreRecords) {
        const config = {
            app_name: ZOHO_CONFIG.appName,
            report_name: ZOHO_CONFIG.billingReportName,
            max_records: 1000
        };
        if (recordCursor) {
            config.record_cursor = recordCursor;
        }
        console.log(`Billing API - Fetching page ${pageNumber} with config:`, config);
        let pageResponse = null;
        // Try DATA.getRecords first
        if (ZOHO.CREATOR.DATA?.getRecords) {
            try {
                pageResponse = await ZOHO.CREATOR.DATA.getRecords(config);
            } catch (error) {
            }
        }
        // Try PUBLISH.getRecords as fallback
        if (!pageResponse && ZOHO.CREATOR.PUBLISH?.getRecords) {
            try {
                pageResponse = await ZOHO.CREATOR.PUBLISH.getRecords(config);
            } catch (error) {
            }
        }
        if (!pageResponse) {
            break;
        }
        const processedPage = processAPIResponse(pageResponse);
        if (processedPage.data && processedPage.data.length > 0) {
            allRecords = allRecords.concat(processedPage.data);
            recordCursor = extractRecordCursor(pageResponse);
            if (recordCursor) {
                pageNumber++;
            } else {
                hasMoreRecords = false;
            }
            if (pageNumber > 50) {
                hasMoreRecords = false;
            }
        } else {
            hasMoreRecords = false;
        }
    }
    return {
        data: allRecords,
        success: allRecords.length > 0,
        mock: false,
        totalPages: pageNumber,
        totalRecords: allRecords.length
    };
}
// Mock data for testing when API is not available
function getMockBillingData() {
    return {
        data: [
            {
                ID: "mockBilling1",
                Code_ID: "BL001",
                Status: "Active",
                Population: "50000",
                Address: {
                    zc_display_value: "100 Billing Plaza, Tampa, FL 33602",
                    latitude: "27.9478",
                    longitude: "-82.4584"
                }
            },
            {
                ID: "mockBilling2",
                Code_ID: "BL002",
                Status: "Active",
                Population: "75000",
                Address: {
                    zc_display_value: "200 Payment Street, Miami, FL 33131",
                    latitude: "25.7617",
                    longitude: "-80.1918"
                }
            },
            {
                ID: "mockBilling3",
                Code_ID: "BL003",
                Status: "Inactive",
                Population: "30000",
                Address: {
                    zc_display_value: "300 Invoice Lane, Orlando, FL 32803",
                    latitude: "28.5383",
                    longitude: "-81.3792"
                }
            }
        ],
        success: false,
        mock: true
    };
}
// Process raw billing data into structured format
function processBillingData(rawBilling) {
    console.log('Billing API - Processing billing data:', rawBilling.length, 'records');
    const processedBilling = rawBilling.map((billing, index) => {
        // Extract coordinates - prefer root level, fallback to Address object
        const rawLat = billing.Latitude || billing.Address?.latitude;
        const rawLng = billing.Longitude || billing.Address?.longitude;
        // Convert to numbers, set to null if empty/invalid
        const lat = (rawLat && rawLat !== '') ? Number.parseFloat(rawLat) : null;
        const lng = (rawLng && rawLng !== '') ? Number.parseFloat(rawLng) : null;
        // Debug logging for first few records
        if (index < 3) {
            console.log(`Billing API - Record ${index}:`, {
                codeId: billing.Code_ID,
                address: billing.Address?.zc_display_value,
                coordinates: { lat, lng },
                status: billing.Status
            });
        }
        return {
            id: billing.ID,
            codeId: billing.Code_ID,
            status: billing.Status,
            population: billing.Population,
            address: billing.Address?.zc_display_value || '',
            lat: lat,
            lng: lng,
            lastUpdated: Date.now()
        };
    });
    // Log coordinate statistics
    const withCoords = processedBilling.filter(b => b.lat !== null && b.lng !== null);
    const withoutCoords = processedBilling.length - withCoords.length;
    console.log(`Billing API - Coordinate stats: ${withCoords.length} with coords, ${withoutCoords} without coords`);
    return processedBilling;
}
// Main function to get billing data with IndexedDB integration
async function getBillingData(filters = {}) {
    try {
        // Check if IndexedDB service is available
        if (!window.indexedDBService) {
            return await getBillingDataDirect(filters);
        }
        // Check if we need to sync data from API
        const needsSync = await window.indexedDBService.needsSync('billing');
        if (needsSync) {
            // Check if an API request is already in progress
            if (ongoingBillingAPIRequest) {
                await ongoingBillingAPIRequest;
            } else {
                // Start API request and store promise to prevent duplicates
                ongoingBillingAPIRequest = (async () => {
                    try {
                        // Fetch fresh data from API
                        const response = await fetchAllBillingData();
                        if (response.success && response.data.length > 0) {
                            // Process the data
                            const processedBilling = processBillingData(response.data);
                            // Store in IndexedDB
                            await window.indexedDBService.storeBillingData(processedBilling);
                        } else {
                            console.warn('Billing API - No data received from API');
                        }
                    } finally {
                        // Clear the ongoing request promise
                        ongoingBillingAPIRequest = null;
                    }
                })();
                await ongoingBillingAPIRequest;
            }
        } else {
        }
        // Get filtered data from IndexedDB
        return await window.indexedDBService.getBillingFromDB(filters);
    } catch (error) {
        console.error('Billing API - Error in getBillingData:', error);
        // Fallback to direct API call
        return await getBillingDataDirect(filters);
    }
}
// Fallback function for direct API calls (when IndexedDB is not available)
async function getBillingDataDirect(filters = {}) {
    try {
        // Initialize API
        const apiAvailable = await initializeZohoAPI();
        // Fetch raw data
        const response = await fetchAllBillingData();
        if (!response.success) {
            console.warn('Billing API - Direct fetch unsuccessful');
        }
        // Process data
        const processedBilling = processBillingData(response.data);
        // Apply filters
        let filteredBilling = processedBilling;
        if (filters.status) {
            filteredBilling = filteredBilling.filter(b => b.status === filters.status);
        }
        if (filters.codeId) {
            filteredBilling = filteredBilling.filter(b => 
                b.codeId && b.codeId.includes(filters.codeId)
            );
        }
        const result = {
            data: filteredBilling,
            total: processedBilling.length,
            filtered: filteredBilling.length,
            success: response.success,
            mock: response.mock
        };
        return result;
    } catch (error) {
        console.error('Billing API - Error in getBillingDataDirect:', error);
        return {
            data: [],
            total: 0,
            filtered: 0,
            success: false,
            error: error.message
        };
    }
}
// Test function for billing API
window.testBillingAPI = async function() {
    console.log('Billing API - Starting test...');
    try {
        const result = await fetchAllBillingData();
        console.log('Billing API - Test result:', result);
        if (result.data.length > 0) {
            console.log(`Billing API - Test success: ${result.data.length} records retrieved`);
            console.log('Billing API - Sample record:', result.data[0]);
        } else {
            console.warn('Billing API - Test warning: No records retrieved');
        }
        return result;
    } catch (error) {
        console.error('Billing API - Test error:', error);
        return null;
    }
};
// Export billing functions
window.fetchBillingData = getBillingData;
window.getBillingData = getBillingData;
