// Simplified Zoho Creator API Service - Functional Approach
// Focused only on All_Projects API calls

// Global configuration
const ZOHO_CONFIG = {
    appName: 'pemo',
    projectsReportName: 'All_Projects'
};

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

// Make API call to fetch All_Projects data
async function fetchAllProjectsData(page = 1, pageSize = 200) {
    console.log(`🔄 Fetching All_Projects data (page: ${page}, pageSize: ${pageSize})`);
    
    if (!isZohoAPIAvailable()) {
        console.log('❌ Zoho API not available, returning mock data');
        return getMockProjectsData();
    }
    
    // Try different configuration approaches based on official Zoho Creator v2 API docs
    const configs = [
        // Config 1: Minimal config (recommended)
        {
            app_name: ZOHO_CONFIG.appName,
            report_name: ZOHO_CONFIG.projectsReportName
        },
        // Config 2: With max_records
        {
            app_name: ZOHO_CONFIG.appName,
            report_name: ZOHO_CONFIG.projectsReportName,
            max_records: parseInt(pageSize)
        },
        // Config 3: With criteria and max_records
        {
            app_name: ZOHO_CONFIG.appName,
            report_name: ZOHO_CONFIG.projectsReportName,
            criteria: '',
            max_records: parseInt(pageSize)
        },
        // Config 4: Without app_name (uses current app)
        {
            report_name: ZOHO_CONFIG.projectsReportName,
            max_records: parseInt(pageSize)
        },
        // Config 5: With field_config
        {
            app_name: ZOHO_CONFIG.appName,
            report_name: ZOHO_CONFIG.projectsReportName,
            field_config: 'all',
            max_records: parseInt(pageSize)
        }
    ];
    
    // Try DATA.getRecords first
    if (ZOHO.CREATOR.DATA?.getRecords) {
        for (let i = 0; i < configs.length; i++) {
            try {
                console.log(`📤 ZOHO.CREATOR.DATA.getRecords attempt ${i + 1}:`, configs[i]);
                const response = await ZOHO.CREATOR.DATA.getRecords(configs[i]);
                console.log(`✅ Config ${i + 1} worked! Response:`, response);
                
                return processAPIResponse(response);
                
            } catch (error) {
                console.log(`❌ Config ${i + 1} failed:`, JSON.stringify(error, null, 2));
            }
        }
    }
    
    // Try PUBLISH.getRecords as fallback
    if (ZOHO.CREATOR.PUBLISH?.getRecords) {
        for (let i = 0; i < configs.length; i++) {
            try {
                console.log(`📤 ZOHO.CREATOR.PUBLISH.getRecords attempt ${i + 1}:`, configs[i]);
                const response = await ZOHO.CREATOR.PUBLISH.getRecords(configs[i]);
                console.log(`✅ PUBLISH Config ${i + 1} worked! Response:`, response);
                
                return processAPIResponse(response);
                
            } catch (error) {
                console.log(`❌ PUBLISH Config ${i + 1} failed:`, JSON.stringify(error, null, 2));
            }
        }
    }
    
    console.log('❌ All API attempts failed, returning mock data');
    return getMockProjectsData();
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
    
    return rawProjects.map(project => ({
        id: project.ID,
        projectNumber: project.Project_Number,
        projectName: project.Project_Name,
        address: project.Loss_Location_Street_Address,
        accountName: project.Account_Name,
        claimNumber: project.Claim_Number,
        insurer: project.Insurer,
        reportType: project.Type_of_Report,
        status: project["PS_5.Completion_Status"] || 'Unknown',
        completed: project.Project_Completed === 'true',
        contactName: project.Contact_Name,
        dateOfLoss: project.Date_of_Loss,
        rawData: project
    }));
}

// Main function to fetch and process projects
async function getProjectsData(filters = {}) {
    console.log('🏗️ Getting projects data with filters:', filters);
    
    try {
        // Initialize API
        const apiAvailable = await initializeZohoAPI();
        
        // Fetch raw data
        const response = await fetchAllProjectsData(1, 200);
        
        if (!response.success) {
            console.log('⚠️ API call was not successful');
        }
        
        // Process data
        const processedProjects = processProjectData(response.data);
        
        // Apply filters if any
        let filteredProjects = processedProjects;
        if (filters.status) {
            filteredProjects = filteredProjects.filter(p => p.status === filters.status);
        }
        if (filters.projectNumber) {
            filteredProjects = filteredProjects.filter(p => 
                p.projectNumber && p.projectNumber.includes(filters.projectNumber)
            );
        }
        
        console.log(`✅ Returning ${filteredProjects.length} filtered projects from ${processedProjects.length} total`);
        
        return {
            data: filteredProjects,
            total: processedProjects.length,
            filtered: filteredProjects.length,
            success: response.success,
            mock: response.mock
        };
        
    } catch (error) {
        console.error('❌ Error getting projects data:', error);
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