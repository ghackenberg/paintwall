// DATA FUNCTIONS

function initialize() {
    // Client name
    clientName = localStorage.getItem('name') || 'Anonymous'
    clientName = prompt("How do you want to be called?", clientName) || 'Anonymous'
    // Remember client name
    localStorage.setItem('name', clientName)
    // Canvas id
    canvasId = location.hash.substring(location.hash.indexOf('/') + 1)
    // Canvas data
    names = {}
    colors = {}
    widths = {}
    alphas = {}
    positions = {}
    lines = {}
    // Canvas QR-code
    initializeQRCode()
}

function initializeQRCode() {
    const data = { text: location.href, width: 128, height: 128 }
    // Check
    if (!qrcode) {
        qrcode = new QRCode(qrcodeNode, data)
    } else {
        qrcode.clear()
        qrcode.makeCode(data)
    }
}

function startLine(x, y) {
    // Update
    const point = { x, y }
    lineId = '' + Math.random().toString(16).substring(2)
    points = [point]
    lines[lineId] = { lineId, clientId, points, color, width, alpha }
    // Draw
    draw(canvas, names, colors, alphas, positions, lines)
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'start', data: { lineId, point } }))
    }
}

function continueLine(x, y) {
    // Update
    const point = { x, y }
    points.push(point)
    // Draw
    draw(canvas, names, colors, alphas, positions, lines)
    // Forward
    if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'continue', data: { lineId, point } }))
    }
}