// VARIABLES

var auth0 = null
var user = null

// CONSTANTS

const base = '/paintwall'

const loadScreen = new LoadScreen()
const errorScreen = new ErrorScreen()
const browseScreen = new BrowseScreen()
const paintScreen = new PaintScreen()
const imprintScreen = new ImprintScreen()
const dataScreen = new DataScreen()
const termsScreen = new TermsScreen()

loadScreen.show()

// FUNCTIONS

async function tryAuthorize() {
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
        // Set user
        user = await auth0.getUser()
    } catch (error) {
        // Set user
        user = null
    }
    // Dispatch event
    window.dispatchEvent(new Event('authorize'))
}

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
    navigator.serviceWorker.register(base + '/scripts/services/cache.js', { scope: base + '/' })
}

// Event listeners
window.addEventListener('load', handleLoad)
window.addEventListener('popstate', handlePopState)

// Try authorize
tryAuthorize()