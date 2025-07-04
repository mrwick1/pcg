# zohoApiService.js Documentation

## Overview
Comprehensive Zoho Creator API service providing data integration for PCG application. Implements functional approach with pagination support, IndexedDB caching, mock data fallbacks, and comprehensive API coverage for projects, customer/resources, and billing location data.

## Global Configuration
```javascript
const ZOHO_CONFIG = {
    appName: 'pemo',
    projectsReportName: 'All_Projects',
    customersReportName: 'All_Customers',
    billingReportName: 'All_Billing_Locations'
};
```

## API Availability Management

### isZohoAPIAvailable()
Detects Zoho Creator API availability in current environment.

**Detection Logic:**
- Checks for `ZOHO` global object existence
- Validates `ZOHO.CREATOR` availability
- Confirms either `DATA.getRecords` or `PUBLISH.getRecords` method availability

### initializeZohoAPI()
Comprehensive API initialization with testing and validation.

**Features:**
- API availability verification
- Method enumeration for debugging
- Service capability testing
- Detailed console logging for troubleshooting

## Request Deduplication System
```javascript
let ongoingAPIRequest = null;           // Projects API request tracking
let ongoingResourcesAPIRequest = null;  // Resources API request tracking
let ongoingBillingAPIRequest = null;    // Billing API request tracking
```

Prevents multiple simultaneous API calls to the same endpoint, ensuring efficient resource usage and avoiding race conditions.

## Projects Data API

### fetchAllProjectsData()
Advanced pagination-enabled data fetching for All_Projects report.

**Pagination Strategy:**
- 1000 records per page for optimal performance
- Automatic cursor-based pagination
- Multi-page aggregation with progress tracking
- 50-page safety limit to prevent infinite loops

**API Method Fallback:**
1. **Primary**: `ZOHO.CREATOR.DATA.getRecords(config)`
2. **Fallback**: `ZOHO.CREATOR.PUBLISH.getRecords(config)`
3. **Development**: Mock data when API unavailable

**Configuration Object:**
```javascript
{
    app_name: 'pemo',
    report_name: 'All_Projects',
    max_records: 1000,
    record_cursor: cursor  // For pagination
}
```

### extractRecordCursor(response)
Intelligent cursor extraction supporting multiple Zoho API response formats.

**Supported Cursor Fields:**
- `response.record_cursor`
- `response.cursor`
- `response.next_cursor`
- `response.pagination.cursor`
- `response.pagination.record_cursor`

### determineProjectStatus(project)
Calculates project status based on business logic conditions requiring location validation.

**Status Calculation Logic:**
All project statuses require valid location data (address, latitude, longitude not empty).

1. **Completed**: Project_Completed = true + valid location
2. **Cancelled**: PS_5.Project_Cancelled = true + PS_5.Project_Cancelled_Date not empty + valid location
3. **Suspended**: PS_5.Project_Suspended not empty + transmitted empty + released empty + valid location
4. **Archived**: PS_5.Transmitted_Report_and_Invoice_to_the_Client not empty + not cancelled + valid location
5. **Live**: All PS_5 fields empty/false + valid location
6. **Unknown**: Fallback when no conditions match

### processProjectData(rawProjects)
Transforms raw Zoho Creator data into standardized application format with calculated status.

**Field Mapping:**
```javascript
{
    id: project.ID,
    projectNumber: project.Project_Number,
    projectName: project.Project_Name,
    projectType: project.Type_of_Report,
    accountName: project.Account_Name,
    claimNumber: project.Claim_Number,
    contactName: project.Contact_Name,
    address: project.Loss_Location_Street_Address,
    status: determineProjectStatus(project), // Calculated based on business logic
    dateOfLoss: project.Date_of_Loss,
    insurer: project.Insurer,
    policyNumber: project.Policy_Number,
    completed: project.Project_Completed === 'true',
    lat: parseFloat(project.Latitude),
    lng: parseFloat(project.Longitude),
    lastUpdated: Date.now(),
    ps5Data: {
        transmittedToClient: project["PS_5.Transmitted_Report_and_Invoice_to_the_Client"],
        projectCancelled: project["PS_5.Project_Cancelled"],
        projectCancelledDate: project["PS_5.Project_Cancelled_Date"],
        projectSuspended: project["PS_5.Project_Suspended"],
        suspendedReleasedOn: project["PS_5.Suspended_Projects_Released_On"]
    }
}
```

**Coordinate Processing:**
- Validates and converts latitude/longitude to numbers
- Sets null values for empty or invalid coordinates
- Provides statistics on coordinate availability

### getProjectsData(filters = {})
Main projects data retrieval function with IndexedDB integration.

**Workflow:**
1. **Sync Check**: Determines if fresh data needed via `indexedDBService.needsSync('projects')`
2. **Deduplication**: Prevents multiple simultaneous API requests
3. **API Fetch**: Retrieves fresh data when needed
4. **Storage**: Stores processed data in IndexedDB
5. **Retrieval**: Returns filtered data from local storage

**Fallback Strategy:**
- Falls back to `getProjectsDataDirect()` if IndexedDB unavailable
- Comprehensive error handling with graceful degradation

## Resources/Customers Data API

### fetchAllCustomersData()
Pagination-enabled data fetching for All_Customers report.

**Similar Architecture to Projects:**
- 1000 records per page
- Cursor-based pagination
- Multi-API method support
- Mock data fallback

### processCustomerData(rawCustomers)
Transforms raw customer data into application-ready format.

**Field Mapping:**
```javascript
{
    id: customer.ID,
    employeeId: customer.Employee_Number || customer.ID,
    firstName: customer.Employe_Name?.first_name,
    lastName: customer.Employe_Name?.last_name,
    fullName: customer.Employe_Name?.zc_display_value,
    role: customer.User_Role,
    employeeType: customer.Employee_Type,
    status: customer.Status,
    personalEmail: customer.Personal_Email,
    phoneNumber: customer.Phone_Number,
    paymentType: customer.Payment_Type,
    dateOfBirth: customer.Date_of_Birth,
    address: extractedAddressString,
    addressData: addressObject,
    lat: parseFloat(customer.Latitude),
    lng: parseFloat(customer.Longitude),
    lastUpdated: Date.now()
}
```

**Address Processing:**
Complex address extraction supporting multiple Zoho address formats:
- `Permanent_Address.zc_display_value`
- `Temporary_Address.zc_display_value`
- Manual concatenation from address components
- Preference: Permanent → Temporary → Constructed

### getCustomersData(filters = {})
Main customers data retrieval with IndexedDB integration.

**Identical Pattern to Projects:**
- Sync checking and deduplication
- API fetching with storage
- Filtered retrieval from IndexedDB
- Comprehensive error handling

## Billing Locations Data API

### fetchAllBillingData()
Pagination-enabled data fetching for All_Billing_Locations report.

**Similar Architecture to Projects:**
- 1000 records per page
- Cursor-based pagination
- Multi-API method support
- Mock data fallback

### processBillingData(rawBilling)
Transforms raw billing location data into application-ready format.

**Field Mapping:**
```javascript
{
    id: billing.ID,
    codeId: billing.Code_ID,
    status: billing.Status,
    population: billing.Population,
    address: billing.Address?.zc_display_value || '',
    lat: parseFloat(billing.Latitude || billing.Address?.latitude),
    lng: parseFloat(billing.Longitude || billing.Address?.longitude),
    lastUpdated: Date.now()
}
```

**Coordinate Processing:**
- Supports both root-level coordinates and Address object coordinates
- Validates and converts to numbers with null fallback
- Comprehensive coordinate statistics logging

### getBillingData(filters = {})
Main billing data retrieval with IndexedDB integration.

**Identical Pattern to Projects and Resources:**
- Sync checking and deduplication
- API fetching with storage
- Filtered retrieval from IndexedDB
- Comprehensive error handling

## Mock Data System

### getMockProjectsData()
Comprehensive mock data for development and testing.

**Mock Data Features:**
- 6 sample projects covering all status types
- Realistic project numbers, names, and addresses with coordinates
- Complete field coverage for testing including PS_5 data
- Status variety: Completed, Live, Archived, Cancelled, Suspended
- All mock data includes valid location data (address, latitude, longitude)

### getMockCustomersData()
Mock customer/resource data for development.

**Mock Features:**
- Employee data with name structures
- Address variations (permanent/temporary)
- Role and employment type diversity
- Status variety for comprehensive testing

### getMockBillingData()
Mock billing location data for development.

**Mock Features:**
- Billing location codes and status variety
- Population data for different areas
- Address structures with embedded coordinates
- Active/Inactive status for comprehensive testing

## Response Processing

### processAPIResponse(response)
Universal API response processor supporting multiple Zoho response formats.

**Supported Formats:**
```javascript
// Direct data array
response.data = [...]

// Direct array response
response = [...]

// Result field response
response.result = [...]
```

## Filtering Support

### Projects Filtering
- `status`: Exact status matching
- `projectNumber`: Substring matching
- `reportType`: Project type substring matching
- `accountName`: Case-insensitive substring matching

### Resources Filtering
- `role`: Employee role matching
- `status`: Employee status matching
- `employeeType`: Employment type matching
- `name`: Full name substring search

### Billing Filtering
- `status`: Location status matching
- `codeId`: Code ID substring matching

## Debug and Testing Functions

### window.debugZohoAPI()
Comprehensive API debugging function providing:
- Zoho object availability check
- Available methods enumeration
- Service capability analysis
- IndexedDB integration status

### window.testAllProjectsAPI()
Complete projects API testing with:
- Full workflow execution
- Result validation and display
- Error handling verification
- Data structure analysis

### window.testPagination()
Dedicated pagination testing:
- Multi-page fetch simulation
- Cursor handling verification
- Performance measurement
- Record count validation

### window.testAPIConfigs()
Configuration testing with multiple API parameter combinations:
- Various parameter sets
- Error handling for invalid configs
- Method availability testing
- Response format validation

### window.testResourcesAPICall()
Complete resources API testing including:
- IndexedDB integration testing
- Coordinate validation
- Database statistics
- Full workflow verification

### window.testBillingAPI()
Comprehensive billing locations API testing:
- API call verification
- Data structure validation
- Record count verification
- Error handling testing

## Global Exports

### Main Functions
```javascript
window.fetchProjectsData = getProjectsData;
window.getProjectsData = getProjectsData;
window.fetchResourcesData = getCustomersData;
window.getResourcesData = getCustomersData;
window.fetchCustomersData = getCustomersData;
window.getCustomersData = getCustomersData;
window.fetchBillingData = getBillingData;
window.getBillingData = getBillingData;
```

### Backward Compatibility
```javascript
async function fetchProjectsData(filters = {}) {
    return await getProjectsData(filters);
}
```

## Error Handling

### Comprehensive Error Management
- Try-catch blocks around all API operations
- Detailed error logging with context
- Graceful fallback to mock data
- User-friendly error messages
- Service availability detection

### Request Deduplication
- Prevents multiple simultaneous requests
- Promise-based request tracking
- Automatic cleanup after completion
- Race condition prevention

## Performance Optimizations

### Pagination Efficiency
- Optimal 1000 record page size
- Cursor-based pagination for performance
- Batch processing for large datasets
- Memory-efficient aggregation

### Caching Strategy
- IndexedDB integration for persistent caching
- 30-day cache expiration
- Intelligent sync determination
- Background refresh capability

### Request Optimization
- Deduplication prevents redundant API calls
- Efficient field mapping
- Coordinate validation optimization
- Minimal processing overhead

## Integration Features

### IndexedDB Integration
- Automatic sync management
- Persistent local storage
- Offline capability support
- Cache invalidation handling

### Widget Environment Support
- Zoho Creator widget compatibility
- API method auto-detection
- Environment-specific optimizations
- Cross-environment consistency

## Data Quality Management

### Coordinate Validation
- Numeric conversion with validation
- Invalid coordinate filtering
- Geographic bounds checking
- Default value handling

### Field Validation
- Required field checking
- Data type validation
- Null value handling
- Consistent data structure

## Initialization and Auto-Testing
```javascript
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Zoho API Service loaded (functional version)');
    
    setTimeout(() => {
        console.log('🔄 Auto-testing resources API...');
        testResourcesAPICall();
    }, 2000);
});
```

## Dependencies
- **Zoho Creator API**: Primary data source
- **IndexedDB Service**: Local caching and storage
- **Dexie.js**: IndexedDB operations (via indexedDBService)

## Notes
- Functional programming approach for better maintainability
- Comprehensive error handling and fallback mechanisms
- Production-ready with development testing support
- Optimized for 6000+ record datasets
- Cross-browser compatibility with progressive enhancement