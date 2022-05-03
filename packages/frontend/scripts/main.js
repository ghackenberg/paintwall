// CONSTANTS

const browseScreen = new BrowseScreen()
const paintScreen = new PaintScreen()
const errorScreen = new ErrorScreen()

// FUNCTIONS

/**
 * Fired when the page was loaded.
 */
function handleLoad() {
    // Initialize
    initializeHistory()
    // Overwrite
    overwriteHistoryPushState()
    overwriteHistoryReplaceState()
    // Route
    route()
}

/**
 * Fired, e.g., when the back button is pressed
 */
function handlePopState() {
    // Route
    route()
}

// CALLS

// Service workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/scripts/services/cache.js', { scope: '/' })
}

// Event listeners
window.addEventListener('load', handleLoad)
window.addEventListener('popstate', handlePopState)