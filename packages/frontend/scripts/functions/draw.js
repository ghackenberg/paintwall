// DRAW FUNCTIONS

function draw(canvas, names, colors, alphas, positions, lines) {
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid(context)
    drawLines(context, lines)
    drawClients(context, names, colors, widths, alphas, positions)
}

function drawGrid(context) {
    // Draw vertical lines
    for (var x = 50; x < canvas.width; x += 50) {
        // Path
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, canvas.height)
        // Style
        context.globalAlpha = x % (50 * 5) ? 0.1 : 0.2
        context.strokeStyle = 'black'
        context.lineWidth = 1
        // Paint
        context.stroke()
    }
    // Draw horizontal lines
    for (var y = 50; y < canvas.height; y += 50) {
        // Path
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(canvas.width, y)
        // Style
        context.globalAlpha = y % (50 * 5) ? 0.1 : 0.2
        context.strokeStyle = 'black'
        context.lineWidth = 1
        // Paint
        context.stroke()
    }
}

function drawLines(context, lines) {
    for (const line of Object.values(lines)) {
        drawLine(context, line)
    }
}

function drawLine(context, line) {
    const points = line.points
    const color = line.color
    const width = line.width
    const alpha = line.alpha
    if (points.length > 1) {
        // Path
        context.beginPath()
        const first = points[0]
        context.moveTo(first.x, first.y)
        for (var innerIndex = 1; innerIndex < points.length; innerIndex++) {
            const next = points[innerIndex]
            context.lineTo(next.x, next.y)
        }
        // Style
        context.globalAlpha = alpha
        context.strokeStyle = color
        context.lineWidth = width
        // Paint
        context.stroke()
    }
}

function drawClients(context, names, colors, widths, alphas, positions) {
    for (const clientId of Object.keys(names)) {
        const name = names[clientId]
        const color = colors[clientId]
        const width = widths[clientId]
        const alpha = alphas[clientId]
        const position = positions[clientId]
        drawClient(context, name, color, width, alpha, position)
    }
}

function drawClient(context, name, color, width, alpha, position) {
    if (position) {
        context.beginPath()
        context.arc(position.x, position.y, 10, 0, Math.PI * 2)
        context.globalAlpha = 0.25
        context.fillStyle = color
        context.fill()

        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.globalAlpha = 0.75
        context.fillStyle = 'black'
        context.fillText(name, position.x, position.y)
    }
}