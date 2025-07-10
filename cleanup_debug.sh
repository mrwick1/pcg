#!/bin/bash

# Clean up debug console.log statements from JavaScript files
# Remove specific debug patterns while keeping essential logging

echo "Cleaning up debug statements from JavaScript files..."

# Function to remove debug sections from zohoApiService.js
clean_zoho_service() {
    local file="js/zohoApiService.js"
    echo "Cleaning $file..."
    
    # Remove debug sections using sed
    sed -i '/DEBUG: Show all projects marked as Archived/,/}/d' "$file"
    sed -i '/Show sample of transmitted values/,/console.log.*Sample transmitted values/d' "$file"
    sed -i '/Show unique transmitted values/,/console.log.*UNIQUE TRANSMITTED VALUES/d' "$file"
    sed -i '/Focus on our target projects/,/console.log.*TARGET PROJECTS/d' "$file"
    sed -i '/Log specific projects we.*tracking/,/}/d' "$file"
    sed -i '/TRACKED PROJECTS IN PROCESSED DATA/,/}/d' "$file"
    sed -i '/console.log.*getProjectsData called with filters/d' "$file"
    sed -i '/console.log.*Calling getProjectsFromDB/d' "$file"
    sed -i '/console.log.*getProjectsFromDB returned/,/});/d' "$file"
    sed -i '/console.log.*getCustomersData called/d' "$file"
    sed -i '/console.log.*getBillingData called/d' "$file"
    sed -i '/console.log.*needsSync:/d' "$file"
    sed -i '/console.log.*Waiting for ongoing request/d' "$file"
    sed -i '/console.log.*Starting new API request/d' "$file"
    sed -i '/console.log.*Data stored in IndexedDB/d' "$file"
    sed -i '/console.log.*Using cached data/d' "$file"
    sed -i '/console.log.*getBillingDataDirect called/d' "$file"
    sed -i '/console.log.*Direct result:/d' "$file"
    
    # Remove empty function logging
    sed -i '/^[[:space:]]*$/N;/^[[:space:]]*\n[[:space:]]*try {$/d' "$file"
    
    # Clean up standalone debug lines
    sed -i '/^[[:space:]]*$/d' "$file"
}

# Function to remove debug sections from indexedDBService.js
clean_indexeddb_service() {
    local file="js/indexedDBService.js"
    echo "Cleaning $file..."
    
    # Remove debug sections
    sed -i '/STORING PROJECTS DATA TO INDEXEDDB/d' "$file"
    sed -i '/TRACKED PROJECTS BEING STORED/,/});/d' "$file"
    sed -i '/console.log.*getProjectsFromDB called/d' "$file"
    sed -i '/Debug: Check what projects exist/,/}/d' "$file"
    sed -i '/TRACKED PROJECTS BEFORE STATUS FILTERING/,/});/d' "$file"
    sed -i '/console.log.*getProjectsFromDB results/,/});/d' "$file"
    sed -i '/DIRECT QUERY FOR ARCHIVED PROJECTS/,/});/d' "$file"
    sed -i '/TRACKED PROJECTS FOUND IN ARCHIVED/,/}/d' "$file"
    sed -i '/NO TRACKED PROJECTS FOUND/d' "$file"
    
    # Remove empty lines
    sed -i '/^[[:space:]]*$/d' "$file"
}

# Function to remove debug sections from map.js
clean_map_service() {
    local file="js/map.js"
    echo "Cleaning $file..."
    
    # Remove debug sections
    sed -i '/loadAndDisplayData called/d' "$file"
    sed -i '/Filters received:/d' "$file"
    sed -i '/Project status filter:/d' "$file"
    sed -i '/Project filters being passed/d' "$file"
    sed -i '/Projects returned from getProjectsData/,/});/d' "$file"
    sed -i '/Projects by status:/d' "$file"
    sed -i '/TRACKED PROJECTS IN MAP RESULTS/,/}/d' "$file"
    sed -i '/NO TRACKED PROJECTS IN MAP RESULTS/d' "$file"
    sed -i '/Adding project markers/d' "$file"
    sed -i '/Adding marker for project/d' "$file"
    sed -i '/Skipping project.*invalid coordinates/d' "$file"
    sed -i '/Project markers summary:/d' "$file"
    sed -i '/TRACKED PROJECTS MARKER PROCESSING/,/});/d' "$file"
    sed -i '/console.log.*Billing markers:/d' "$file"
    
    # Remove empty lines
    sed -i '/^[[:space:]]*$/d' "$file"
}

# Run cleanup functions
clean_zoho_service
clean_indexeddb_service
clean_map_service

echo "Debug cleanup completed!"