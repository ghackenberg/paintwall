// FUNCTIONS

function draw(canvas, center, zoom, lines, clients) {
    // Context
    const context = canvas.getContext('2d')

    // Clear
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Draw
    drawGrid(canvas, context, center, zoom)
    drawLines(canvas, context, center, zoom, lines)
    drawClients(canvas, context, center, zoom, clients)
}

function drawGrid(canvas, context, center, zoom) {
    // Delta parameter
    var delta = 1
    while (delta * zoom > 15) {
        delta /= 5
    }
    while (delta * zoom < 15) {
        delta *= 5
    }

    // Other parameters
    const width = canvas.width / zoom
    const height = canvas.height / zoom
    const x0 = center.x - width / 2
    const y0 = center.y - height / 2
    const sx = Math.floor(x0 / delta) * delta
    const sy = Math.floor(y0 / delta) * delta
    const stepsX = width / delta
    const stepsY = height / delta

    // Vertical lines
    for (var stepX = 0; stepX < stepsX; stepX += 1) {
        // Project
        const x = projectX(canvas, center, zoom, sx + stepX * delta)

        // Path
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, canvas.height)

        // Style
        context.globalAlpha = (sx + stepX * delta) % (delta * 5) ? 0.1 : 0.2
        context.strokeStyle = 'black'
        context.lineWidth = 1

        // Stroke
        context.stroke()
    }

    // Horizontal lines
    for (var stepY = 0; stepY < stepsY; stepY += 1) {
        // Project
        const y = projectY(canvas, center, zoom, sy + stepY * delta)

        // Path
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(canvas.width, y)

        // Style
        context.globalAlpha = (sy + stepY * delta) % (delta * 5) ? 0.1 : 0.2
        context.strokeStyle = 'black'
        context.lineWidth = 1

        // Stroke
        context.stroke()
    }
}

function drawLines(canvas, context, center, zoom, lines) {
    for (const line of Object.values(lines)) {
        drawLine(canvas, context, center, zoom, line)
    }
}

function drawLine(canvas, context, center, zoom, line) {
    // Extract
    const points = line.points
    const color = line.color
    const width = line.width
    const alpha = line.alpha

    // Check
    if (points.length > 1) {
        // Path
        context.beginPath()
        const first = points[0]
        context.moveTo(projectX(canvas, center, zoom, first.x), projectY(canvas, center, zoom, first.y))
        for (var innerIndex = 1; innerIndex < points.length; innerIndex++) {
            const next = points[innerIndex]
            context.lineTo(projectX(canvas, center, zoom, next.x), projectY(canvas, center, zoom, next.y))
        }

        // Style
        context.globalAlpha = alpha
        context.strokeStyle = color
        context.lineWidth = width
        context.lineCap = 'round'

        // Stroke
        context.stroke()
    }
}

function drawClients(canvas, context, center, zoom, clients) {
    for (const client of Object.values(clients)) {
        drawClient(canvas, context, center, zoom, client)
    }
}

function drawClient(canvas, context, center, zoom, client) {
    // Extract
    const name = client.name
    const color = client.color
    const width = client.width
    const alpha = client.alpha
    const position = client.position

    // Check
    if (position) {
        // Circle
        context.beginPath()
        context.arc(projectX(canvas, center, zoom, position.x), projectY(canvas, center, zoom, position.y), 10 * zoom, 0, Math.PI * 2)
        context.globalAlpha = 0.25
        context.fillStyle = color
        context.fill()

        // Text
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.globalAlpha = 0.75
        context.fillStyle = 'black'
        context.fillText(name, projectX(canvas, center, zoom, position.x), projectY(canvas, center, zoom, position.y))
    }
}

function projectX(canvas, center, zoom, x) {
    // Prepare
    const cx = canvas.width / 2
    const dx = x - center.x
    // Return
    return cx + dx * zoom
}

function projectY(canvas, center, zoom, y) {
    // Prepare
    const cy = canvas.height / 2
    const dy = y - center.y
    // Return
    return cy + dy * zoom
}

function unprojectX(canvas, center, zoom, x) {
    return (x - canvas.width / 2) / zoom + center.x
}

function unprojectY(canvas, center, zoom, y) {
    return (y - canvas.height / 2) / zoom + center.y
}