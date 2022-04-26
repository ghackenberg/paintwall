// DATA FUNCTIONS

function initialize() {
    canvasId = location.hash.substring(1)

    const data = { text: location.href, width: 128, height: 128 }
    if (!qrcode) {
        qrcode = new QRCode(document.getElementById('div'), data)
    } else {
        qrcode.clear()
        qrcode.makeCode(data)
    }

    names = {}
    colors = {}
    widths = {}
    alphas = {}
    positions = {}
    lines = {}
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