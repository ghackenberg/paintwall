function initializeHistory() {
    if (location.pathname.startsWith(base + '/canvas/')) {
        // Remember
        const pathname = location.pathname
        // Replace
        history.replaceState(null, undefined, base + '/')
        // Push
        history.pushState(null, undefined, pathname)
    } else if (location.pathname == base + '/imprint') {
        // Remember
        const pathname = location.pathname
        // Replace
        history.replaceState(null, undefined, base + '/')
        // Push
        history.pushState(null, undefined, pathname)
    } else if (location.pathname == base + '/data-protection') {
        // Remember
        const pathname = location.pathname
        // Replace
        history.replaceState(null, undefined, base + '/')
        // Push
        history.pushState(null, undefined, pathname)
    } else if (location.pathname == base + '/terms-of-use') {
        // Remember
        const pathname = location.pathname
        // Replace
        history.replaceState(null, undefined, base + '/')
        // Push
        history.pushState(null, undefined, pathname)
    } else if (location.pathname != base + '/') {
        // Replace
        history.replaceState(null, undefined, base + '/')
    }
}

function overwriteHistoryPushState() {
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

function overwriteHistoryReplaceState() {
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