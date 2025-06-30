# filters.js Documentation

## Overview
Comprehensive filter management system providing searchable dropdown functionality for projects, resources, and billing data. Implements real-time search, data filtering, and UI interaction handling.

## Data Structure

### dropdowns Object
Central configuration object containing filter dropdown definitions:

```javascript
{
    projectSearch: { input, list, options: [], selected: '' },
    projectType: { input, list, options: [], selected: '' },
    accountName: { input, list, options: [], selected: '' },
    projectStatus: { input, list, options: ['Completed', 'Live', 'Archived', 'Cancelled', 'Suspended', 'In Progress'], selected: '' },
    userRole: { input, list, options: [], selected: '' },
    employeeType: { input, list, options: ['Full Time', 'Contract'], selected: '' },
    resourceStatus: { input, list, options: ['Active', 'Inactive', 'On Bench'], selected: '' },
    billingStatus: { input, list, options: [], selected: '' },
    paymentType: { input, list, options: [], selected: '' }
}
```

## Key Functions

### initializeDropdowns()
Sets up all dropdown UI elements and event handlers:
- Maps DOM elements to dropdown objects
- Attaches input event listeners for real-time search
- Sets up focus handlers to show dropdown lists
- Implements click-outside-to-close functionality
- Provides special handling for project search (supports PCC number and name search)

### updateDropdownList(dropdownKey, options)
Updates dropdown list with filtered options:
- Clears existing dropdown content
- Creates clickable items for each option
- Handles project search objects vs. simple string options
- Sets up click handlers for option selection
- Validates options to prevent rendering invalid data

### populateDropdownOptions()
Fetches and populates dropdown options from data sources:
- Retrieves projects data using `getProjectsData({})`
- Filters projects to only include those with valid coordinates
- Creates searchable project options with PCC number and name
- Extracts unique project types and account names
- Updates all dropdown lists with fresh data

### collectFilters()
Aggregates current filter selections into a structured object:
```javascript
{
    pccNumber: string,
    projectType: string,
    accountName: string,
    project_status: string,
    userRole: string,
    employeeType: string,
    status: string,
    billingStatus: string,
    paymentType: string
}
```

### resetAllFilters()
Clears all filter selections:
- Resets all dropdown selected values to empty strings
- Clears all input field values
- Triggers filter application to show all data

### applyFilters(changedFilter = null)
Applies current filter state to data display:
- Collects current filter values
- Calls `loadAndDisplayData()` with filters and changed filter context
- Triggers map and data updates

## Search Functionality

### Project Search
Special handling for project search dropdown:
- Supports searching by PCC number or project name
- Creates display text combining both: `"06132 - Project Name"`
- Stores PCC number as the selected value for filtering

### General Text Search
For other dropdowns:
- Case-insensitive substring matching
- Filters options based on user input
- Shows all options when input is empty

## Event Handling

### Input Events
- Real-time search as user types
- Automatic dropdown display on focus
- Filter clearing when input is emptied

### Click Events
- Option selection updates input value and selected state
- Triggers immediate filter application
- Click-outside behavior closes dropdowns

## Data Integration

### Projects Data
- Fetches from `getProjectsData({})` function
- Validates coordinates using `hasValidCoordinates()`
- Creates structured options with PCC number and display text

### Static Options
Predefined options for:
- **Project Status**: Completed, Live, Archived, Cancelled, Suspended, In Progress
- **Employee Type**: Full Time, Contract
- **Resource Status**: Active, Inactive, On Bench

## Global Export

### window.filterManager
Exported object providing:
- `initializeDropdowns()`: Initialize all dropdown UI
- `populateDropdownOptions()`: Load data into dropdowns
- `collectFilters()`: Get current filter state
- `resetAllFilters()`: Clear all filters
- `applyFilters()`: Apply filter changes

## Error Handling
- Validates dropdown elements exist before setup
- Handles missing or invalid option data gracefully
- Provides console error logging for debugging
- Continues operation even if some dropdowns fail to initialize

## Dependencies
- **data.js**: `hasValidCoordinates()` function
- **zohoApiService.js**: `getProjectsData()` function
- **map.js**: `loadAndDisplayData()` function for applying filters

## Notes
- Simplified version focusing on projects data (resources and billing commented out)
- Supports both widget and standalone modes
- Implements defensive programming with data validation
- Uses consistent naming conventions across all dropdown types