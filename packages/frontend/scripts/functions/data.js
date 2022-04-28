// DATA FUNCTIONS

function initialize() {
    clientName = localStorage.getItem('name') || 'Anonymous'
    clientName = prompt("How do you want to be called?", clientName) || 'Anonymous'
    
    localStorage.setItem('name', clientName)

    canvasId = location.hash.substring(location.hash.indexOf('/') + 1)

    names = {}
    colors = {}
    widths = {}
    alphas = {}
    positions = {}
    lines = {}

    initializeQRCode()
}

function initializeQRCode() {
    const data = { text: location.href, width: 128, height: 128 }
    if (!qrcode) {
        qrcode = new QRCode(qrcodeNode, data)
    } else {
        qrcode.clear()
        qrcode.makeCode(data)
    }
}

function startLine(x, y) {
    const point = { x, y }
    lineId = '' + Math.random().toString(16).substring(2)
    points = [point]
    lines[lineId] = { lineId, clientId, points, color, width, alpha }
    draw()
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'start', data: { lineId, point } }))
    }
}

function continueLine(x, y) {
    const point = { x, y }
    points.push(point)
    draw()
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'continue', data: { lineId, point } }))
    }
}