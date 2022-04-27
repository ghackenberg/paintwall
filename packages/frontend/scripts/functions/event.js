// EVENT FUNCTIONS

// Event functions (window)

function handleLoad() {
    if (!location.hash) {
        location.hash = '#' + Math.random().toString(16).substring(2)
    } else {
        initialize()
        connect()
    }
    handleResize()
}
function handleResize() {
    canvasNode.width = window.innerWidth
    canvasNode.height = window.innerHeight
    draw()
}
function handleHashChange() {
    socket && socket.close()
    initialize()
    connect()
    draw()
}

// Event functions (canvas)

function handleMouseDown(event) {
    event.preventDefault()
    startLine(event.cientX, event.clientY)
}
function handleMouseMove(event) {
    event.preventDefault()
    if (event.buttons > 0) {
        continueLine(event.clientX, event.clientY)
    }
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'move', data: { x: event.clientX, y: event.clientY } }))
    }
}
function handleMouseOver(event) {
    event.preventDefault()
    if (event.buttons > 0) {
        startLine(event.clientX, event.clientY)
    }
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'over', data: { x: event.clientX, y: event.clientY } }))
    }
}
function handleMouseOut(event) {
    event.preventDefault()
    if (event.buttons > 0) {
        continueLine(event.clientX, event.clientY)
    }
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'out' }))
    }
}
function handleTouchStart(event) {
    event.preventDefault()
    if (event.touches.length == 1) {
        startLine(event.touches[0].clientX, event.touches[0].clientY)
    }
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'over', data: { x: event.touches[0].clientX, y: event.touches[0].clientY } }))
    }
}
function handleTouchMove(event) {
    event.preventDefault()
    if (event.touches.length == 1) {
        continueLine(event.touches[0].clientX, event.touches[0].clientY)
    }
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'move', data: { x: event.touches[0].clientX, y: event.touches[0].clientY } }))
    }
}
function handleTouchEnd(event) {
    event.preventDefault()
    if (event.touches.length == 1) {
        continueLine(event.touches[0].clientX, event.touches[0].clientY)
    }
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'out' }))
    }
}

// Event functions (input)

function handleChange(event) {
    color = event.target.value
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'color', data: color}))
    }
}