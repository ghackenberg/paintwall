import express from 'express'
import ws from 'express-ws'

const database = {}

const app = express()

ws(app) // enable websocket!

app.use((request, response, next) => {
    response.header('Service-Worker-Allowed', '/')
    next()
})

app.use(express.static('../frontend'))

app.ws('/api/v1/canvas/:canvas/client/:client', (socket, request) => {
    const canvasId = request.params.canvas
    const clientId = request.params.client

    // Create
    if (!(canvasId in database)) {
        database[canvasId] = { sockets: {}, names: {}, colors: {}, widths: {}, alphas: {}, positions: {}, lines: {} }
    }
    // Retrieve
    const canvas = database[canvasId]
    // Remember
    canvas.sockets[clientId] = socket
    
    // Standard events
    for (const [clientId, name] of Object.entries(canvas.names)) {
        socket.send(JSON.stringify({ clientId, type: 'join', data: name }))
    }
    for (const [clientId, color] of Object.entries(canvas.colors)) {
        socket.send(JSON.stringify({ clientId, type: 'color', data: color }))
    }
    for (const [clientId, width] of Object.entries(canvas.widths)) {
        socket.send(JSON.stringify({ clientId, type: 'width', data: width }))
    }
    for (const [clientId, alpha] of Object.entries(canvas.alphas)) {
        socket.send(JSON.stringify({ clientId, type: 'alpha', data: alpha }))
    }
    for (const [clientId, position] of Object.entries(canvas.positions)) {
        socket.send(JSON.stringify({ clientId, type: 'move', data: position }))
    }
    // Synthetic events
    for (const line of Object.values(canvas.lines)) {
        socket.send(JSON.stringify({ type: 'line', data: line }))
    }

    // Handle
    socket.on('message', (data) => {
        // Message
        const message = { clientId, ...JSON.parse(data) }
        // Remember
        switch (message.type) {
            case 'join': {
                canvas.names[clientId] = message.data
                canvas.colors[clientId] = 'black'
                canvas.widths[clientId] = 5
                canvas.alphas[clientId] = 0.5
                canvas.positions[clientId] = undefined
                break
            }
            case 'move': {
                canvas.positions[clientId] = message.data
                break
            }
            case 'out': {
                canvas.positions[clientId] = undefined
                break
            }
            case 'over': {
                canvas.positions[clientId] = message.data
                break
            }
            case 'color': {
                canvas.colors[clientId] = message.data
                break
            }
            case 'width': {
                canvas.widths[clientId] = message.data
                break
            }
            case 'alpha': {
                canvas.alphas[clientId] = message.data
                break
            }
            case 'start': {
                const clientId = message.clientId
                const lineId = message.data.lineId
                const point = message.data.point
                const points = [point]

                const color = canvas.colors[clientId]
                const width = canvas.widths[clientId]
                const alpha = canvas.alphas[clientId]

                canvas.lines[lineId] = { lineId, clientId, points, color, width, alpha }
                break
            }
            case 'continue': {
                const lineId = message.data.lineId
                const point = message.data.point

                canvas.lines[lineId].points.push(point)
                break
            }
        }
        // String
        const string = JSON.stringify(message)
        // Forward
        for (const [otherClientId, otherSocket] of Object.entries(canvas.sockets)) {
            if (otherClientId != clientId) {
                otherSocket.send(string)
            }
        }
    })
    socket.on('close', () => {
        // Remove
        delete canvas.sockets[clientId]
        delete canvas.names[clientId]
        delete canvas.colors[clientId]
        delete canvas.widths[clientId]
        delete canvas.alphas[clientId]
        delete canvas.positions[clientId]
        // Message
        const message = { clientId, type: 'leave' }
        // String
        const string = JSON.stringify(message)
        // Forward
        for (const otherSocket of Object.values(canvas.sockets)) {
            otherSocket.send(string)
        }
    })
})

app.listen(8080)