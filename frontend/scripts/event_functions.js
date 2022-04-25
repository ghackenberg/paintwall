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
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    draw()
}
function handleHashChange() {
    socket && socket.close()
    initialize()
    connect()
    draw()
}
window.addEventListener('load', handleLoad)
window.addEventListener('resize', handleResize)
window.addEventListener('hashchange', handleHashChange)

// Event functions (canvas)

function handleMouseDown(event) {
    startLine(event.cientX, event.clientY)
}
function handleMouseMove(event) {
    if (event.buttons > 0) {
        continueLine(event.clientX, event.clientY)
    }
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'move', data: { x: event.clientX, y: event.clientY } }))
    }
}
function handleMouseOver(event) {
    if (event.buttons > 0) {
        startLine(event.clientX, event.clientY)
    }
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'over', data: { x: event.clientX, y: event.clientY } }))
    }
}
function handleMouseOut(event) {
    if (event.buttons > 0) {
        continueLine(event.clientX, event.clientY)
    }
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'out' }))
    }
}
function handleTouchStart(event) {
    if (event.touches.length == 1) {
        startLine(event.touches[0].clientX, event.touches[0].clientY)
    }
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'over', data: { x: event.touches[0].clientX, y: event.touches[0].clientY } }))
    }
}
function handleTouchMove(event) {
    if (event.touches.length == 1) {
        continueLine(event.touches[0].clientX, event.touches[0].clientY)
    }
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'move', data: { x: event.touches[0].clientX, y: event.touches[0].clientY } }))
    }
}
function handleTouchEnd(event) {
    if (event.touches.length == 1) {
        continueLine(event.touches[0].clientX, event.touches[0].clientY)
    }
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'out' }))
    }
}
canvas.addEventListener('mousedown', handleMouseDown)
canvas.addEventListener('mousemove', handleMouseMove)
canvas.addEventListener('mouseover', handleMouseOver)
canvas.addEventListener('mouseout', handleMouseOut)
canvas.addEventListener('touchstart', handleTouchStart)
canvas.addEventListener('touchmove', handleTouchMove)
canvas.addEventListener('touchend', handleTouchEnd)

// Event functions (input)

function handleChange(event) {
    color = event.target.value
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'color', data: color}))
    }
}
input.addEventListener('change', handleChange)