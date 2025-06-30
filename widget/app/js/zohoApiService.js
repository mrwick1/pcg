// Simplified Zoho Creator API Service - Functional Approach
// Focused only on All_Projects API calls

// Global configuration
const ZOHO_CONFIG = {
    appName: 'pemo',
    projectsReportName: 'All_Projects'
};

// Request deduplication to prevent multiple simultaneous API calls
let ongoingAPIRequest = null;

// Check if Zoho Creator API is available
function isZohoAPIAvailable() {
    return typeof ZOHO !== 'undefined' && 
           ZOHO.CREATOR && 
           (ZOHO.CREATOR.DATA?.getRecords || ZOHO.CREATOR.PUBLISH?.getRecords);
}

// Initialize and test Zoho API
async function initializeZohoAPI() {
    console.log('🔍 === ZOHO API INITIALIZATION ===');
    
    if (!isZohoAPIAvailable()) {
        console.log('❌ ZOHO API not available');
        return false;
    }
    
    console.log('✅ ZOHO object available:', ZOHO);
    console.log('📋 ZOHO.CREATOR methods:', Object.keys(ZOHO.CREATOR));
    
    // Test API methods
    if (ZOHO.CREATOR.DATA?.getRecords) {
        console.log('✅ ZOHO.CREATOR.DATA.getRecords available');
        return true;
    } else if (ZOHO.CREATOR.PUBLISH?.getRecords) {
        console.log('✅ ZOHO.CREATOR.PUBLISH.getRecords available');
        return true;
    }
    
    console.log('❌ No suitable API methods found');
    return false;
}

// Make API call to fetch All_Projects data with pagination
async function fetchAllProjectsData() {
    console.log('🔄 Fetching All_Projects data with pagination (max_records: 1000 per page)');
    
    if (!isZohoAPIAvailable()) {
        console.log('❌ Zoho API not available, returning mock data');
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
        
        console.log(`📤 Fetching page ${pageNumber} with config:`, config);
        
        let pageResponse = null;
        
        // Try DATA.getRecords first
        if (ZOHO.CREATOR.DATA?.getRecords) {
            try {
                pageResponse = await ZOHO.CREATOR.DATA.getRecords(config);
                console.log(`✅ Page ${pageNumber} DATA.getRecords successful`);
            } catch (error) {
                console.log(`❌ Page ${pageNumber} DATA.getRecords failed:`, JSON.stringify(error, null, 2));
            }
        }
        
        // Try PUBLISH.getRecords as fallback
        if (!pageResponse && ZOHO.CREATOR.PUBLISH?.getRecords) {
            try {
                pageResponse = await ZOHO.CREATOR.PUBLISH.getRecords(config);
                console.log(`✅ Page ${pageNumber} PUBLISH.getRecords successful`);
            } catch (error) {
                console.log(`❌ Page ${pageNumber} PUBLISH.getRecords failed:`, JSON.stringify(error, null, 2));
            }
        }
        
        if (!pageResponse) {
            console.log(`❌ Page ${pageNumber} failed, stopping pagination`);
            break;
        }
        
        // Process this page's response
        const processedPage = processAPIResponse(pageResponse);
        
        if (processedPage.data && processedPage.data.length > 0) {
            allRecords = allRecords.concat(processedPage.data);
            console.log(`📄 Page ${pageNumber}: Added ${processedPage.data.length} records (total: ${allRecords.length})`);
            
            // Check for pagination cursor in response
            recordCursor = extractRecordCursor(pageResponse);
            
            if (recordCursor) {
                console.log(`🔄 Found record_cursor for next page: ${recordCursor}`);
                pageNumber++;
            } else {
                console.log('🏁 No more pages available');
                hasMoreRecords = false;
            }
            
            // Safety check to prevent infinite loops
            if (pageNumber > 50) {
                console.log('⚠️ Reached maximum page limit (50), stopping pagination');
                hasMoreRecords = false;
            }
        } else {
            console.log(`📄 Page ${pageNumber}: No records returned, stopping pagination`);
            hasMoreRecords = false;
        }
    }
    
    console.log(`✅ Pagination complete! Retrieved ${allRecords.length} total records across ${pageNumber} pages`);
    
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
        console.log(`✅ Got ${response.data.length} records from API`);
        return { data: response.data, success: true };
    } else if (response && Array.isArray(response)) {
        console.log(`✅ Got ${response.length} records from API (direct array)`);
        return { data: response, success: true };
    } else if (response && response.result && Array.isArray(response.result)) {
        console.log(`✅ Got ${response.result.length} records from result field`);
        return { data: response.result, success: true };
    } else {
        console.log('⚠️ Unexpected API response format:', response);
        return { data: [], success: false };
    }
}

// Mock data for testing when API is not available
function getMockProjectsData() {
    console.log('📋 Returning mock projects data');
    return {
        data: [
            {
                ID: "mock1",
                Project_Number: "06132",
                Project_Name: "Vernon Test Project",
                Loss_Location_Street_Address: "12910 Parsons Road Tampa, FL 33635",
                Account_Name: "Test Client LLC",
                Claim_Number: "HO0525434936",
                Insurer: "Test Insurance Company",
                Type_of_Report: "(20-04) Long-form Report (default)",
                "PS_5.Completion_Status": "In Progress",
                Project_Completed: "false",
                Contact_Name: "John Doe",
                Date_of_Loss: "Jun 12,2025"
            },
            {
                ID: "mock2", 
                Project_Number: "06133",
                Project_Name: "Sample Project 2",
                Loss_Location_Street_Address: "123 Main St, Miami, FL 33101",
                Account_Name: "Another Client Inc",
                Claim_Number: "HO0525434937",
                Insurer: "Sample Insurance Co",
                Type_of_Report: "(20-04) Long-form Report (default)",
                "PS_5.Completion_Status": "Completed",
                Project_Completed: "true",
                Contact_Name: "Jane Smith",
                Date_of_Loss: "May 15,2025"
            }
        ],
        success: false,
        mock: true
    };
}

// Process raw project data into structured format
function processProjectData(rawProjects) {
    console.log(`📊 Processing ${rawProjects.length} projects`);
    
    const processedProjects = rawProjects.map((project, index) => {
        // Extract and validate coordinates
        const rawLat = project.Latitude;
        const rawLng = project.Longitude;
        
        // Convert to numbers, set to null if empty/invalid
        const lat = (rawLat && rawLat !== '') ? Number.parseFloat(rawLat) : null;
        const lng = (rawLng && rawLng !== '') ? Number.parseFloat(rawLng) : null;
        
        // Debug: Log first few projects to see mapping
        if (index < 3) {
            console.log('🔍 DEBUG: Raw project data:', project);
            console.log('🔍 DEBUG: Mapped project name:', project.Project_Name);
            console.log('🔍 DEBUG: Mapped project number:', project.Project_Number);
        }
        
        return {
            id: project.ID,
            projectNumber: project.Project_Number,
            projectName: project.Project_Name,
            projectType: project.Type_of_Report,
            accountName: project.Account_Name,
            claimNumber: project.Claim_Number,
            contactName: project.Contact_Name,
            address: project.Loss_Location_Street_Address,
            status: project["PS_5.Completion_Status"] || 'Unknown',
            dateOfLoss: project.Date_of_Loss,
            insurer: project.Insurer,
            policyNumber: project.Policy_Number,
            completed: project.Project_Completed === 'true',
            lat: lat,
            lng: lng,
            lastUpdated: Date.now()
        };
    });
    
    // Log coordinate statistics
    const withCoords = processedProjects.filter(p => p.lat !== null && p.lng !== null);
    const withoutCoords = processedProjects.length - withCoords.length;
    console.log(`🗺️  Projects with coordinates: ${withCoords.length}`);
    console.log(`❌ Projects without coordinates: ${withoutCoords}`);
    
    return processedProjects;
}

// Main function to get projects data with IndexedDB integration
async function getProjectsData(filters = {}) {
    console.log('🏗️ Getting projects data with filters:', filters);
    
    try {
        // Check if IndexedDB service is available
        if (!window.indexedDBService) {
            console.log('⚠️ IndexedDB service not available, falling back to direct API');
            return await getProjectsDataDirect(filters);
        }
        
        // Check if we need to sync data from API
        const needsSync = await window.indexedDBService.needsSync('projects');
        
        if (needsSync) {
            // Check if an API request is already in progress
            if (ongoingAPIRequest) {
                console.log('⏳ API request already in progress, waiting for completion...');
                await ongoingAPIRequest;
            } else {
                console.log('🔄 Data needs sync, fetching from API and storing in IndexedDB...');
                
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
                            console.log('✅ Fresh data stored in IndexedDB');
                        } else {
                            console.log('⚠️ API sync failed, using existing IndexedDB data if available');
                        }
                    } finally {
                        // Clear the ongoing request promise
                        ongoingAPIRequest = null;
                    }
                })();
                
                await ongoingAPIRequest;
            }
        } else {
            console.log('💾 Using IndexedDB data (up to date)');
        }
        
        // Get filtered data from IndexedDB
        return await window.indexedDBService.getProjectsFromDB(filters);
        
    } catch (error) {
        console.error('❌ Error getting projects data:', error);
        
        // Fallback to direct API call
        console.log('🔄 Falling back to direct API call...');
        return await getProjectsDataDirect(filters);
    }
}

// Fallback function for direct API calls (when IndexedDB is not available)
async function getProjectsDataDirect(filters = {}) {
    console.log('🔄 Getting projects data directly from API with filters:', filters);
    
    try {
        // Initialize API
        const apiAvailable = await initializeZohoAPI();
        
        // Fetch raw data
        const response = await fetchAllProjectsData();
        
        if (!response.success) {
            console.log('⚠️ API call was not successful');
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
        
        console.log(`✅ Returning ${filteredProjects.length} filtered projects from ${processedProjects.length} total (direct API)`);
        
        return {
            data: filteredProjects,
            total: processedProjects.length,
            filtered: filteredProjects.length,
            success: response.success,
            mock: response.mock
        };
        
    } catch (error) {
        console.error('❌ Error getting projects data directly:', error);
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
    console.log('🔍 === ZOHO API DEBUG ===');
    console.log('ZOHO available:', typeof ZOHO !== 'undefined');
    
    if (typeof ZOHO !== 'undefined' && ZOHO.CREATOR) {
        console.log('ZOHO.CREATOR methods:', Object.keys(ZOHO.CREATOR));
        console.log('DATA.getRecords available:', !!ZOHO.CREATOR.DATA?.getRecords);
        console.log('PUBLISH.getRecords available:', !!ZOHO.CREATOR.PUBLISH?.getRecords);
        console.log('META.getReports available:', !!ZOHO.CREATOR.META?.getReports);
    }
    
    console.log('📊 IndexedDB storage now used instead of cache');
    console.log('🔍 === DEBUG COMPLETE ===');
};

window.testAllProjectsAPI = async function() {
    console.log('🧪 === TESTING ALL_PROJECTS API ===');
    
    try {
        const result = await getProjectsData();
        console.log('✅ Test result:', result);
        
        if (result.data.length > 0) {
            console.log(`📊 Got ${result.data.length} projects`);
            console.log('📋 First project:', result.data[0]);
        }
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
    
    console.log('🧪 === TEST COMPLETE ===');
};

window.testPagination = async function() {
    console.log('🧪 === TESTING PAGINATION ===');
    
    if (!isZohoAPIAvailable()) {
        console.log('❌ Zoho API not available');
        return;
    }
    
    try {
        // Test pagination by directly calling fetchAllProjectsData
        console.log('🔄 Starting pagination test...');
        const result = await fetchAllProjectsData();
        
        console.log('✅ Pagination test complete!');
        console.log(`📊 Results: ${result.totalRecords} records across ${result.totalPages} pages`);
        console.log(`📄 First few records:`, result.data.slice(0, 3));
        
        return result;
        
    } catch (error) {
        console.error('❌ Pagination test failed:', error);
        return null;
    }
    
    console.log('🧪 === PAGINATION TEST COMPLETE ===');
};

window.testAPIConfigs = async function() {
    console.log('🧪 === TESTING API CONFIGS DIRECTLY ===');
    
    if (!isZohoAPIAvailable()) {
        console.log('❌ Zoho API not available');
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
            console.log(`🔧 Testing config ${i + 1}:`, configs[i]);
            const response = await ZOHO.CREATOR.DATA.getRecords(configs[i]);
            console.log(`✅ Config ${i + 1} SUCCESS:`, response);
            break;
        } catch (error) {
            console.log(`❌ Config ${i + 1} failed:`, JSON.stringify(error, null, 2));
        }
    }
    
    console.log('🧪 === CONFIG TEST COMPLETE ===');
};

// Export main functions for use by other modules
window.fetchProjectsData = getProjectsData;
window.getProjectsData = getProjectsData;

// For backward compatibility with existing code
async function fetchProjectsData(filters = {}) {
    return await getProjectsData(filters);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Zoho API Service loaded (functional version)');
});