// IndexedDB Service using Dexie.js for PCG Application
// Handles storage for projects, resources, and billing data (6k+ records)

// Initialize Dexie database
const db = new Dexie('PCGDatabase');

// Define database schema
db.version(3).stores({
    projects: '++id, projectNumber, projectName, projectType, accountName, claimNumber, contactName, address, status, dateOfLoss, insurer, policyNumber, completed, lat, lng, lastUpdated',
    resources: '++id, employeeName, role, status, employeeType, address, coordinates, lastUpdated',
    billing: '++id, codeId, status, population, address, coordinates, lastUpdated',
    metadata: '++id, tableName, lastSync, recordCount, version'
});

// Database configuration
const DB_CONFIG = {
    syncExpiration: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    batchSize: 1000 // Process records in batches
};

// Initialize database and handle errors
db.open().catch(function(error) {
    console.error('❌ Failed to open IndexedDB:', error);
});

// === PROJECTS STORAGE ===

// Store projects data in IndexedDB
async function storeProjectsData(projectsArray) {
    console.log(`💾 Storing ${projectsArray.length} projects in IndexedDB...`);
    
    try {
        // Add timestamp to each record
        const timestampedProjects = projectsArray.map(project => ({
            ...project,
            lastUpdated: Date.now()
        }));
        
        // Clear existing projects and insert new ones
        await db.transaction('rw', db.projects, db.metadata, async () => {
            await db.projects.clear();
            await db.projects.bulkAdd(timestampedProjects);
            
            // Update metadata
            await db.metadata.put({
                tableName: 'projects',
                lastSync: Date.now(),
                recordCount: projectsArray.length,
                version: 1
            });
        });
        
        console.log(`✅ Successfully stored ${projectsArray.length} projects`);
        return { success: true, count: projectsArray.length };
        
    } catch (error) {
        console.error('❌ Error storing projects:', error);
        return { success: false, error: error.message };
    }
}

// Retrieve projects data from IndexedDB with optional filters
async function getProjectsFromDB(filters = {}) {
    console.log('🔍 Retrieving projects from IndexedDB with filters:', filters);
    
    try {
        let query = db.projects.toCollection();
        
        // Apply filters
        if (filters.status) {
            query = query.filter(p => p.status === filters.status);
        }
        if (filters.projectNumber) {
            query = query.filter(p => 
                p.projectNumber && p.projectNumber.includes(filters.projectNumber)
            );
        }
        if (filters.reportType) {
            query = query.filter(p => 
                p.projectType && p.projectType.includes(filters.reportType)
            );
        }
        if (filters.accountName) {
            query = query.filter(p => 
                p.accountName && p.accountName.toLowerCase().includes(filters.accountName.toLowerCase())
            );
        }
        
        const projects = await query.toArray();
        const total = await db.projects.count();
        
        console.log(`✅ Retrieved ${projects.length} projects from ${total} total`);
        
        // Return projects array directly to match expected data structure
        return projects;
        
    } catch (error) {
        console.error('❌ Error retrieving projects:', error);
        // Return empty array on error to match expected data structure
        return [];
    }
}

// === RESOURCES STORAGE ===

// Store resources data in IndexedDB
async function storeResourcesData(resourcesArray) {
    console.log(`💾 Storing ${resourcesArray.length} resources in IndexedDB...`);
    
    try {
        const timestampedResources = resourcesArray.map(resource => ({
            ...resource,
            lastUpdated: Date.now()
        }));
        
        await db.transaction('rw', db.resources, db.metadata, async () => {
            await db.resources.clear();
            await db.resources.bulkAdd(timestampedResources);
            
            await db.metadata.put({
                tableName: 'resources',
                lastSync: Date.now(),
                recordCount: resourcesArray.length,
                version: 1
            });
        });
        
        console.log(`✅ Successfully stored ${resourcesArray.length} resources`);
        return { success: true, count: resourcesArray.length };
        
    } catch (error) {
        console.error('❌ Error storing resources:', error);
        return { success: false, error: error.message };
    }
}

// Retrieve resources data from IndexedDB with optional filters
async function getResourcesFromDB(filters = {}) {
    console.log('🔍 Retrieving resources from IndexedDB with filters:', filters);
    
    try {
        let query = db.resources.toCollection();
        
        if (filters.role) {
            query = query.filter(r => r.role === filters.role);
        }
        if (filters.status) {
            query = query.filter(r => r.status === filters.status);
        }
        if (filters.employeeType) {
            query = query.filter(r => r.employeeType === filters.employeeType);
        }
        
        const resources = await query.toArray();
        const total = await db.resources.count();
        
        console.log(`✅ Retrieved ${resources.length} resources from ${total} total`);
        
        return {
            data: resources,
            total: total,
            filtered: resources.length,
            success: true
        };
        
    } catch (error) {
        console.error('❌ Error retrieving resources:', error);
        return {
            data: [],
            total: 0,
            filtered: 0,
            success: false,
            error: error.message
        };
    }
}

// === BILLING STORAGE ===

// Store billing data in IndexedDB
async function storeBillingData(billingArray) {
    console.log(`💾 Storing ${billingArray.length} billing locations in IndexedDB...`);
    
    try {
        const timestampedBilling = billingArray.map(billing => ({
            ...billing,
            lastUpdated: Date.now()
        }));
        
        await db.transaction('rw', db.billing, db.metadata, async () => {
            await db.billing.clear();
            await db.billing.bulkAdd(timestampedBilling);
            
            await db.metadata.put({
                tableName: 'billing',
                lastSync: Date.now(),
                recordCount: billingArray.length,
                version: 1
            });
        });
        
        console.log(`✅ Successfully stored ${billingArray.length} billing locations`);
        return { success: true, count: billingArray.length };
        
    } catch (error) {
        console.error('❌ Error storing billing data:', error);
        return { success: false, error: error.message };
    }
}

// Retrieve billing data from IndexedDB with optional filters
async function getBillingFromDB(filters = {}) {
    console.log('🔍 Retrieving billing locations from IndexedDB with filters:', filters);
    
    try {
        let query = db.billing.toCollection();
        
        if (filters.status) {
            query = query.filter(b => b.status === filters.status);
        }
        if (filters.codeId) {
            query = query.filter(b => 
                b.codeId && b.codeId.includes(filters.codeId)
            );
        }
        
        const billing = await query.toArray();
        const total = await db.billing.count();
        
        console.log(`✅ Retrieved ${billing.length} billing locations from ${total} total`);
        
        return {
            data: billing,
            total: total,
            filtered: billing.length,
            success: true
        };
        
    } catch (error) {
        console.error('❌ Error retrieving billing data:', error);
        return {
            data: [],
            total: 0,
            filtered: 0,
            success: false,
            error: error.message
        };
    }
}

// === SYNC MANAGEMENT ===

// Check if data needs to be synced (based on last sync time)
async function needsSync(tableName) {
    try {
        const metadata = await db.metadata.where('tableName').equals(tableName).first();
        
        if (!metadata || !metadata.lastSync) {
            console.log(`📋 ${tableName}: No sync metadata found - needs sync`);
            return true;
        }
        
        const timeSinceSync = Date.now() - metadata.lastSync;
        const needsSync = timeSinceSync > DB_CONFIG.syncExpiration;
        
        console.log(`📋 ${tableName}: Last sync ${Math.round(timeSinceSync / (60 * 1000))} minutes ago - ${needsSync ? 'needs sync' : 'up to date'}`);
        
        return needsSync;
        
    } catch (error) {
        console.error(`❌ Error checking sync status for ${tableName}:`, error);
        return true; // Default to needing sync if there's an error
    }
}

// Get database statistics
async function getDBStats() {
    try {
        const [projectsCount, resourcesCount, billingCount] = await Promise.all([
            db.projects.count(),
            db.resources.count(),
            db.billing.count()
        ]);
        
        const metadata = await db.metadata.toArray();
        
        return {
            projects: projectsCount,
            resources: resourcesCount,
            billing: billingCount,
            total: projectsCount + resourcesCount + billingCount,
            metadata: metadata,
            success: true
        };
        
    } catch (error) {
        console.error('❌ Error getting database stats:', error);
        return { success: false, error: error.message };
    }
}

// Clear all data from IndexedDB
async function clearAllData() {
    console.log('🗑️ Clearing all IndexedDB data...');
    
    try {
        await db.transaction('rw', [db.projects, db.resources, db.billing, db.metadata], async () => {
            await db.projects.clear();
            await db.resources.clear();
            await db.billing.clear();
            await db.metadata.clear();
        });
        
        console.log('✅ All IndexedDB data cleared');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error clearing IndexedDB data:', error);
        return { success: false, error: error.message };
    }
}

// === GLOBAL EXPORTS ===

// Force refresh by clearing metadata (forces sync on next request)
async function forceRefresh() {
    console.log('🔄 Forcing data refresh by clearing sync metadata...');
    
    try {
        await db.metadata.clear();
        console.log('✅ Sync metadata cleared - next request will fetch fresh data');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error forcing refresh:', error);
        return { success: false, error: error.message };
    }
}

// Export main functions globally
window.indexedDBService = {
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
    
    // Direct database access for advanced queries
    db
};

// Debug functions
window.debugIndexedDB = async function() {
    console.log('🔍 === INDEXEDDB DEBUG ===');
    
    const stats = await getDBStats();
    console.log('📊 Database Stats:', stats);
    
    if (stats.success) {
        console.log(`📋 Total Records: ${stats.total}`);
        console.log(`  - Projects: ${stats.projects}`);
        console.log(`  - Resources: ${stats.resources}`);
        console.log(`  - Billing: ${stats.billing}`);
        
        if (stats.metadata.length > 0) {
            console.log('📋 Sync Status:');
            stats.metadata.forEach(meta => {
                const lastSync = new Date(meta.lastSync);
                console.log(`  - ${meta.tableName}: ${meta.recordCount} records, synced ${lastSync.toLocaleString()}`);
            });
        }
    }
    
    console.log('🔍 === DEBUG COMPLETE ===');
};

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('💾 IndexedDB Service loaded (Dexie.js)');
});