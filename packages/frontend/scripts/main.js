// CONSTANTS

const base = '/paintwall'

const browseScreen = new BrowseScreen()
const paintScreen = new PaintScreen()
const errorScreen = new ErrorScreen()

// VARIABLES

var auth0
var user

// FUNCTIONS

/**
 * Fired when the page was loaded.
 */
async function handleLoad() {
    try {
        // Initialize client
        auth0 = await createAuth0Client({
            domain: 'dev-8ofzuw88.eu.auth0.com',
            client_id: 'Mb7Zkpw9y5Cmh1wYcr25P2TyHK76P5za'
        })
        // Check redirect query parameters
        if (location.search.includes('code=') && location.search.includes('state=')) {
            // Process code and state query parameters
            await auth0.handleRedirectCallback()
            // Remove code and state query parameters
            history.replaceState(null, undefined, location.pathname)
        }
        // Retrieve user
        user = await auth0.getUser()   
    } catch (error) {
        console.error(error)
    }
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
    navigator.serviceWorker.register(base + '/scripts/services/cache.js', { scope: base + '/' })
}

// Event listeners
window.addEventListener('load', handleLoad)
window.addEventListener('popstate', handlePopState)