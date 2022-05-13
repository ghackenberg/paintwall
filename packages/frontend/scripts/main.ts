import { BASE } from 'paintwall-common'
import { initializeHistory, overwriteHistoryPushState, overwriteHistoryReplaceState } from './functions/history'
import { route } from './functions/route'

// FUNCTIONS

/**
 * Fired when the page was loaded.
 */
async function handleLoad() {
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
    navigator.serviceWorker.register(BASE + '/scripts/services/cache.js', { scope: BASE + '/' })
}

// Event listeners
window.addEventListener('load', handleLoad)
window.addEventListener('popstate', handlePopState)