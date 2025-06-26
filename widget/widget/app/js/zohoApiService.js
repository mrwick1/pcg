// Zoho Creator API Service
// Handles all API communications with Zoho Creator for Projects, Resources, and Billing data

class ZohoApiService {
    constructor() {
        // API Configuration for Zoho Creator Widget
        this.accountOwner = 'pemo'; // Application owner
        this.appName = 'pemo'; // Application name
        
        // Widget context - authentication handled by Zoho SDK
        this.isWidget = true;
        this.isInitialized = false;
        
        // API Endpoints (Creator report names)
        this.endpoints = {
            projects: 'All_Projects',
            billing: 'All_Billing_Locations', 
            resources: 'All_Customers'
        };
        
        // Cache for geocoded addresses
        this.geocodeCache = new Map();
        
        // Request queue for pagination
        this.requestQueue = [];
        this.isProcessing = false;
        
        // Local storage cache configuration - DISABLED FOR DEBUGGING
        this.cacheConfig = {
            enabled: false, // DISABLED: No caching for now
            permanent: true, // No expiry - addresses and project data don't change frequently
            keyPrefix: 'zoho_pcg_',
            version: '1.0' // For cache invalidation when data structure changes
        };
        
        // Initialize cache manager
        this.initializeCacheManager();
        
        // Initialize Zoho SDK
        this.initializeSDK();
    }

    // CACHE MANAGEMENT METHODS
    initializeCacheManager() {
        console.log('🗄️ Initializing cache manager...');
        
        // Clean expired cache entries on initialization
        this.cleanExpiredCache();
        
        // Check if cache version has changed (invalidate all if so)
        const currentVersion = this.getCacheItem('version');
        if (!currentVersion || currentVersion !== this.cacheConfig.version) {
            console.log('📦 Cache version changed, clearing all cache');
            this.clearAllCache();
            this.setCacheItem('version', this.cacheConfig.version);
        }
    }

    generateCacheKey(endpoint, params = {}) {
        const paramString = JSON.stringify(params);
        const hash = this.simpleHash(paramString);
        return `${this.cacheConfig.keyPrefix}${endpoint}_${hash}`;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    setCacheItem(key, data, customTTL = null) {
        if (!this.cacheConfig.enabled) return false;
        
        try {
            const cacheEntry = {
                data: data,
                timestamp: Date.now(),
                permanent: this.cacheConfig.permanent,
                version: this.cacheConfig.version
            };
            
            // Add TTL only if not permanent and customTTL provided
            if (!this.cacheConfig.permanent && customTTL) {
                cacheEntry.ttl = customTTL;
            }
            
            const fullKey = key.startsWith(this.cacheConfig.keyPrefix) ? key : `${this.cacheConfig.keyPrefix}${key}`;
            localStorage.setItem(fullKey, JSON.stringify(cacheEntry));
            
            console.log(`💾 Cached data for key: ${fullKey} (permanent: ${this.cacheConfig.permanent})`);
            return true;
        } catch (error) {
            console.warn('Failed to cache data:', error);
            return false;
        }
    }

    getCacheItem(key) {
        if (!this.cacheConfig.enabled) return null;
        
        try {
            const fullKey = key.startsWith(this.cacheConfig.keyPrefix) ? key : `${this.cacheConfig.keyPrefix}${key}`;
            const cached = localStorage.getItem(fullKey);
            
            if (!cached) return null;
            
            const cacheEntry = JSON.parse(cached);
            
            // Check if cache has expired (only for non-permanent cache)
            if (!cacheEntry.permanent && cacheEntry.ttl) {
                const now = Date.now();
                if (now - cacheEntry.timestamp > cacheEntry.ttl) {
                    console.log(`⏰ Cache expired for key: ${fullKey}`);
                    localStorage.removeItem(fullKey);
                    return null;
                }
            }
            
            // Check version compatibility
            if (cacheEntry.version !== this.cacheConfig.version) {
                console.log(`📦 Cache version mismatch for key: ${fullKey}`);
                localStorage.removeItem(fullKey);
                return null;
            }
            
            const cacheType = cacheEntry.permanent ? 'permanent' : 'temporary';
            console.log(`✅ Cache hit for key: ${fullKey} (${cacheType})`);
            return cacheEntry.data;
        } catch (error) {
            console.warn('Failed to retrieve cached data:', error);
            return null;
        }
    }

    cleanExpiredCache() {
        if (!this.cacheConfig.enabled) return;
        
        try {
            const keysToRemove = [];
            const now = Date.now();
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.cacheConfig.keyPrefix)) {
                    try {
                        const cached = localStorage.getItem(key);
                        if (cached) {
                            const cacheEntry = JSON.parse(cached);
                            // Only remove non-permanent cache that has expired
                            if (!cacheEntry.permanent && cacheEntry.ttl && 
                                now - cacheEntry.timestamp > cacheEntry.ttl) {
                                keysToRemove.push(key);
                            }
                        }
                    } catch (error) {
                        keysToRemove.push(key); // Remove corrupted entries
                    }
                }
            }
            
            for (const key of keysToRemove) {
                localStorage.removeItem(key);
                console.log(`🗑️ Removed expired cache: ${key}`);
            }
            
            if (keysToRemove.length > 0) {
                console.log(`🧹 Cleaned ${keysToRemove.length} expired cache entries`);
            }
        } catch (error) {
            console.warn('Failed to clean expired cache:', error);
        }
    }

    clearAllCache() {
        if (!this.cacheConfig.enabled) return;
        
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.cacheConfig.keyPrefix)) {
                    keysToRemove.push(key);
                }
            }
            
            for (const key of keysToRemove) {
                localStorage.removeItem(key);
            }
            console.log(`🗑️ Cleared all cache (${keysToRemove.length} entries)`);
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }

    getCacheStats() {
        const stats = {
            totalEntries: 0,
            totalSize: 0,
            entries: []
        };
        
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.cacheConfig.keyPrefix)) {
                    const value = localStorage.getItem(key);
                    const size = new Blob([value]).size;
                    stats.totalEntries++;
                    stats.totalSize += size;
                    
                    try {
                        const cacheEntry = JSON.parse(value);
                        const age = Date.now() - cacheEntry.timestamp;
                        stats.entries.push({
                            key: key,
                            size: size,
                            age: age,
                            remaining: cacheEntry.ttl - age
                        });
                    } catch (error) {
                        stats.entries.push({
                            key: key,
                            size: size,
                            corrupted: true
                        });
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to get cache stats:', error);
        }
        
        return stats;
    }

    // Initialize Zoho Creator SDK
    async initializeSDK() {
        return new Promise((resolve) => {
            try {
                // Check if running in Zoho Creator environment
                if (typeof ZOHO === 'undefined') {
                    console.log('Not running in Zoho Creator environment - using mock data');
                    this.isInitialized = false;
                    resolve();
                    return;
                }
                
                console.log('ZOHO object available:', typeof ZOHO !== 'undefined');
                console.log('ZOHO.embeddedApp available:', typeof ZOHO.embeddedApp !== 'undefined');
                console.log('ZOHO.CREATOR available:', typeof ZOHO.CREATOR !== 'undefined');
                console.log('ZOHO.CREATOR.API available:', typeof ZOHO.CREATOR?.API !== 'undefined');
                
                // Check for different Zoho initialization patterns
                if (typeof ZOHO.embeddedApp !== 'undefined') {
                    console.log('🔄 Using ZOHO.embeddedApp initialization...');
                    
                    ZOHO.embeddedApp.on("EmbeddedApp.ready", () => {
                        console.log('🎉 Embedded App is ready!');
                        console.log('ZOHO.CREATOR.API now available:', typeof ZOHO.CREATOR?.API !== 'undefined');
                        console.log('ZOHO.CREATOR.API.invoke available:', typeof ZOHO.CREATOR?.API?.invoke !== 'undefined');
                        
                        if (typeof ZOHO.CREATOR?.API?.invoke !== 'undefined') {
                            this.isInitialized = true;
                            console.log('✅ Zoho API properly initialized');
                        } else {
                            console.log('⚠️ Zoho API still not available after ready event');
                            this.isInitialized = false;
                        }
                        resolve();
                    });
                    
                    ZOHO.embeddedApp.init();
                } else if (typeof ZOHO.CREATOR?.API?.invoke !== 'undefined') {
                    // Direct API access available
                    console.log('✅ Direct Zoho Creator API access available');
                    this.isInitialized = true;
                    resolve();
                } else if (typeof ZOHO.CREATOR?.UTIL?.invoke !== 'undefined') {
                    // Alternative API pattern
                    console.log('✅ Zoho Creator UTIL API access available');
                    this.isInitialized = true;
                    resolve();
                } else {
                    // Try waiting a bit for the API to load
                    console.log('⏳ Waiting for Zoho Creator API to load...');
                    setTimeout(() => {
                        if (typeof ZOHO.CREATOR?.API?.invoke !== 'undefined') {
                            console.log('✅ Zoho Creator API loaded after delay');
                            this.isInitialized = true;
                        } else {
                            console.log('⚠️ Zoho Creator API not available, will use mock data');
                            this.isInitialized = false;
                        }
                        resolve();
                    }, 2000);
                }
                
            } catch (error) {
                console.error('Failed to initialize Zoho Creator SDK:', error);
                this.isInitialized = false;
                resolve();
            }
        });
    }

    // Ensure SDK is initialized before API calls
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initializeSDK();
        }
        if (!this.isInitialized) {
            // Always fall back to mock data instead of throwing errors
            console.log('🔄 Falling back to mock data - Zoho API not ready');
            return false; // Indicate mock mode
        }
        return true; // Indicate Zoho mode
    }

    // Generic API request method using Zoho SDK
    async makeRequest(endpoint, params = {}) {
        console.log('🔄 makeRequest called:', { endpoint, params });
        
        const isZohoMode = await this.ensureInitialized();
        console.log('🔍 Zoho mode check result:', isZohoMode);
        
        // If not in Zoho mode, fall back to mock API
        if (!isZohoMode) {
            console.log('⚠️ Using mock API data for endpoint:', endpoint);
            return await this.getMockData(endpoint, params);
        }
        
        // Check if ZOHO.CREATOR.API is available
        if (!ZOHO.CREATOR?.API?.invoke && !ZOHO.CREATOR?.UTIL?.invoke) {
            console.error('❌ ZOHO.CREATOR.API.invoke not available, falling back to mock');
            console.log('ZOHO object:', ZOHO);
            console.log('ZOHO.CREATOR:', ZOHO.CREATOR);
            console.log('ZOHO.CREATOR.API:', ZOHO.CREATOR?.API);
            return await this.getMockData(endpoint, params);
        }
        
        const config = {
            url: `/api/v2/${this.accountOwner}/${this.appName}/report/${endpoint}`,
            type: 'GET',
            parameters: {
                from: params.from || 1,
                limit: params.limit || 200,
                ...params.filters
            }
        };

        console.log('🔄 ZOHO API REQUEST:', {
            endpoint: endpoint,
            config: config,
            timestamp: new Date().toISOString()
        });

        try {
            // Use the available API method
            const apiMethod = ZOHO.CREATOR.API?.invoke || ZOHO.CREATOR.UTIL?.invoke;
            const response = await apiMethod(config);
            
            console.log('✅ ZOHO API RESPONSE:', {
                endpoint: endpoint,
                responseCode: response.code,
                dataLength: response.data ? response.data.length : 0,
                fullResponse: response,
                timestamp: new Date().toISOString()
            });
            
            if (response.code === 200) {
                // Log first record structure for debugging
                if (response.data && response.data.length > 0) {
                    console.log('📋 FIRST RECORD STRUCTURE:', {
                        endpoint: endpoint,
                        firstRecord: response.data[0],
                        recordKeys: Object.keys(response.data[0]),
                        timestamp: new Date().toISOString()
                    });
                }
                return { data: response.data || [] };
            } else {
                console.warn(`❌ API request failed: ${response.code} ${response.message || 'Unknown error'}`);
                // Fall back to mock data on API errors
                return await this.getMockData(endpoint, params);
            }
        } catch (error) {
            console.error('❌ API REQUEST ERROR:', {
                endpoint: endpoint,
                error: error,
                config: config,
                timestamp: new Date().toISOString()
            });
            // Fall back to mock data on errors
            console.log('🔄 Falling back to mock data due to API error');
            return await this.getMockData(endpoint, params);
        }
    }

    // Mock data fallback when ZOHO SDK is not available
    async getMockData(endpoint, params = {}) {
        console.log('🔄 getMockData called for endpoint:', endpoint);
        
        // For projects endpoint, return sample data structure
        if (endpoint === 'All_Projects') {
            console.log('📋 Returning mock projects data');
            const mockProjects = [
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
            ];
            return { data: mockProjects };
        }
        
        // For other endpoints, return empty data
        console.log('Returning empty mock data for endpoint:', endpoint);
        return { data: [] };
    }

    // Geocoding service using JavaScript geocoding service
    async geocodeAddress(address) {
        console.log('🗺️ GEOCODING REQUEST:', {
            address: address,
            isCached: this.geocodeCache.has(address),
            timestamp: new Date().toISOString()
        });

        if (!address || address.trim() === '') {
            console.log('⚠️ GEOCODING SKIPPED: Empty address');
            return { lat: 0, lng: 0 };
        }

        if (this.geocodeCache.has(address)) {
            const cached = this.geocodeCache.get(address);
            console.log('🎯 GEOCODING CACHE HIT:', {
                address: address,
                cachedLocation: cached,
                timestamp: new Date().toISOString()
            });
            return cached;
        }

        try {
            console.log('🔄 GEOCODING API CALL:', {
                address: address,
                timestamp: new Date().toISOString()
            });
            
            const jsResult = await geocodingService.geocodeAddress(address);
            
            console.log('📍 GEOCODING API RESPONSE:', {
                address: address,
                rawResponse: jsResult,
                timestamp: new Date().toISOString()
            });
            
            const coords = geocodingService.extractCoordinates(jsResult);
            
            if (coords) {
                console.log('✅ GEOCODING SUCCESS:', {
                    address: address,
                    location: coords,
                    timestamp: new Date().toISOString()
                });
                const location = { lat: coords.lat, lng: coords.lng };
                this.geocodeCache.set(address, location);
                return location;
            }
            
            // Fallback coordinates for India center if geocoding fails
            console.warn('⚠️ GEOCODING FALLBACK:', {
                address: address,
                reason: 'No results found',
                timestamp: new Date().toISOString()
            });
            const fallbackLocation = { lat: 20.5937, lng: 78.9629 }; // India center
            this.geocodeCache.set(address, fallbackLocation);
            return fallbackLocation;
            
        } catch (error) {
            console.error('❌ GEOCODING ERROR:', {
                address: address,
                error: error,
                timestamp: new Date().toISOString()
            });
            
            // Final fallback to India center
            const fallbackLocation = { lat: 20.5937, lng: 78.9629 };
            this.geocodeCache.set(address, fallbackLocation);
            return fallbackLocation;
        }
    }

    // Batch geocoding with rate limiting using JavaScript geocoding service
    async geocodeBatch(addresses, batchSize = 5, delayMs = 200) {
        console.log('🚀 BATCH GEOCODING START:', {
            totalAddresses: addresses.length,
            batchSize: batchSize,
            delayMs: delayMs,
            addresses: addresses,
            timestamp: new Date().toISOString()
        });

        // Use the JavaScript geocoding service's batch method
        try {
            const results = await geocodingService.geocodeBatch(addresses);
            
            // Convert results to the expected format
            const formattedResults = results.map((result, index) => {
                if (result && typeof result === 'object' && result.lat !== undefined && result.lng !== undefined) {
                    return result;
                }
                
                // Extract coordinates from geocoding result if needed
                const coords = geocodingService.extractCoordinates(result);
                if (coords) {
                    return { lat: coords.lat, lng: coords.lng };
                }
                
                // Fallback for this address
                console.warn(`⚠️ BATCH GEOCODING FALLBACK for address ${index}:`, addresses[index]);
                return { lat: 20.5937, lng: 78.9629 };
            });
            
            console.log('✅ BATCH GEOCODING COMPLETE:', {
                totalProcessed: formattedResults.length,
                successfulGeocodes: formattedResults.filter(r => r.lat !== 20.5937 || r.lng !== 78.9629).length,
                fallbackGeocodes: formattedResults.filter(r => r.lat === 20.5937 && r.lng === 78.9629).length,
                timestamp: new Date().toISOString()
            });
            
            return formattedResults;
            
        } catch (error) {
            console.error('❌ BATCH GEOCODING ERROR:', {
                error: error,
                addresses: addresses,
                timestamp: new Date().toISOString()
            });
            
            // Fallback: process individually with rate limiting
            const results = [];
            
            for (let i = 0; i < addresses.length; i += batchSize) {
                const batch = addresses.slice(i, i + batchSize);
                const batchIndex = Math.floor(i / batchSize) + 1;
                const totalBatches = Math.ceil(addresses.length / batchSize);
                
                console.log(`🔄 FALLBACK PROCESSING BATCH ${batchIndex}/${totalBatches}:`, {
                    batchAddresses: batch,
                    startIndex: i,
                    endIndex: i + batchSize - 1,
                    timestamp: new Date().toISOString()
                });
                
                const batchPromises = batch.map((address, index) => {
                    console.log(`📍 GEOCODING ${i + index + 1}/${addresses.length}:`, address);
                    return this.geocodeAddress(address);
                });
                
                try {
                    const batchResults = await Promise.all(batchPromises);
                    results.push(...batchResults);
                    
                    console.log(`✅ BATCH ${batchIndex} COMPLETED:`, {
                        batchResults: batchResults,
                        totalProcessed: results.length,
                        remaining: addresses.length - results.length,
                        timestamp: new Date().toISOString()
                    });
                    
                    // Rate limiting between batches
                    if (i + batchSize < addresses.length) {
                        console.log(`⏱️ BATCH DELAY: ${delayMs}ms before next batch`);
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                    }
                } catch (batchError) {
                    console.error(`❌ BATCH ${batchIndex} ERROR:`, {
                        error: batchError,
                        batch: batch,
                        timestamp: new Date().toISOString()
                    });
                    // Add fallback coordinates for failed batch
                    const fallbackBatch = batch.map(() => ({ lat: 20.5937, lng: 78.9629 }));
                    results.push(...fallbackBatch);
                }
            }
            
            return results;
        }
    }

    // Fetch all records with pagination using Zoho SDK
    async fetchAllRecords(endpoint, batchProcessor = null) {
        const allRecords = [];
        let from = 1;
        const limit = 200;
        let hasMore = true;

        while (hasMore) {
            try {
                const response = await this.makeRequest(endpoint, { from, limit });
                const records = response.data || [];
                
                if (records.length === 0) {
                    hasMore = false;
                    break;
                }

                // Process batch if processor provided
                if (batchProcessor) {
                    const processedBatch = await batchProcessor(records);
                    allRecords.push(...processedBatch);
                } else {
                    allRecords.push(...records);
                }

                // Check if we have more records
                hasMore = records.length === limit;
                from += limit;

                // Rate limiting - small delay between requests
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`Error fetching records from ${from}:`, error);
                throw error;
            }
        }

        return allRecords;
    }

    // PROJECT API METHODS - SIMPLIFIED FOR DEBUGGING
    async fetchProjectsData(filters = {}) {
        console.log("🏗️ FETCHING PROJECTS DATA (SIMPLIFIED DEBUG MODE):", {
            filters: filters,
            timestamp: new Date().toISOString()
        });
        
        try {
            // Direct API call without caching for debugging
            console.log("🔄 DIRECT API CALL - NO CACHE");
            
            const rawProjects = await this.fetchRawProjectsData();
            
            if (rawProjects.length === 0) {
                console.log("⚠️ No projects found in API response");
                return { data: [], total: 0, filtered: 0 };
            }
            
            console.log(`✅ RAW PROJECTS FETCHED: ${rawProjects.length} items`);
            
            // For now, just return raw data with minimal processing (skip geocoding for debugging)
            const processedProjects = rawProjects.map(record => ({
                ...this.mapProjectStructure(record),
                lat: 0, // Skip geocoding for now
                lng: 0,
                project_status: this.determineProjectStatus(record),
                geocoded: false,
                rawData: record // Include raw data for debugging
            }));
            
            console.log(`📊 PROCESSED PROJECTS: ${processedProjects.length} items`);
            
            // Apply filters
            let filteredData = processedProjects;

            if (filters.pccNumber) {
                const beforeFilter = filteredData.length;
                filteredData = filteredData.filter(item => 
                    item.projectStructure.pccNumber === filters.pccNumber ||
                    item.projectStructure.projectName.toLowerCase().includes(filters.pccNumber.toLowerCase())
                );
                console.log(`🔍 PCC NUMBER FILTER: ${beforeFilter} → ${filteredData.length} projects`);
            }

            if (filters.projectType) {
                const beforeFilter = filteredData.length;
                filteredData = filteredData.filter(item => item.projectStructure.projectType === filters.projectType);
                console.log(`🔍 PROJECT TYPE FILTER: ${beforeFilter} → ${filteredData.length} projects`);
            }

            if (filters.accountName) {
                const beforeFilter = filteredData.length;
                filteredData = filteredData.filter(item => item.projectStructure.accountName === filters.accountName);
                console.log(`🔍 ACCOUNT NAME FILTER: ${beforeFilter} → ${filteredData.length} projects`);
            }

            if (filters.project_status) {
                const beforeFilter = filteredData.length;
                filteredData = filteredData.filter(item => item.project_status === filters.project_status);
                console.log(`🔍 PROJECT STATUS FILTER: ${beforeFilter} → ${filteredData.length} projects`);
            }

            console.log(`📊 FINAL RESULTS:`, {
                totalFetched: processedProjects.length,
                afterFilters: filteredData.length,
                timestamp: new Date().toISOString()
            });

            return { 
                data: filteredData,
                total: processedProjects.length,
                filtered: filteredData.length
            };
            
        } catch (error) {
            console.error('❌ ERROR FETCHING PROJECTS:', {
                error: error,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            return { data: [], error: error.message };
        }
    }

    // Fetch raw projects data from API
    async fetchRawProjectsData() {
        console.log("🔄 FETCHING RAW PROJECTS FROM API");
        
        const allRecords = [];
        let from = 1;
        const limit = 200;
        let hasMore = true;

        while (hasMore) {
            try {
                const response = await this.makeRequest(this.endpoints.projects, { from, limit });
                const records = response.data || [];
                
                if (records.length === 0) {
                    hasMore = false;
                    break;
                }

                console.log(`📥 FETCHED BATCH: ${records.length} projects (${from}-${from + records.length - 1})`);
                allRecords.push(...records);

                // Check if we have more records
                hasMore = records.length === limit;
                from += limit;

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ Error fetching projects from ${from}:`, error);
                throw error;
            }
        }

        console.log(`✅ RAW PROJECTS FETCH COMPLETE: ${allRecords.length} total`);
        return allRecords;
    }

    // Process projects with geocoding
    async processProjectsWithGeocoding(rawProjects) {
        console.log(`🗺️ PROCESSING ${rawProjects.length} PROJECTS WITH GEOCODING`);
        
        const startTime = Date.now();
        const processedProjects = [];
        
        // Separate projects with and without existing coordinates
        const projectsNeedingGeocode = [];
        const projectsWithCoords = [];
        
        for (const record of rawProjects) {
            // Check if project already has lat/lng coordinates
            const hasCoords = (record.latitude && record.longitude) || 
                             (record.lat && record.lng) ||
                             (record.Latitude && record.Longitude);
                             
            if (hasCoords) {
                projectsWithCoords.push(record);
            } else {
                projectsNeedingGeocode.push(record);
            }
        }
        
        console.log(`📊 GEOCODING ANALYSIS:`, {
            total: rawProjects.length,
            alreadyGeocoded: projectsWithCoords.length,
            needGeocoding: projectsNeedingGeocode.length
        });
        
        // Process projects that already have coordinates
        for (const record of projectsWithCoords) {
            const projectData = {
                ...this.mapProjectStructure(record),
                lat: record.latitude || record.lat || record.Latitude || 0,
                lng: record.longitude || record.lng || record.Longitude || 0,
                project_status: this.determineProjectStatus(record),
                geocoded: false // Already had coordinates
            };
            processedProjects.push(projectData);
        }
        
        // Process projects that need geocoding
        if (projectsNeedingGeocode.length > 0) {
            console.log(`🔄 BATCH GEOCODING ${projectsNeedingGeocode.length} ADDRESSES`);
            
            // Extract addresses for batch geocoding
            const addresses = projectsNeedingGeocode.map(record => 
                record.Loss_Location_Street_Address || ''
            );
            
            // Geocode addresses in batch
            const coordinates = await this.geocodeBatch(addresses, 5, 200);
            
            // Process geocoded projects
            for (let i = 0; i < projectsNeedingGeocode.length; i++) {
                const record = projectsNeedingGeocode[i];
                const coords = coordinates[i];
                
                const projectData = {
                    ...this.mapProjectStructure(record),
                    lat: coords.lat,
                    lng: coords.lng,
                    project_status: this.determineProjectStatus(record),
                    geocoded: true // Was geocoded by us
                };
                
                processedProjects.push(projectData);
            }
        }
        
        const endTime = Date.now();
        console.log(`🎉 GEOCODING COMPLETE:`, {
            totalProcessed: processedProjects.length,
            duration: `${(endTime - startTime) / 1000}s`,
            successfulGeocodes: processedProjects.filter(p => p.geocoded && (p.lat !== 20.5937 || p.lng !== 78.9629)).length,
            fallbackGeocodes: processedProjects.filter(p => p.geocoded && p.lat === 20.5937 && p.lng === 78.9629).length,
            timestamp: new Date().toISOString()
        });
        
        return processedProjects;
    }

    // Map project structure from raw data
    mapProjectStructure(record) {
        return {
            projectStructure: {
                pccNumber: record.Project_Number || record.ID,
                projectType: record.Type_of_Report || 'Unknown',
                clientProjectNumber: record.Client_Project_Number || '',
                accountName: record.Account_Name || '',
                claimNumber: record.Claim_Number || '',
                insurer: record.Insurer || '',
                carrierName: record.Account_Name || '',
                projectName: record.Project_Name || '',
                projectAddress: record.Loss_Location_Street_Address || '',
                contactName: record.Contact_Name || '',
                insurerContactName: record.Insurer_Contact_Name || '',
                scopeOfService: record.Scope_of_Service || '',
                policyNumber: record.Policy_Number || '',
                dateOfLoss: record.Date_of_Loss || '',
                projectReceived: record['PS_1.Project_Received_By_Acura'] || '',
                projectCompleted: record.Project_Completed || 'false'
            }
        };
    }

    // Determine project status based on PS_5 form criteria
    determineProjectStatus(record) {
        // Completed Projects: Project_Completed field is true
        if (record.Project_Completed === true) {
            return 'Completed';
        }

        // Cancelled Projects: Project_Cancelled is true and Project_Cancelled_Date is present
        if (record.Project_Cancelled === true && record.Project_Cancelled_Date) {
            return 'Cancelled';
        }

        // Suspended Projects: Project_Suspended has value, others are null
        if (record.Project_Suspended && 
            !record.Transmitted_Report_and_Invoice_to_the_Client && 
            !record.Suspended_Projects_Released_On) {
            return 'Suspended';
        }

        // Archived Projects: Transmitted_Report_and_Invoice_to_the_Client is not null and Project_Cancelled is false
        if (record.Transmitted_Report_and_Invoice_to_the_Client && record.Project_Cancelled === false) {
            return 'Archived';
        }

        // Live Projects: Default case when other conditions aren't met
        if (!record.Transmitted_Report_and_Invoice_to_the_Client && 
            record.Project_Cancelled === false && 
            !record.Project_Cancelled_Date && 
            !record.Project_Suspended) {
            return 'Live';
        }

        return 'Live'; // Default status
    }

    // RESOURCE API METHODS - TEMPORARILY DISABLED
    async fetchResourcesData(filters = {}) {
        console.log("🚫 Resources API temporarily disabled - focusing on projects only");
        return { data: [], total: 0, filtered: 0 };
        
        /* COMMENTED OUT FOR PROJECTS-ONLY OPTIMIZATION
        console.log("Fetching resources data from Zoho Creator API with filters:", filters);
        
        try {
            let processedCount = 0;
            
            const batchProcessor = async (records) => {
                console.log(`Processing batch of ${records.length} resources (${processedCount + 1}-${processedCount + records.length})`);
                const processedRecords = [];
                
                // Extract addresses for batch geocoding
                const addresses = records.map(record => record.Temporary_Address || '');
                
                // Geocode addresses in batch
                const coordinates = await this.geocodeBatch(addresses, 10, 100);
                
                for (let i = 0; i < records.length; i++) {
                    const record = records[i];
                    const coords = coordinates[i];
                    
                    const resourceData = {
                        resource: {
                            employeeId: record.ID || '',
                            employeeName: {
                                firstName: record.First_Name || '',
                                lastName: record.Last_Name || ''
                            },
                            personalEmail: record.Email || '',
                            phone: record.Phone || '',
                            userRole: record.Role || '',
                            employeeType: record.Employee_Type || 'Permanent',
                            status: record.Status || 'Active',
                            employeeNumber: record.Employee_Number || '',
                            dateOfBirth: record.Date_of_Birth || null,
                            addresses: {
                                temporary: {
                                    addressLine1: record.Temporary_Address || '',
                                    postalCode: '',
                                    country: 'India'
                                },
                                permanent: {
                                    addressLine1: record.Permanent_Address || record.Temporary_Address || '',
                                    addressLine2: '',
                                    city: record.City || '',
                                    state: record.State || '',
                                    postalCode: record.Postal_Code || '',
                                    country: 'India'
                                }
                            }
                        },
                        lat: coords.lat,
                        lng: coords.lng
                    };

                    processedRecords.push(resourceData);
                }
                
                processedCount += records.length;
                console.log(`✓ Processed ${processedCount} resources total`);
                
                return processedRecords;
            };

            const startTime = Date.now();
            const allResources = await this.fetchAllRecords(this.endpoints.resources, batchProcessor);
            const endTime = Date.now();
            
            console.log(`✓ Completed fetching ${allResources.length} resources in ${(endTime - startTime) / 1000}s`);
            
            // Apply filters
            let filteredData = allResources;

            if (filters.userRole) {
                filteredData = filteredData.filter(item => item.resource.userRole === filters.userRole);
            }

            if (filters.employeeType) {
                filteredData = filteredData.filter(item => item.resource.employeeType === filters.employeeType);
            }

            if (filters.status) {
                filteredData = filteredData.filter(item => item.resource.status === filters.status);
            }

            if (filters.employeeId) {
                filteredData = filteredData.filter(item => item.resource.employeeId === filters.employeeId);
            }

            console.log(`Returning ${filteredData.length} filtered resources from ${allResources.length} total`);
            return { 
                data: filteredData,
                total: allResources.length,
                filtered: filteredData.length
            };

        } catch (error) {
            console.error('Error fetching resources data:', error);
            return { data: [], error: error.message };
        }
        */
    }

    // BILLING API METHODS - TEMPORARILY DISABLED
    async fetchBillingData(filters = {}) {
        console.log("🚫 Billing API temporarily disabled - focusing on projects only");
        return { data: [], total: 0, filtered: 0 };
        
        /* COMMENTED OUT FOR PROJECTS-ONLY OPTIMIZATION
        console.log("Fetching billing data from Zoho Creator API with filters:", filters);
        
        try {
            let processedCount = 0;
            
            const batchProcessor = async (records) => {
                console.log(`Processing batch of ${records.length} billing locations (${processedCount + 1}-${processedCount + records.length})`);
                const processedRecords = [];
                
                // Extract addresses for batch geocoding
                const addresses = records.map(record => record.Address || '');
                
                // Geocode addresses in batch
                const coordinates = await this.geocodeBatch(addresses, 8, 120);
                
                for (let i = 0; i < records.length; i++) {
                    const record = records[i];
                    const coords = coordinates[i];
                    
                    const billingData = {
                        billing: {
                            projectPccNumber: record.Project_PCC_Number || '',
                            claimNumber: record.Claim_Number || '',
                            resourceId: record.Resource_ID || '',
                            resourceName: record.Resource_Name || '',
                            paymentType: record.Payment_Type || 'Monthly Salary',
                            billingStatus: record.Billing_Status || 'Active',
                            address: record.Address || ''
                        },
                        lat: coords.lat,
                        lng: coords.lng
                    };

                    processedRecords.push(billingData);
                }
                
                processedCount += records.length;
                console.log(`✓ Processed ${processedCount} billing locations total`);
                
                return processedRecords;
            };

            const startTime = Date.now();
            const allBilling = await this.fetchAllRecords(this.endpoints.billing, batchProcessor);
            const endTime = Date.now();
            
            console.log(`✓ Completed fetching ${allBilling.length} billing locations in ${(endTime - startTime) / 1000}s`);
            
            // Apply filters
            let filteredData = allBilling;

            if (filters.projectPccNumber) {
                filteredData = filteredData.filter(item => item.billing.projectPccNumber === filters.projectPccNumber);
            }

            if (filters.billingStatus) {
                filteredData = filteredData.filter(item => item.billing.billingStatus === filters.billingStatus);
            }

            if (filters.paymentType) {
                filteredData = filteredData.filter(item => item.billing.paymentType === filters.paymentType);
            }

            if (filters.resourceId) {
                filteredData = filteredData.filter(item => item.billing.resourceId === filters.resourceId);
            }

            console.log(`Returning ${filteredData.length} filtered billing locations from ${allBilling.length} total`);
            return { 
                data: filteredData,
                total: allBilling.length,
                filtered: filteredData.length
            };

        } catch (error) {
            console.error('Error fetching billing data:', error);
            return { data: [], error: error.message };
        }
        */
    }

    // UTILITY METHODS
    async getUniqueProjectTypes() {
        try {
            const response = await this.makeRequest(this.endpoints.projects, { limit: 200 });
            const records = response.data || [];
            return [...new Set(records.map(item => item.Project_Type).filter(Boolean))].sort();
        } catch (error) {
            console.error('Error fetching project types:', error);
            return [];
        }
    }

    async getUniqueAccountNames() {
        try {
            const response = await this.makeRequest(this.endpoints.projects, { limit: 200 });
            const records = response.data || [];
            return [...new Set(records.map(item => item.Account_Name).filter(Boolean))].sort();
        } catch (error) {
            console.error('Error fetching account names:', error);
            return [];
        }
    }

    async getUniqueUserRoles() {
        try {
            const response = await this.makeRequest(this.endpoints.resources, { limit: 200 });
            const records = response.data || [];
            return [...new Set(records.map(item => item.Role).filter(Boolean))].sort();
        } catch (error) {
            console.error('Error fetching user roles:', error);
            return [];
        }
    }

    async getUniqueEmployeeTypes() {
        try {
            const response = await this.makeRequest(this.endpoints.resources, { limit: 200 });
            const records = response.data || [];
            return [...new Set(records.map(item => item.Employee_Type).filter(Boolean))].sort();
        } catch (error) {
            console.error('Error fetching employee types:', error);
            return [];
        }
    }

    async getUniqueResourceStatuses() {
        try {
            const response = await this.makeRequest(this.endpoints.resources, { limit: 200 });
            const records = response.data || [];
            return [...new Set(records.map(item => item.Status).filter(Boolean))].sort();
        } catch (error) {
            console.error('Error fetching resource statuses:', error);
            return [];
        }
    }

    getProjectStatuses() {
        return ['Live', 'Completed', 'Archived', 'Cancelled', 'Suspended'];
    }

    // Error handling and retry logic
    async withRetry(apiCall, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await apiCall();
            } catch (error) {
                console.warn(`API call attempt ${attempt} failed:`, error.message);
                
                if (attempt === maxRetries) {
                    throw error;
                }
                
                // Exponential backoff
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // Show loading state
    showLoadingState(message = 'Loading data...') {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;

        // Create loading overlay if it doesn't exist
        let loadingOverlay = document.getElementById('loading-overlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">${message}</div>
                    <div class="loading-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill"></div>
                        </div>
                        <div class="progress-text" id="progress-text">0%</div>
                    </div>
                </div>
            `;
            mapContainer.appendChild(loadingOverlay);
        } else {
            const loadingText = loadingOverlay.querySelector('.loading-text');
            if (loadingText) loadingText.textContent = message;
        }

        loadingOverlay.style.display = 'flex';
    }

    // Update loading progress
    updateLoadingProgress(current, total, message = '') {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const loadingText = document.querySelector('.loading-text');

        if (progressFill && progressText) {
            const percentage = Math.round((current / total) * 100);
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${percentage}% (${current}/${total})`;
        }

        if (message && loadingText) {
            loadingText.textContent = message;
        }
    }

    // Hide loading state
    hideLoadingState() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    // Show error state
    showErrorState(error, canRetry = true) {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;

        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'error-overlay';
        errorOverlay.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <div class="error-title">Data Loading Failed</div>
                <div class="error-message">${error.message || 'Unknown error occurred'}</div>
                ${canRetry ? '<button class="retry-btn" onclick="location.reload()">Retry</button>' : ''}
                <button class="dismiss-btn" onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;

        // Remove existing error overlays
        const existingErrors = mapContainer.querySelectorAll('.error-overlay');
        existingErrors.forEach(el => el.remove());

        mapContainer.appendChild(errorOverlay);

        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (errorOverlay.parentElement) {
                errorOverlay.remove();
            }
        }, 10000);
    }
}

// Create global instance
const zohoApiService = new ZohoApiService();

// Widget API functions - direct Zoho Creator integration
async function fetchProjectsData(filters = {}) {
    return await zohoApiService.fetchProjectsData(filters);
}

async function fetchResourcesData(filters = {}) {
    return await zohoApiService.fetchResourcesData(filters);
}

async function fetchBillingData(filters = {}) {
    return await zohoApiService.fetchBillingData(filters);
}


// Widget Utility functions - direct Zoho Creator integration
async function getUniqueProjectTypes() {
    return await zohoApiService.getUniqueProjectTypes();
}

async function getUniqueAccountNames() {
    return await zohoApiService.getUniqueAccountNames();
}

async function getUniqueUserRoles() {
    return await zohoApiService.getUniqueUserRoles();
}

async function getUniqueEmployeeTypes() {
    return await zohoApiService.getUniqueEmployeeTypes();
}

async function getUniqueResourceStatuses() {
    return await zohoApiService.getUniqueResourceStatuses();
}

function getProjectStatuses() {
    return ['Live', 'Completed', 'Archived', 'Cancelled', 'Suspended'];
}

// Billing utility functions
function getUniqueBillingStatuses() {
    return ['Active', 'Inactive', 'On Hold'];
}

function getUniquePaymentTypes() {
    return ['Monthly Salary', 'Hourly Contract', 'Project Based', 'Not Selected'];
}

// Resource utility functions for compatibility
async function getUniqueEmployeeTypes() {
    return ['Permanent', 'Contract', 'Temporary', 'Consultant'];
}

async function getUniqueResourceStatuses() {
    return ['Active', 'Inactive', 'On Leave', 'Terminated'];
}

// Cache management functions for developers/debugging
function clearProjectCache() {
    zohoApiService.clearAllCache();
    console.log('🗑️ All project cache cleared');
}

function clearRawProjectsCache() {
    try {
        localStorage.removeItem('zoho_pcg_projects_raw_data');
        console.log('🗑️ Raw projects cache cleared');
    } catch (error) {
        console.warn('Failed to clear raw projects cache:', error);
    }
}

function clearGeocodedProjectsCache() {
    try {
        localStorage.removeItem('zoho_pcg_projects_geocoded_data');
        console.log('🗑️ Geocoded projects cache cleared');
    } catch (error) {
        console.warn('Failed to clear geocoded projects cache:', error);
    }
}

function forceRefreshProjects() {
    clearRawProjectsCache();
    clearGeocodedProjectsCache();
    console.log('🔄 Forced refresh - both project caches cleared');
}

function getCacheStats() {
    const stats = zohoApiService.getCacheStats();
    console.log('📊 CACHE STATISTICS:', stats);
    return stats;
}

function getProjectCacheInfo() {
    const rawCache = zohoApiService.getCacheItem('projects_raw_data');
    const geocodedCache = zohoApiService.getCacheItem('projects_geocoded_data');
    
    const info = {
        rawProjectsCount: rawCache ? rawCache.length : 0,
        geocodedProjectsCount: geocodedCache ? geocodedCache.length : 0,
        cacheStatus: {
            rawCached: !!rawCache,
            geocodedCached: !!geocodedCache
        }
    };
    
    console.log('📊 PROJECT CACHE INFO:', info);
    return info;
}

function disableCache() {
    zohoApiService.cacheConfig.enabled = false;
    console.log('❌ Cache disabled');
}

function enableCache() {
    zohoApiService.cacheConfig.enabled = true;
    console.log('✅ Cache enabled');
}