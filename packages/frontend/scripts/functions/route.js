function route() {
    socket && socket.close()

    if (location.hash.startsWith('#browse')) {

        browseNode.style.display = 'block'
        paintNode.style.display = 'none'

        browse.initialize()

    } else if (location.hash.startsWith('#paint')) {

        browseNode.style.display = 'none'
        paintNode.style.display = 'block'

        paint.initialize()

    } else {

        location.hash = 'browse'

    }
}