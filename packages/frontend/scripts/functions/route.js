// FUNCTIONS

function route() {
    // Switch
    if (location.pathname.startsWith('/canvas/')) {
        paintScreen.show()
    } else if (location.pathname == '/') {
        browseScreen.show()
    } else {
        errorScreen.show()
    }
}