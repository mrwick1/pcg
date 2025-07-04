# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PCG is a web-based map visualization application that displays projects, resources, and billing locations on an interactive Google Maps interface. The application allows users to filter and search locations across three data categories and includes route planning functionality.

## Architecture

The application follows a modular JavaScript architecture with separate concerns:

- **Data Layer**: Three independent mock APIs for projects, resources, and billing locations (`js/mockApi.js`)
- **UI Management**: Separate managers for filters (`js/filters.js`), map functionality (`js/map.js`), and route planning (`js/routes.js`)
- **Application Initialization**: Main app controller (`js/app.js`) that coordinates all modules
- **Styling**: CSS custom properties for consistent theming (`css/style.css`)

### Key Components

- **Filter System**: Searchable dropdown filters for each data category with real-time search
- **Map Integration**: Google Maps API with custom markers (P=Project, R=Resource, B=Billing)
- **Route Planning**: Multi-waypoint route calculation with Google Directions API
- **Responsive Design**: Mobile-friendly interface with collapsible sidebar

### Data Structure

Three separate APIs provide:
- **Projects**: ID, name, address, coordinates, calculated status based on business logic
- **Resources**: ID, name, address, coordinates, resource_location, role, resource_status  
- **Billing**: ID, name, address, coordinates, billing_location

## Development Workflow

**IMPORTANT CODE CHANGES**: Always make changes to files in the root `js/` and `css/` directories only. The widget packaging process automatically copies these to the `widget/app/` directory, so changes made directly in `widget/app/` will be overwritten.

### Zoho Creator Widget Packaging Process
**IMPORTANT**: When validating and packing the widget, always follow this EXACT process:

#### Method 1: Custom Script (Recommended)
1. Run the custom packing script: `./pack-widget.sh`
   - This automatically handles all steps below
   - Creates a unique filename to avoid browser cache issues
   - Example output: `widget_20250624_233835_e4ea36ba.zip`

#### Method 2: Manual Process
1. Remove existing `css` and `js` folders from the `widget/app/` directory
2. Copy the latest `css` and `js` folders from the root directory to the `widget/app/` directory
3. Run `zet validate` to check widget structure
4. Run `zet pack` to create the widget.zip file
5. Both commands must succeed before the widget can be installed

**Cache Busting**: The custom script generates unique filenames with timestamps and random IDs to ensure browsers don't cache old widget versions. This is crucial for development and debugging.

This ensures the widget always uses the latest code and is properly validated and packaged for Zoho Creator deployment.

### Google Maps API
- Uses Google Maps JavaScript API with custom markers
- Requires API key (currently exposed in widget.html)
- Map ID: 'fb4518226e59c4892eee2d21' for advanced markers
- **API Key Domain Restrictions**: If you encounter `ApiTargetBlockedMapError`, the API key has domain restrictions. Add your domain to the API key's allowed domains in Google Cloud Console, or use a different API key without domain restrictions for development.

### Module Dependencies
- Scripts load in specific order: zohoApiService → geocoding → map → filters → routes → data → app
- Each module exposes a global manager object (filterManager, routeManager)
- Event listeners are set up in app.js after DOM content loads

### Filter System
- Each filter type has its own dropdown with search functionality
- Filters are applied independently and trigger data refresh
- Project search filters by both ID and name using actual Zoho Creator field names

### Route Planning
- Supports start/end points plus multiple waypoints
- Integrates with all location types (projects, resources, billing)
- Generates optimized routes via Google Directions API
- Can export routes to Google Maps

### Zoho Creator Integration
- Uses Widget SDK v2.0 for API access
- Connects to real Zoho Creator reports: All_Projects, All_Customers, All_Billing_Locations
- Maps actual field names from Zoho Creator to widget data structure
- Includes CSP configuration in plugin-manifest.json for Google Maps API access

## File Structure

### Widget Files (app/ directory)
- `widget.html` - Main widget HTML with all UI components
- `css/style.css` - Complete styling with CSS custom properties
- `js/app.js` - Application initialization and UI coordination
- `js/zohoApiService.js` - Zoho Creator API integration and data processing
- `js/geocoding.js` - Address geocoding utilities
- `js/filters.js` - Filter dropdown management and search functionality
- `js/map.js` - Google Maps integration and marker management
- `js/routes.js` - Route planning and directions functionality
- `js/data.js` - Data utilities and management

### Widget Configuration
- `plugin-manifest.json` - Widget configuration and CSP settings for Zoho Creator
- `dist/widget.zip` - Packaged widget file for installation

## Key Patterns

- **Event-Driven Architecture**: Heavy use of addEventListener for UI interactions
- **Async/Await**: All API calls use async patterns with Promise.all for concurrent requests
- **Manager Pattern**: Each major feature area has a dedicated manager object
- **Separation of Concerns**: Clear boundaries between data, UI, and mapping logic

## Zoho Creator Data Structure Mapping

### Project Data (All_Projects report)
- `Project_Number` → Project ID/PCC Number
- `Loss_Location_Street_Address` → Project address for geocoding (required for status classification)
- `Latitude`, `Longitude` → Project coordinates (required for status classification)
- `Project_Name` → Project name
- `Project_Completed` → Boolean flag for completed projects
- `PS_5.Transmitted_Report_and_Invoice_to_the_Client` → Transmission status
- `PS_5.Project_Cancelled` → Cancellation flag
- `PS_5.Project_Cancelled_Date` → Cancellation date
- `PS_5.Project_Suspended` → Suspension status
- `PS_5.Suspended_Projects_Released_On` → Suspension release date
- `Type_of_Report` → Project type
- `Account_Name` → Client/Account name
- `Claim_Number`, `Insurer`, `Contact_Name` → Additional project details

### Project Status Calculation Logic
Project status is calculated based on business logic conditions:

**Completed Projects:**
- Loss_Location_Street_Address is not empty
- Latitude is not empty
- Longitude is not empty
- Project_Completed is true

**Live Projects:**
- Loss_Location_Street_Address is not empty
- Latitude is not empty
- Longitude is not empty
- PS_5.Transmitted_Report_and_Invoice_to_the_Client is empty
- PS_5.Project_Cancelled is false
- PS_5.Project_Cancelled_Date is empty
- PS_5.Project_Suspended is empty

**Archived Projects:**
- Loss_Location_Street_Address is not empty
- Latitude is not empty
- Longitude is not empty
- PS_5.Transmitted_Report_and_Invoice_to_the_Client is not empty
- PS_5.Project_Cancelled is false

**Cancelled Projects:**
- Loss_Location_Street_Address is not empty
- Latitude is not empty
- Longitude is not empty
- PS_5.Project_Cancelled is true
- PS_5.Project_Cancelled_Date is not empty

**Suspended Projects:**
- Loss_Location_Street_Address is not empty
- Latitude is not empty
- Longitude is not empty
- PS_5.Project_Suspended is not empty
- PS_5.Transmitted_Report_and_Invoice_to_the_Client is empty
- PS_5.Suspended_Projects_Released_On is empty

### Customer Data (All_Customers report)
- `Employe_Name.first_name`, `Employe_Name.last_name` → Employee name
- `User_Role` → Employee role
- `Employee_Type` → Employment type
- `Status` → Employee status
- `Permanent_Address`, `Temporary_Address` → Address objects with nested fields

### Billing Data (All_Billing_Locations report)
- `Address.zc_display_value` → Full address string
- `Address.latitude`, `Address.longitude` → Existing coordinates (no geocoding needed)
- `Code_ID` → Location identifier
- `Population` → Area population
- `Status` → Location status