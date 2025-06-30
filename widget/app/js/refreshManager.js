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
        console.log('🔄 Initializing refresh manager...');
        
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
        console.log('🔍 Element check:');
        console.log('  - Modal:', !!this.modal);
        console.log('  - Loading overlay:', !!this.loadingOverlay);
        console.log('  - Refresh button:', !!this.refreshButton);
        console.log('  - Confirm button:', !!this.confirmButton);
        console.log('  - Cancel button:', !!this.cancelButton);
        console.log('  - Close button:', !!this.closeButton);
        console.log('  - Legend toggle:', !!this.legendToggle);
        console.log('  - Legend content:', !!this.legendContent);
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('✅ Refresh manager initialized');
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
        console.log('📋 Showing refresh confirmation modal');
        console.log('📋 Modal element found:', !!this.modal);
        
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
            
            console.log('📋 Modal displayed with forced styles applied');
        } else {
            console.error('❌ Modal element not found! Using fallback confirmation...');
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
        console.log('📋 Hiding refresh confirmation modal');
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    },
    
    // Show loading overlay
    showLoadingOverlay() {
        console.log('⏳ Showing loading overlay');
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
        console.log('✅ Hiding loading overlay');
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    },
    
    // Perform the actual refresh
    async performRefresh() {
        console.log('🔄 Starting data refresh process...');
        
        try {
            // Show loading overlay
            this.showLoadingOverlay();
            
            // Step 1: Force refresh IndexedDB metadata
            if (window.indexedDBService) {
                console.log('🗑️ Clearing sync metadata to force refresh...');
                await window.indexedDBService.forceRefresh();
            }
            
            // Step 2: Get fresh data (this will trigger API calls)
            console.log('📥 Fetching fresh data from API...');
            const result = await window.getProjectsData({});
            
            if (result.success) {
                console.log(`✅ Successfully refreshed ${result.total} projects`);
                
                // Step 3: Reload all UI components
                console.log('🔄 Reloading UI components...');
                await this.refreshUIComponents();
                
                // Show success message briefly
                this.showSuccessMessage(result.total);
            } else {
                console.log('❌ Refresh failed:', result.error);
                this.showErrorMessage(result.error || 'Unknown error occurred');
            }
            
        } catch (error) {
            console.error('❌ Refresh process failed:', error);
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
                console.log('🗺️ Refreshing map data...');
                await window.mapManager.loadAndDisplayData();
            }
            
            // Refresh route options
            if (window.routeManager && window.routeManager.populateRouteOptions) {
                console.log('🛣️ Refreshing route options...');
                await window.routeManager.populateRouteOptions();
            }
            
            // Refresh filters
            if (window.filterManager && window.filterManager.refreshFilterOptions) {
                console.log('🔍 Refreshing filter options...');
                await window.filterManager.refreshFilterOptions();
            }
            
            console.log('✅ All UI components refreshed');
            
        } catch (error) {
            console.error('❌ Error refreshing UI components:', error);
        }
    },
    
    // Show success message
    showSuccessMessage(recordCount) {
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
            Updated ${recordCount} records from Zoho Creator
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
                console.log('📋 Legend expanded');
            } else {
                this.legendContent.classList.add('collapsed');
                this.legendToggle.textContent = '+';
                console.log('📋 Legend collapsed');
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