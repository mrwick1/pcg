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
// Define database schema version 4 - Fixed billing coordinates
db.version(4).stores({
    projects: '++id, projectNumber, projectName, projectType, accountName, claimNumber, contactName, address, status, dateOfLoss, insurer, policyNumber, completed, lat, lng, lastUpdated',
    resources: '++id, employeeName, role, status, employeeType, address, coordinates, lastUpdated',
    billing: '++id, codeId, status, population, address, lat, lng, lastUpdated',
    metadata: '++id, tableName, lastSync, recordCount, version'
});
// Database configuration
const DB_CONFIG = {
    syncExpiration: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    batchSize: 1000 // Process records in batches
};
// Initialize database and handle errors
db.open().catch(function(error) {
});
// === PROJECTS STORAGE ===
// Store projects data in IndexedDB
async function storeProjectsData(projectsArray) {
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
        return { success: true, count: projectsArray.length };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
// Retrieve projects data from IndexedDB with optional filters
async function getProjectsFromDB(filters = {}) {
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
        // Return object with data property to match API response format
        return {
            data: projects,
            total: total,
            filtered: projects.length,
            success: true
        };
    } catch (error) {
        // Return error response to match API response format
        return {
            data: [],
            total: 0,
            filtered: 0,
            success: false,
            error: error.message
        };
    }
}
// === RESOURCES STORAGE ===
// Store resources data in IndexedDB
async function storeResourcesData(resourcesArray) {
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
        return { success: true, count: resourcesArray.length };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
// Retrieve resources data from IndexedDB with optional filters
async function getResourcesFromDB(filters = {}) {
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
        return {
            data: resources,
            total: total,
            filtered: resources.length,
            success: true
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
// === BILLING STORAGE ===
// Store billing data in IndexedDB
async function storeBillingData(billingArray) {
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
        return { success: true, count: billingArray.length };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
// Retrieve billing data from IndexedDB with optional filters
async function getBillingFromDB(filters = {}) {
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
        return {
            data: billing,
            total: total,
            filtered: billing.length,
            success: true
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
// === SYNC MANAGEMENT ===
// Check if data needs to be synced (based on last sync time)
async function needsSync(tableName) {
    try {
        const metadata = await db.metadata.where('tableName').equals(tableName).first();
        if (!metadata || !metadata.lastSync) {
            return true;
        }
        const timeSinceSync = Date.now() - metadata.lastSync;
        const needsSync = timeSinceSync > DB_CONFIG.syncExpiration;
        return needsSync;
    } catch (error) {
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
        return { success: false, error: error.message };
    }
}
// Clear all data from IndexedDB
async function clearAllData() {
    try {
        await db.transaction('rw', [db.projects, db.resources, db.billing, db.metadata], async () => {
            await db.projects.clear();
            await db.resources.clear();
            await db.billing.clear();
            await db.metadata.clear();
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
// === GLOBAL EXPORTS ===
// Force refresh by clearing metadata (forces sync on next request)
async function forceRefresh() {
    try {
        await db.metadata.clear();
        return { success: true };
    } catch (error) {
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
    const stats = await getDBStats();
    if (stats.success) {
        if (stats.metadata.length > 0) {
            stats.metadata.forEach(meta => {
                const lastSync = new Date(meta.lastSync);
            });
        }
    }
};
// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
});