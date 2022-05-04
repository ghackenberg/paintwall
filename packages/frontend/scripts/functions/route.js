// FUNCTIONS

function route() {
    // Switch
    if (location.pathname.startsWith(base + '/canvas/')) {
        paintScreen.show()
    } else if (location.pathname == base + '/') {
        browseScreen.show()
    } else {
        errorScreen.show()
    }
}