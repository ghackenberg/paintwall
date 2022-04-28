import express from 'express'
import ws from 'express-ws'

const database = {}

const app = express()

ws(app) // Enable WebSocket support

// Middleware

app.use((request, response, next) => {
    response.header('Service-Worker-Allowed', '/')
    next()
})
app.use(express.static('../frontend'))

// Request handlers

app.get('/api/v1/canvas/', (request, response) => {
    // TODO
    response.status(500).send('Not implemented yet.')
})
app.get('/api/v1/canvas/:canvas', (request, response) => {
    // TODO
    response.status(500).send('Not implemented yet.')
})

// Socket handlers

app.ws('/api/v1/canvas/:canvas/client/:client', (socket, request) => {
    // Extract path parameters
    const canvasId = request.params.canvas
    const clientId = request.params.client

    // Create & retrieve canvas
    if (!(canvasId in database)) {
        database[canvasId] = { sockets: {}, clients: {}, lines: {} }
    }
    const canvas = database[canvasId]

    // Remember socket and initialize client data
    canvas.sockets[clientId] = socket
    canvas.clients[clientId] = { clientId, name: 'Anonymous', color: 'black', width: 5, alpha: 0.5, position: undefined }
    
    // Synchronize client and line data
    for (const client of Object.values(canvas.clients)) {
        socket.send(JSON.stringify({ type: 'client', data: client }))
    }
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
                canvas.clients[clientId].name = message.data
                canvas.clients[clientId].color = 'black'
                canvas.clients[clientId].width = 5
                canvas.clients[clientId].alpha = 0.5
                canvas.clients[clientId].position = undefined
                break
            }
            case 'move': {
                canvas.clients[clientId].position = message.data
                break
            }
            case 'out': {
                canvas.clients[clientId].position = undefined
                break
            }
            case 'over': {
                canvas.clients[clientId].position = message.data
                break
            }
            case 'color': {
                canvas.clients[clientId].color = message.data
                break
            }
            case 'width': {
                canvas.clients[clientId].width = message.data
                break
            }
            case 'alpha': {
                canvas.clients[clientId].alpha = message.data
                break
            }
            case 'start': {
                const clientId = message.clientId
                const lineId = message.data.lineId
                const points = [message.data.point]

                const color = canvas.clients[clientId].color
                const width = canvas.clients[clientId].width
                const alpha = canvas.clients[clientId].alpha

                canvas.lines[lineId] = { lineId, clientId, color, width, alpha, points }

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
        delete canvas.clients[clientId]
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

// Listen

app.listen(8080)