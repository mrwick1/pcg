// Data Refresh Manager
// Handles manual data refresh functionality with confirmation modal

let refreshManager = {
    modal: null,
    loadingOverlay: null,
    refreshButton: null,
    confirmButton: null,
    cancelButton: null,
    closeButton: null,
    legendToggle: null,
    legendContent: null,
    
    // Initialize refresh manager
    init() {
        
        // Get DOM elements
        this.modal = document.getElementById('refresh-modal');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.refreshButton = document.getElementById('refresh-data-btn');
        this.confirmButton = document.getElementById('confirm-refresh-btn');
        this.cancelButton = document.getElementById('cancel-refresh-btn');
        this.closeButton = document.getElementById('modal-close');
        this.legendToggle = document.getElementById('legend-toggle');
        this.legendContent = document.getElementById('legend-content');
        
        // Debug: Check which elements were found
        
        // Set up event listeners
        this.setupEventListeners();
        
    },
    
    // Set up all event listeners
    setupEventListeners() {
        // Refresh button click
        if (this.refreshButton) {
            this.refreshButton.addEventListener('click', () => {
                this.showConfirmationModal();
            });
        }
        
        // Modal confirm button
        if (this.confirmButton) {
            this.confirmButton.addEventListener('click', () => {
                this.hideConfirmationModal();
                this.performRefresh();
            });
        }
        
        // Modal cancel button
        if (this.cancelButton) {
            this.cancelButton.addEventListener('click', () => {
                this.hideConfirmationModal();
            });
        }
        
        // Modal close button
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.hideConfirmationModal();
            });
        }
        
        // Modal background click to close
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hideConfirmationModal();
                }
            });
        }
        
        // Legend toggle
        if (this.legendToggle) {
            this.legendToggle.addEventListener('click', () => {
                this.toggleLegend();
            });
        }
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideConfirmationModal();
            }
        });
    },
    
    // Show confirmation modal
    showConfirmationModal() {
        
        if (this.modal) {
            // Force all modal styles via JavaScript
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
            
            // Force modal content styles
            const modalContent = this.modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.cssText = `
                    background: white !important;
                    border-radius: 0.3rem !important;
                    box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
                    max-width: 500px !important;
                    width: 90% !important;
                    max-height: 80vh !important;
                    overflow-y: auto !important;
                    font-family: Arial, sans-serif !important;
                `;
            }
            
            // Force modal header styles
            const modalHeader = this.modal.querySelector('.modal-header');
            if (modalHeader) {
                modalHeader.style.cssText = `
                    padding: 1rem 1.5rem !important;
                    border-bottom: 1px solid #ced4da !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                `;
                
                const headerTitle = modalHeader.querySelector('h3');
                if (headerTitle) {
                    headerTitle.style.cssText = `
                        margin: 0 !important;
                        color: #343a40 !important;
                        font-size: 1.25rem !important;
                        font-weight: 600 !important;
                    `;
                }
                
                const closeBtn = modalHeader.querySelector('.modal-close');
                if (closeBtn) {
                    closeBtn.style.cssText = `
                        font-size: 1.5rem !important;
                        cursor: pointer !important;
                        color: #6c757d !important;
                        line-height: 1 !important;
                        padding: 0.25rem !important;
                        background: none !important;
                        border: none !important;
                    `;
                }
            }
            
            // Force modal body styles
            const modalBody = this.modal.querySelector('.modal-body');
            if (modalBody) {
                modalBody.style.cssText = `
                    padding: 1.5rem !important;
                    color: #343a40 !important;
                    line-height: 1.5 !important;
                `;
                
                const paragraphs = modalBody.querySelectorAll('p');
                paragraphs.forEach(p => {
                    p.style.cssText = `
                        margin: 0 0 1rem 0 !important;
                        color: #343a40 !important;
                    `;
                });
                
                const lists = modalBody.querySelectorAll('ul');
                lists.forEach(ul => {
                    ul.style.cssText = `
                        margin: 0 0 1rem 0 !important;
                        padding-left: 1.5rem !important;
                    `;
                });
                
                const listItems = modalBody.querySelectorAll('li');
                listItems.forEach(li => {
                    li.style.cssText = `
                        margin-bottom: 0.5rem !important;
                        color: #343a40 !important;
                    `;
                });
                
                const emphasis = modalBody.querySelectorAll('em');
                emphasis.forEach(em => {
                    em.style.cssText = `
                        color: #6c757d !important;
                        font-size: 0.9rem !important;
                    `;
                });
            }
            
            // Force modal footer styles
            const modalFooter = this.modal.querySelector('.modal-footer');
            if (modalFooter) {
                modalFooter.style.cssText = `
                    padding: 1rem 1.5rem !important;
                    border-top: 1px solid #ced4da !important;
                    display: flex !important;
                    gap: 1rem !important;
                    justify-content: flex-end !important;
                `;
                
                const buttons = modalFooter.querySelectorAll('button');
                buttons.forEach(btn => {
                    btn.style.cssText = `
                        padding: 0.5rem 1rem !important;
                        border: none !important;
                        border-radius: 0.3rem !important;
                        cursor: pointer !important;
                        font-size: 0.9rem !important;
                        transition: background-color 0.2s !important;
                        font-family: Arial, sans-serif !important;
                    `;
                    
                    if (btn.classList.contains('confirm-btn')) {
                        btn.style.backgroundColor = '#1d508e !important';
                        btn.style.color = 'white !important';
                    } else if (btn.classList.contains('cancel-btn')) {
                        btn.style.backgroundColor = '#6c757d !important';
                        btn.style.color = 'white !important';
                    }
                });
            }
            
        } else {
            // Fallback to browser confirm dialog
            const confirmed = confirm(
                'Refresh Data\n\n' +
                'Are you sure you want to refresh the data?\n\n' +
                'This will:\n' +
                '• Clear all cached data from your browser\n' +
                '• Fetch fresh data from Zoho Creator (may take a moment)\n' +
                '• Update all maps and filters with the latest information\n\n' +
                'Note: This action will make API calls to get the latest data.'
            );
            
            if (confirmed) {
                this.performRefresh();
            }
        }
    },
    
    // Hide confirmation modal
    hideConfirmationModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    },
    
    // Show loading overlay
    showLoadingOverlay() {
        if (this.loadingOverlay) {
            // Force all loading overlay styles
            this.loadingOverlay.style.cssText = `
                display: flex !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background-color: rgba(0, 0, 0, 0.8) !important;
                z-index: 15000 !important;
                align-items: center !important;
                justify-content: center !important;
            `;
            
            // Force loading content styles
            const loadingContent = this.loadingOverlay.querySelector('.loading-content');
            if (loadingContent) {
                loadingContent.style.cssText = `
                    background: white !important;
                    padding: 2rem !important;
                    border-radius: 0.3rem !important;
                    text-align: center !important;
                    box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
                    max-width: 400px !important;
                    width: 90% !important;
                    font-family: Arial, sans-serif !important;
                `;
                
                const paragraphs = loadingContent.querySelectorAll('p');
                paragraphs.forEach(p => {
                    p.style.cssText = `
                        margin: 0.5rem 0 !important;
                        color: #343a40 !important;
                    `;
                    
                    if (p.classList.contains('loading-details')) {
                        p.style.fontSize = '0.9rem !important';
                        p.style.color = '#6c757d !important';
                    }
                });
            }
            
            // Force loading spinner styles
            const spinner = this.loadingOverlay.querySelector('.loading-spinner');
            if (spinner) {
                spinner.style.cssText = `
                    width: 40px !important;
                    height: 40px !important;
                    border: 4px solid #ced4da !important;
                    border-top: 4px solid #1d508e !important;
                    border-radius: 50% !important;
                    animation: spin 1s linear infinite !important;
                    margin: 0 auto 1rem auto !important;
                `;
            }
        }
    },
    
    // Hide loading overlay
    hideLoadingOverlay() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    },
    
    // Perform the actual refresh
    async performRefresh() {
        
        try {
            // Show loading overlay
            this.showLoadingOverlay();
            
            // Step 1: Force refresh IndexedDB metadata
            console.log('Refresh: Clearing IndexedDB metadata to force fresh API calls...');
            if (window.indexedDBService) {
                await window.indexedDBService.forceRefresh();
            }
            
            // Step 2: Get fresh data (this will trigger API calls for all data types)
            console.log('Refresh: Fetching fresh data from all APIs...');
            
            // Check which functions are available
            console.log('Available functions:', {
                getProjectsData: typeof window.getProjectsData,
                getResourcesData: typeof window.getResourcesData,
                getBillingData: typeof window.getBillingData
            });
            
            let projectsResult, resourcesResult, billingResult;
            
            try {
                // Fetch projects data
                console.log('Refresh: Calling getProjectsData...');
                projectsResult = await window.getProjectsData({});
                console.log('Refresh: Projects result:', projectsResult);
            } catch (error) {
                console.error('Refresh: Projects API error:', error);
                projectsResult = {success: false, total: 0, error: error.message};
            }
            
            try {
                // Fetch resources data
                if (window.getResourcesData) {
                    console.log('Refresh: Calling getResourcesData...');
                    resourcesResult = await window.getResourcesData({});
                    console.log('Refresh: Resources result:', resourcesResult);
                } else {
                    console.log('Refresh: getResourcesData not available, using mock data');
                    resourcesResult = {success: true, total: 0};
                }
            } catch (error) {
                console.error('Refresh: Resources API error:', error);
                resourcesResult = {success: false, total: 0, error: error.message};
            }
            
            try {
                // Fetch billing data
                if (window.getBillingData) {
                    console.log('Refresh: Calling getBillingData...');
                    billingResult = await window.getBillingData({});
                    console.log('Refresh: Billing result:', billingResult);
                } else {
                    console.log('Refresh: getBillingData not available, using mock data');
                    billingResult = {success: true, total: 0};
                }
            } catch (error) {
                console.error('Refresh: Billing API error:', error);
                billingResult = {success: false, total: 0, error: error.message};
            }
            
            console.log('Refresh: Final API results -', {
                projects: projectsResult,
                resources: resourcesResult, 
                billing: billingResult
            });
            
            // Handle different result formats
            const projectsCount = Array.isArray(projectsResult) ? projectsResult.length : (projectsResult.total || projectsResult.data?.length || 0);
            const projectsSuccess = Array.isArray(projectsResult) ? projectsResult.length > 0 : (projectsResult.success !== false);
            
            const resourcesCount = resourcesResult.total || resourcesResult.data?.length || 0;
            const resourcesSuccess = resourcesResult.success !== false;
            
            const billingCount = billingResult.total || billingResult.data?.length || 0;
            const billingSuccess = billingResult.success !== false;
            
            const result = {
                success: projectsSuccess && resourcesSuccess && billingSuccess,
                total: projectsCount + resourcesCount + billingCount,
                projects: projectsCount,
                resources: resourcesCount,
                billing: billingCount,
                error: projectsResult.error || resourcesResult.error || billingResult.error
            };
            
            console.log('Refresh: Combined result:', result);
            
            if (result.success) {
                console.log('Refresh: Success - proceeding to refresh UI components');
                
                // Step 3: Reload all UI components
                await this.refreshUIComponents();
                
                // Show success message briefly
                this.showSuccessMessage(result);
            } else {
                console.error('Refresh: Failed -', result);
                const errorMessage = result.error || 'Unknown error occurred';
                console.error('Refresh: Error message:', errorMessage);
                this.showErrorMessage(errorMessage);
            }
            
        } catch (error) {
            console.error('Refresh: Exception caught:', error);
            this.showErrorMessage(error.message || 'Refresh failed');
        } finally {
            // Always hide loading overlay
            this.hideLoadingOverlay();
        }
    },
    
    // Refresh all UI components with new data
    async refreshUIComponents() {
        try {
            // Refresh map data
            if (window.mapManager && window.mapManager.loadAndDisplayData) {
                await window.mapManager.loadAndDisplayData();
            }
            
            // Refresh route options
            if (window.routeManager && window.routeManager.populateRouteOptions) {
                await window.routeManager.populateRouteOptions();
            }
            
            // Refresh filters
            if (window.filterManager && window.filterManager.populateDropdownOptions) {
                await window.filterManager.populateDropdownOptions();
            }
            
            
        } catch (error) {
        }
    },
    
    // Show success message
    showSuccessMessage(result) {
        // Handle both old format (number) and new format (object)
        let messageContent;
        if (typeof result === 'number') {
            messageContent = `Updated ${result} records from Zoho Creator`;
        } else {
            const total = result.total || 0;
            const breakdown = [];
            if (result.projects > 0) breakdown.push(`${result.projects} projects`);
            if (result.resources > 0) breakdown.push(`${result.resources} resources`);
            if (result.billing > 0) breakdown.push(`${result.billing} billing locations`);
            
            messageContent = `Updated ${total} total records:<br>
                <small style="margin-left: 10px;">${breakdown.join(', ')}</small>`;
        }
        
        // Create temporary success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.3rem;
            box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
            z-index: 20000;
            font-family: Arial, sans-serif;
            font-size: 0.9rem;
        `;
        notification.innerHTML = `
            <strong>✅ Data Refreshed Successfully!</strong><br>
            ${messageContent}
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 4000);
    },
    
    // Show error message
    showErrorMessage(error) {
        // Create temporary error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.3rem;
            box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
            z-index: 20000;
            font-family: Arial, sans-serif;
            font-size: 0.9rem;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <strong>❌ Refresh Failed</strong><br>
            ${error}
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 6 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 6000);
    },
    
    // Toggle legend visibility
    toggleLegend() {
        if (this.legendContent && this.legendToggle) {
            const isCollapsed = this.legendContent.classList.contains('collapsed');
            
            if (isCollapsed) {
                this.legendContent.classList.remove('collapsed');
                this.legendToggle.textContent = '−';
            } else {
                this.legendContent.classList.add('collapsed');
                this.legendToggle.textContent = '+';
            }
        }
    }
};

// Add CSS animation for spinner
function addSpinnerAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add spinner animation CSS
    addSpinnerAnimation();
    
    // Wait a moment for other components to initialize
    setTimeout(() => {
        refreshManager.init();
    }, 100);
});

// Export for global access
window.refreshManager = refreshManager;