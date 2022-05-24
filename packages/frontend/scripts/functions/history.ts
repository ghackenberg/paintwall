import { BASE } from 'paintwall-common'
import { route } from './route'

export function initializeHistory() {
    if (location.pathname.startsWith(BASE + '/canvas/')) {
        // Remember
        const pathname = location.pathname
        // Replace
        history.replaceState(null, undefined, BASE + '/')
        // Push
        history.pushState(null, undefined, pathname)
    } else if (location.pathname == BASE + '/profile') {
        // Remember
        const pathname = location.pathname
        // Replace
        history.replaceState(null, undefined, BASE + '/')
        // Push
        history.pushState(null, undefined, pathname)
    } else if (location.pathname == BASE + '/imprint') {
        // Remember
        const pathname = location.pathname
        // Replace
        history.replaceState(null, undefined, BASE + '/')
        // Push
        history.pushState(null, undefined, pathname)
    } else if (location.pathname == BASE + '/data-protection') {
        // Remember
        const pathname = location.pathname
        // Replace
        history.replaceState(null, undefined, BASE + '/')
        // Push
        history.pushState(null, undefined, pathname)
    } else if (location.pathname == BASE + '/terms-of-use') {
        // Remember
        const pathname = location.pathname
        // Replace
        history.replaceState(null, undefined, BASE + '/')
        // Push
        history.pushState(null, undefined, pathname)
    } else if (location.pathname != BASE + '/') {
        // Replace
        history.replaceState(null, undefined, BASE + '/')
    }
}

export function overwriteHistoryPushState() {
    // Remember
    const pushState = history.pushState
    // Overwrite
    history.pushState = function(data, unused, url) {
        // Apply
        pushState.apply(history, [data, unused, url])
        // Route
        route()
    }
}

export function overwriteHistoryReplaceState() {
    // Remember
    const replaceState = history.replaceState
    // Overwrite
    history.replaceState = function(data, unused, url) {
        // Apply
        replaceState.apply(history, [data, unused, url])
        // Route
        route()
    }
}