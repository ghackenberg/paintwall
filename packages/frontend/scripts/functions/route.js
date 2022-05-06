// FUNCTIONS

function route() {
    // Switch
    if (location.pathname.startsWith(base + '/canvas/')) {
        paintScreen.show()
    } else if (location.pathname == base + '/imprint') {
        imprintScreen.show()
    } else if (location.pathname == base + '/data-protection') {
        dataScreen.show()
    } else if (location.pathname == base + '/terms-of-use') {
        termsScreen.show()
    } else if (location.pathname == base + '/') {
        browseScreen.show()
    } else {
        errorScreen.show()
    }
}