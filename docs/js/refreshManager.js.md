# refreshManager.js Documentation

## Overview
Comprehensive data refresh management system providing manual data refresh functionality with confirmation modals, loading states, and UI component coordination. Handles IndexedDB cache invalidation and API data synchronization.

## Module Structure

### refreshManager Object
Central manager object containing all refresh functionality:

```javascript
{
    // DOM Elements
    modal: null,
    loadingOverlay: null,
    refreshButton: null,
    confirmButton: null,
    cancelButton: null,
    closeButton: null,
    legendToggle: null,
    legendContent: null,
    
    // Core Methods
    init(),
    setupEventListeners(),
    showConfirmationModal(),
    hideConfirmationModal(),
    performRefresh(),
    // ... additional methods
}
```

## Core Functions

### init()
Initializes the refresh manager and sets up all DOM element references.

**Process:**
1. Retrieves DOM element references
2. Performs element availability debugging
3. Sets up event listeners
4. Provides comprehensive logging for troubleshooting

**Element Mapping:**
- `refresh-modal`: Confirmation modal container
- `loading-overlay`: Full-screen loading indicator
- `refresh-data-btn`: Trigger button for refresh process
- `confirm-refresh-btn`: Modal confirmation button
- `cancel-refresh-btn`: Modal cancellation button
- `modal-close`: Modal close (X) button
- `legend-toggle`: Legend expand/collapse toggle
- `legend-content`: Legend content container

### setupEventListeners()
Configures all event handlers for user interaction.

**Event Bindings:**
- **Refresh Button Click**: Triggers confirmation modal
- **Modal Confirm**: Initiates refresh process
- **Modal Cancel/Close**: Hides confirmation modal
- **Modal Background Click**: Closes modal when clicking outside
- **Legend Toggle**: Expands/collapses legend
- **Escape Key**: Closes modal for accessibility

## Modal System

### showConfirmationModal()
Displays confirmation modal with comprehensive styling.

**Features:**
- Forced CSS styling via JavaScript to override any conflicts
- Modal positioning and backdrop setup
- Element-by-element style application for reliability
- Fallback to browser confirm dialog if modal unavailable
- Responsive design considerations

**Styling Strategy:**
```javascript
// Forced inline styles for maximum compatibility
this.modal.style.cssText = `
    display: flex !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background-color: rgba(0, 0, 0, 0.6) !important;
    z-index: 10000 !important;
    align-items: center !important;
    justify-content: center !important;
`;
```

### hideConfirmationModal()
Hides the confirmation modal by setting display to none.

### Modal Content Structure
```
Modal Container
├── Modal Content
│   ├── Modal Header
│   │   ├── Title
│   │   └── Close Button
│   ├── Modal Body
│   │   ├── Description
│   │   ├── Feature List
│   │   └── Warning Notes
│   └── Modal Footer
│       ├── Confirm Button
│       └── Cancel Button
```

## Loading State Management

### showLoadingOverlay()
Displays full-screen loading overlay during refresh process.

**Features:**
- Complete viewport coverage with high z-index
- Loading spinner with CSS animation
- Progress messaging
- Forced styling for cross-browser compatibility

### hideLoadingOverlay()
Removes loading overlay after refresh completion.

### Loading Animation
Custom CSS spinner animation:
```css
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

## Data Refresh Process

### performRefresh()
Orchestrates the complete data refresh workflow.

**Process Flow:**
1. **Show Loading**: Display loading overlay with progress message
2. **Force Refresh**: Clear IndexedDB sync metadata to force API calls
3. **Fetch Fresh Data**: Call API to retrieve updated data
4. **Refresh UI Components**: Update all UI elements with new data
5. **Show Results**: Display success/error notifications
6. **Hide Loading**: Remove loading overlay

**Error Handling:**
- Try-catch blocks around each operation
- Comprehensive error logging
- User-friendly error notifications
- Graceful degradation on failures

### refreshUIComponents()
Updates all application components with fresh data.

**Component Updates:**
- **Map Manager**: Refreshes map data and markers
- **Route Manager**: Updates route planning options
- **Filter Manager**: Refreshes filter dropdown options

**Integration Points:**
- `window.mapManager.loadAndDisplayData()`
- `window.routeManager.populateRouteOptions()`
- `window.filterManager.refreshFilterOptions()`

## Notification System

### showSuccessMessage(recordCount)
Creates temporary success notification with auto-removal.

**Features:**
- Fixed positioning in top-right corner
- Record count display
- 4-second auto-removal timer
- Success styling with green background

### showErrorMessage(error)
Creates temporary error notification with extended display time.

**Features:**
- Fixed positioning in top-right corner
- Detailed error message display
- 6-second auto-removal timer
- Error styling with red background
- Maximum width constraints for readability

### Notification Styling
```javascript
{
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '1rem 1.5rem',
    borderRadius: '0.3rem',
    boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.15)',
    zIndex: 20000,
    fontFamily: 'Arial, sans-serif',
    fontSize: '0.9rem'
}
```

## Legend Management

### toggleLegend()
Handles expand/collapse functionality for the map legend.

**Features:**
- CSS class-based state management
- Visual indicator updates (+ / -)
- Smooth transitions via CSS
- State logging for debugging

**State Management:**
- **Collapsed**: `legend-content.collapsed` class added
- **Expanded**: `legend-content.collapsed` class removed
- **Toggle Indicator**: Text content switches between '+' and '−'

## Integration with Core Systems

### IndexedDB Integration
```javascript
// Force refresh by clearing metadata
if (window.indexedDBService) {
    await window.indexedDBService.forceRefresh();
}
```

### API Integration
```javascript
// Trigger fresh data fetch
const result = await window.getProjectsData({});
```

### UI Manager Integration
Coordinates with all major UI components:
- Filter dropdowns
- Map markers and data
- Route planning options
- Legend display

## Global Export

### window.refreshManager
Exported object for global access:
```javascript
{
    init,
    showConfirmationModal,
    performRefresh,
    toggleLegend,
    // ... all other methods
}
```

## Initialization

### DOM Ready Event
```javascript
document.addEventListener('DOMContentLoaded', function() {
    addSpinnerAnimation();
    setTimeout(() => {
        refreshManager.init();
    }, 100);
});
```

**Initialization Delay:**
100ms delay allows other components to initialize first, ensuring proper coordination.

## Error Handling

### Fallback Mechanisms
- Browser confirm dialog if modal fails
- Console error logging for debugging
- Graceful degradation for missing elements
- User notification for all error states

### Comprehensive Logging
- Element availability checking
- Style application confirmation
- Process step completion tracking
- Error state documentation

## Dependencies
- **IndexedDB Service**: For cache invalidation
- **Zoho API Service**: For fresh data fetching
- **Map Manager**: For UI updates
- **Route Manager**: For route option updates
- **Filter Manager**: For filter option updates

## Browser Compatibility
- Modern browsers with ES6+ support
- Fallback to browser dialogs for older browsers
- CSS animation support with graceful degradation
- Cross-browser modal styling via forced inline styles

## Performance Considerations
- Minimal DOM manipulation during refresh
- Efficient notification cleanup
- Optimized CSS animations
- Batched UI updates

## Notes
- Designed for manual user-triggered refreshes
- Provides comprehensive user feedback throughout process
- Maintains application state consistency
- Supports both development and production environments
- Implements accessibility best practices (keyboard support, focus management)