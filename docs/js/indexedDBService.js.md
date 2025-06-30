# indexedDBService.js Documentation

## Overview
Comprehensive IndexedDB service using Dexie.js for high-performance local storage of PCG application data. Handles 6000+ records across projects, resources, and billing with advanced caching, synchronization, and query capabilities.

## Database Schema

### Database Configuration
- **Database Name**: `PCGDatabase`
- **Version**: 3
- **Technology**: Dexie.js (IndexedDB wrapper)
- **Sync Expiration**: 30 days
- **Batch Size**: 1000 records

### Table Definitions
```javascript
{
    projects: '++id, projectNumber, projectName, projectType, accountName, claimNumber, contactName, address, status, dateOfLoss, insurer, policyNumber, completed, lat, lng, lastUpdated',
    resources: '++id, employeeName, role, status, employeeType, address, coordinates, lastUpdated',
    billing: '++id, codeId, status, population, address, coordinates, lastUpdated',
    metadata: '++id, tableName, lastSync, recordCount, version'
}
```

## Core Functions

### Projects Storage

#### storeProjectsData(projectsArray)
Stores projects data with transaction safety and metadata tracking.

**Features:**
- Atomic transactions with automatic rollback
- Timestamp addition to all records
- Metadata tracking for sync status
- Bulk insert optimization for large datasets
- Complete table replacement strategy

**Transaction Flow:**
1. Clears existing projects table
2. Bulk inserts new timestamped data
3. Updates metadata with sync timestamp and record count
4. Returns success/error status with count

#### getProjectsFromDB(filters = {})
Retrieves filtered projects data with advanced query support.

**Supported Filters:**
- `status`: Exact status matching
- `projectNumber`: Substring matching in project numbers
- `reportType`: Substring matching in project types
- `accountName`: Case-insensitive substring matching

**Query Optimization:**
- Chainable Dexie collection filters
- Efficient indexing on key fields
- Memory-efficient result processing

### Resources Storage

#### storeResourcesData(resourcesArray)
Stores employee/resource data with similar transaction handling as projects.

#### getResourcesFromDB(filters = {})
Retrieves filtered resources with support for:
- `role`: Employee role filtering
- `status`: Employee status filtering
- `employeeType`: Employment type filtering

### Billing Storage

#### storeBillingData(billingArray)
Stores billing location data with transaction safety.

#### getBillingFromDB(filters = {})
Retrieves filtered billing data with support for:
- `status`: Location status filtering
- `codeId`: Code ID substring matching

## Synchronization Management

### needsSync(tableName)
Determines if data requires API refresh based on age.

**Logic:**
1. Retrieves metadata for specified table
2. Calculates time since last sync
3. Compares against 30-day expiration period
4. Returns boolean indicating sync necessity

**Expiration Calculation:**
```javascript
const timeSinceSync = Date.now() - metadata.lastSync;
const needsSync = timeSinceSync > DB_CONFIG.syncExpiration;
```

### forceRefresh()
Forces immediate data refresh by clearing sync metadata.

**Use Cases:**
- Manual data refresh requests
- Development testing
- Data corruption recovery
- Administrative data updates

## Utility Functions

### getDBStats()
Comprehensive database statistics and health monitoring.

**Returns:**
```javascript
{
    projects: number,      // Project record count
    resources: number,     // Resource record count  
    billing: number,       // Billing record count
    total: number,         // Total record count
    metadata: Array,       // Sync metadata for all tables
    success: boolean       // Operation success status
}
```

### clearAllData()
Complete database reset with transaction safety.

**Process:**
1. Clears all data tables (projects, resources, billing)
2. Clears metadata table
3. Uses atomic transaction to ensure consistency
4. Returns operation status

## Global Exports

### window.indexedDBService
Main service object exported globally:

```javascript
{
    // Projects
    storeProjectsData,
    getProjectsFromDB,
    
    // Resources  
    storeResourcesData,
    getResourcesFromDB,
    
    // Billing
    storeBillingData,
    getBillingFromDB,
    
    // Utilities
    needsSync,
    getDBStats,
    clearAllData,
    forceRefresh,
    
    // Direct database access
    db
}
```

### Debug Functions

#### window.debugIndexedDB()
Comprehensive debugging function providing:
- Database statistics overview
- Record count breakdown by table
- Sync status and timestamps
- Metadata analysis

**Output Example:**
```
📊 Database Stats: {success: true, projects: 1250, resources: 890, billing: 340}
📋 Total Records: 2480
📋 Sync Status:
  - projects: 1250 records, synced 12/25/2024, 10:30:00 AM
  - resources: 890 records, synced 12/25/2024, 10:28:15 AM
```

## Error Handling

### Transaction Safety
- All operations wrapped in Dexie transactions
- Automatic rollback on errors
- Consistent error reporting format
- Graceful degradation on failures

### Error Response Format
```javascript
{
    success: false,
    error: "Detailed error message",
    data: [],
    total: 0,
    filtered: 0
}
```

### Logging Strategy
- Comprehensive console logging with emojis for visual parsing
- Error details preserved for debugging
- Success confirmations with record counts
- Performance timing for large operations

## Performance Optimizations

### Bulk Operations
- `bulkAdd()` for large dataset insertions
- Batch processing for 1000+ records
- Memory-efficient query processing
- Indexed field optimization

### Caching Strategy
- 30-day data retention policy
- Intelligent sync determination
- Metadata-driven cache invalidation
- Background data refresh capability

### Query Efficiency
- Chained filter operations
- Early filtering to reduce memory usage
- Indexed field queries where possible
- Result set size optimization

## Usage Patterns

### Data Fetching with Auto-Sync
```javascript
// Check if sync needed
if (await indexedDBService.needsSync('projects')) {
    // Fetch fresh data and store
    const freshData = await fetchFromAPI();
    await indexedDBService.storeProjectsData(freshData);
}

// Retrieve filtered data
const projects = await indexedDBService.getProjectsFromDB({
    status: 'Live',
    accountName: 'Client'
});
```

### Manual Refresh
```javascript
// Force refresh
await indexedDBService.forceRefresh();

// Next API call will fetch fresh data
const data = await getProjectsData();
```

## Dependencies
- **Dexie.js**: IndexedDB wrapper library
- **Browser IndexedDB API**: Underlying storage mechanism

## Browser Compatibility
- Modern browsers with IndexedDB support
- Progressive enhancement for unsupported browsers
- Graceful fallback to memory-only operations

## Notes
- Designed for 6000+ record datasets
- Optimized for PCG application data structures
- Supports both online and offline operation modes
- Implements proper data lifecycle management
- Thread-safe operations with transaction guarantees