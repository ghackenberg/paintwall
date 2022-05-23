import { CircleObject, CircleObjectMap, ClientObject, ClientObjectMap, LineObject, LineObjectMap, StraightLineObject, PointObject, SquareObject, SquareObjectMap, StraightLineObjectMap, TriangleObjectMap, CanvasObject, TriangleObject } from 'paintwall-common'

export function draw(canvas: HTMLCanvasElement, center: PointObject, zoom: number, model: CanvasObject) {
    // Context
    const context = canvas.getContext('2d')

    // Clear
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Draw
    drawGrid(canvas, context, center, zoom)
    drawLines(canvas, context, center, zoom, model.lines)
    drawStraightLines(canvas, context, center, zoom, model.straightLines)
    drawCircles(canvas, context, center, zoom, model.circles)
    drawSquares(canvas, context, center, zoom, model.squares)
    drawTriangles(canvas, context, center, zoom, model.triangles)
    drawClients(canvas, context, center, zoom, model.clients)
}

function drawGrid(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, center: PointObject, zoom: number) {
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
    for (var stepX = 0; stepX < stepsX + 1; stepX += 1) {
        // Project
        const x = projectX(canvas, center, zoom, sx + stepX * delta)

        // Path
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, canvas.height)

        // Style
        context.globalAlpha = (sx + stepX * delta) % (delta * 5) ? 0.1 : 0.2
        context.strokeStyle = 'gray'
        context.lineWidth = 1

        // Stroke
        context.stroke()
    }

    // Horizontal lines
    for (var stepY = 0; stepY < stepsY + 1; stepY += 1) {
        // Project
        const y = projectY(canvas, center, zoom, sy + stepY * delta)

        // Path
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(canvas.width, y)

        // Style
        context.globalAlpha = (sy + stepY * delta) % (delta * 5) ? 0.1 : 0.2
        context.strokeStyle = 'gray'
        context.lineWidth = 1

        // Stroke
        context.stroke()
    }
}

function drawLines(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, center: PointObject, zoom: number, lines: LineObjectMap) {
    for (const line of Object.values(lines)) {
        drawLine(canvas, context, center, zoom, line)
    }
}

function drawLine(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, center: PointObject, zoom: number, line: LineObject) {
    // Extract
    const points = line.points
    const color = line.color
    const width = line.width
    const alpha = line.alpha

    // Check
    if (points.length == 1) {
        // Path
        context.beginPath()
        const first = points[0]
        context.arc(projectX(canvas, center, zoom, first.x), projectY(canvas, center, zoom, first.y), Math.max(width * zoom, 1) / 2, 0, Math.PI * 2)

        // Style
        context.globalAlpha = alpha
        context.fillStyle = color
        context.fill()
    } else if (points.length > 1) {
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
        context.lineWidth = Math.max(width * zoom, 1)
        context.lineCap = 'round'

        // Stroke
        context.stroke()
    }
}

function drawStraightLines(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, center: PointObject, zoom: number, straightLines: StraightLineObjectMap) {
    for (const straightLine of Object.values(straightLines)) {
        drawStraightLine(canvas, context, center, zoom, straightLine)
    }
}

function drawStraightLine(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, center: PointObject, zoom: number, straightLine: StraightLineObject) {
    // Extract
    const start = straightLine.start
    const end = straightLine.end
    const color = straightLine.color
    const width = straightLine.width
    const alpha = straightLine.alpha

    const x = projectX(canvas, center, zoom, start.x)
    const y = projectY(canvas, center, zoom, start.y)
    const xEnd = projectX(canvas, center, zoom, end.x)
    const yEnd = projectY(canvas, center, zoom, end.y)

    // Style
    context.globalAlpha = alpha
    context.strokeStyle = color
    context.lineWidth = Math.max(width * zoom, 1)
    context.lineCap = 'round'

    // Stroke
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(xEnd, yEnd)
    context.stroke()
    
}

function drawCircles(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, center: PointObject, zoom: number, circles: CircleObjectMap) {
    for (const circle of Object.values(circles)) {
        drawCircle(canvas, context, center, zoom, circle)
    }
}

function drawCircle(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, center: PointObject, zoom: number, circle: CircleObject) {
    // Extract
    const start = circle.start
    const end = circle.end
    const color = circle.color
    const width = circle.width
    const alpha = circle.alpha

    const x = projectX(canvas, center, zoom, (start.x + end.x) / 2)
    const y = projectY(canvas, center, zoom, (start.y + end.y) / 2)
    const rX = Math.abs((end.x - start.x) * zoom / 2)
    const rY = Math.abs((end.y - start.y) * zoom / 2)

    // Style
    context.globalAlpha = alpha
    context.strokeStyle = color
    context.lineWidth = Math.max(width * zoom, 1)
    context.lineCap = 'round'

    // Stroke
    context.beginPath()
    context.ellipse(x, y, rX, rY, 0, 0, 2 * Math.PI)
    context.stroke()
}

function drawSquares(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, center: PointObject, zoom: number, squares: SquareObjectMap) {
    for (const square of Object.values(squares)) {
        drawSquare(canvas, context, center, zoom, square)
    }
}

function drawSquare(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, center: PointObject, zoom: number, square: SquareObject) {
    // Extract
    const start = square.start
    const end = square.end
    const color = square.color
    const width = square.width
    const alpha = square.alpha

    const x = projectX(canvas, center, zoom, start.x)
    const y = projectY(canvas, center, zoom, start.y)
    const w = (end.x - start.x) * zoom
    const h = (end.y - start.y) * zoom

    // Style
    context.globalAlpha = alpha
    context.strokeStyle = color
    context.lineWidth = Math.max(width * zoom, 1)
    context.lineCap = 'round'

    // Stroke
    context.strokeRect(x, y, w, h)
}

function drawTriangles(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, center: PointObject, zoom: number, triangles: TriangleObjectMap) {
    for (const triangle of Object.values(triangles)) {
        drawTriangle(canvas, context, center, zoom, triangle)
    }
}

function drawTriangle(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, center: PointObject, zoom: number, triangle: TriangleObject) {
    // Extract
    const start = triangle.start
    const end = triangle.end
    const color = triangle.color
    const width = triangle.width
    const alpha = triangle.alpha

    const x = projectX(canvas, center, zoom, start.x)
    const y = projectY(canvas, center, zoom, start.y)
    const xEnd = projectX(canvas, center, zoom, end.x)
    const yEnd = projectY(canvas, center, zoom, end.y)

    // Style
    context.globalAlpha = alpha
    context.strokeStyle = color
    context.lineWidth = Math.max(width * zoom, 1)
    context.lineCap = 'round'

    // Stroke
    context.beginPath();
    context.moveTo(x, yEnd)
    context.lineTo(xEnd, yEnd)
    context.lineTo((x + xEnd) / 2, y)
    context.lineTo(x, yEnd)
    context.stroke()
    
}

function drawClients(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, center: PointObject, zoom: number, clients: ClientObjectMap) {
    for (const client of Object.values(clients)) {
        drawClient(canvas, context, center, zoom, client)
    }
}

function drawClient(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, center: PointObject, zoom: number, client: ClientObject) {
    // Extract
    const name = client.name
    const tool = client.tool
    const color = client.color
    const width = client.width
    const alpha = client.alpha
    const position = client.position

    // Check
    if (tool && position) {
        // Tool
        if (tool == 'line') {
            // Path
            context.beginPath()
            context.arc(projectX(canvas, center, zoom, position.x), projectY(canvas, center, zoom, position.y), 10, 0, Math.PI * 2)
            // Fill
            context.globalAlpha = alpha
            context.fillStyle = color
            context.fill()
        } else if (tool == 'straightLine') {
            // Path
            context.beginPath()
            context.rect(projectX(canvas, center, zoom, position.x) - 10, projectY(canvas, center, zoom, position.y) - 10, 20, 20)
            // Fill
            context.globalAlpha = alpha / 2
            context.fillStyle = color
            context.fill()
            // Stroke
            context.lineWidth = width * zoom * 2
            context.globalAlpha = Math.min(alpha * 2, 1)
            context.strokeStyle = color
            context.stroke()
        }else if (tool == 'circle') {
            // Path
            context.beginPath()
            context.arc(projectX(canvas, center, zoom, position.x), projectY(canvas, center, zoom, position.y), 10, 0, Math.PI * 2)
            // Fill
            context.globalAlpha = alpha / 2
            context.fillStyle = color
            context.fill()
            // Stroke
            context.lineWidth = width * zoom * 2
            context.globalAlpha = Math.min(alpha * 2, 1)
            context.strokeStyle = color
            context.stroke()
        } else if (tool == 'square') {
            // Path
            context.beginPath()
            context.rect(projectX(canvas, center, zoom, position.x) - 10, projectY(canvas, center, zoom, position.y) - 10, 20, 20)
            // Fill
            context.globalAlpha = alpha / 2
            context.fillStyle = color
            context.fill()
            // Stroke
            context.lineWidth = width * zoom * 2
            context.globalAlpha = Math.min(alpha * 2, 1)
            context.strokeStyle = color
            context.stroke()
        } else if (tool == 'triangle') {
            // Path
            context.beginPath()
            context.rect(projectX(canvas, center, zoom, position.x) - 10, projectY(canvas, center, zoom, position.y) - 10, 20, 20)
            // Fill
            context.globalAlpha = alpha / 2
            context.fillStyle = color
            context.fill()
            // Stroke
            context.lineWidth = width * zoom * 2
            context.globalAlpha = Math.min(alpha * 2, 1)
            context.strokeStyle = color
            context.stroke()
        }
        // Text
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        // Fill
        context.globalAlpha = 0.75
        context.fillStyle = 'black'
        context.fillText(name, projectX(canvas, center, zoom, position.x), projectY(canvas, center, zoom, position.y))
    }
}

function projectX(canvas: HTMLCanvasElement, center: PointObject, zoom: number, x: number) {
    // Prepare
    const cx = canvas.width / 2
    const dx = x - center.x
    // Return
    return cx + dx * zoom
}

function projectY(canvas: HTMLCanvasElement, center: PointObject, zoom: number, y: number) {
    // Prepare
    const cy = canvas.height / 2
    const dy = y - center.y
    // Return
    return cy + dy * zoom
}

export function unprojectX(canvas: HTMLCanvasElement, center: PointObject, zoom: number, x: number) {
    return (x - canvas.width / 2) / zoom + center.x
}

export function unprojectY(canvas: HTMLCanvasElement, center: PointObject, zoom: number, y: number) {
    return (y - canvas.height / 2) / zoom + center.y
}