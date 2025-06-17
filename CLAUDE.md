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

Three separate mock APIs provide:
- **Projects**: ID, name, address, coordinates, project_status
- **Resources**: ID, name, address, coordinates, resource_location, role, resource_status  
- **Billing**: ID, name, address, coordinates, billing_location

## Development Workflow

### Google Maps API
- Uses Google Maps JavaScript API with custom markers
- Requires API key (currently exposed in index.html:14)
- Map ID: 'DEMO_MAP_ID' for advanced markers

### Module Dependencies
- Scripts load in specific order: mockApi → map → filters → routes → data → app
- Each module exposes a global manager object (filterManager, routeManager)
- Event listeners are set up in app.js after DOM content loads

### Filter System
- Each filter type has its own dropdown with search functionality
- Filters are applied independently and trigger data refresh
- Project search filters by both ID and name

### Route Planning
- Supports start/end points plus multiple waypoints
- Integrates with all location types (projects, resources, billing)
- Generates optimized routes via Google Directions API
- Can export routes to Google Maps

## File Structure

- `index.html` - Main HTML with all UI components
- `css/style.css` - Complete styling with CSS custom properties
- `js/app.js` - Application initialization and UI coordination
- `js/mockApi.js` - Three separate mock APIs with utility functions
- `js/filters.js` - Filter dropdown management and search functionality
- `js/map.js` - Google Maps integration and marker management
- `js/routes.js` - Route planning and directions functionality
- `js/data.js` - Currently minimal, placeholder for data utilities

## Key Patterns

- **Event-Driven Architecture**: Heavy use of addEventListener for UI interactions
- **Async/Await**: All API calls use async patterns with Promise.all for concurrent requests
- **Manager Pattern**: Each major feature area has a dedicated manager object
- **Separation of Concerns**: Clear boundaries between data, UI, and mapping logic