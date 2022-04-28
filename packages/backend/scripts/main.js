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
    const canvasObjects = []
    // Convert database entries into array
    for (const canvasObject of Object.values(database)) {
        // Extract canvas object information
        const canvasId = canvasObject.canvasId
        const timestamps = canvasObject.timestamps
        const clients = canvasObject.clients
        const lines = canvasObject.lines
        // Append canvas object
        canvasObjects.push({ canvasId, timestamps, clients, lines })
    }
    // Send array
    response.send(canvasObjects.sort((a, b) => a.timestamps.created - b.timestamps.created))
})
app.get('/api/v1/canvas/:canvas', (request, response) => {
    // Parse path parameter
    const canvasId = request.params.canvas
    // Check if canvas exists in database
    if (canvasId in database) {
        // Retrieve canvas object
        const canvasObject = database[canvasId]
        // Extract canvas object information
        const canvasId = canvasObject.canvasId
        const timestamps = canvasObject.timestamps
        const clients = canvasObject.clients
        const lines = canvasOject.lines
        // Send canvas object
        response.send({ canvasId, timestamps, clients, lines })
    } else {
        // Return not found code
        response.status(404).send()
    }
})

// Socket handlers

app.ws('/api/v1/canvas/:canvas/client/:client', (socket, request) => {
    // Extract path parameters
    const canvasId = request.params.canvas
    const clientId = request.params.client

    // Create canvas object
    if (!(canvasId in database)) {
        // Create canvas object information
        const timestamps = { created: Date.now(), updated: Date.now() }
        const sockets = {}
        const clients = {}
        const lines = {}
        // Create canvas object
        database[canvasId] = { canvasId, timestamps, sockets, clients, lines }
    }

    // Retrieve canvas object
    const canvasObject = database[canvasId]

    // Remember socket and initialize client data
    canvasObject.sockets[clientId] = socket
    canvasObject.clients[clientId] = { clientId, name: 'Anonymous', color: 'black', width: 5, alpha: 0.5, position: undefined }
    
    // Synchronize client and line data
    for (const client of Object.values(canvasObject.clients)) {
        socket.send(JSON.stringify({ type: 'client', data: client }))
    }
    for (const line of Object.values(canvasObject.lines)) {
        socket.send(JSON.stringify({ type: 'line', data: line }))
    }

    // Handle
    socket.on('message', (data) => {
        // Timestamp
        canvasObject.timestamps.updated = Date.now()
        // Message
        const message = { clientId, ...JSON.parse(data) }
        // Remember
        switch (message.type) {
            case 'join': {
                canvasObject.clients[clientId].name = message.data
                canvasObject.clients[clientId].color = 'black'
                canvasObject.clients[clientId].width = 5
                canvasObject.clients[clientId].alpha = 0.5
                canvasObject.clients[clientId].position = undefined
                break
            }
            case 'move': {
                canvasObject.clients[clientId].position = message.data
                break
            }
            case 'out': {
                canvasObject.clients[clientId].position = undefined
                break
            }
            case 'over': {
                canvasObject.clients[clientId].position = message.data
                break
            }
            case 'color': {
                canvasObject.clients[clientId].color = message.data
                break
            }
            case 'width': {
                canvasObject.clients[clientId].width = message.data
                break
            }
            case 'alpha': {
                canvasObject.clients[clientId].alpha = message.data
                break
            }
            case 'start': {
                const clientId = message.clientId
                const lineId = message.data.lineId
                const points = [message.data.point]

                const color = canvasObject.clients[clientId].color
                const width = canvasObject.clients[clientId].width
                const alpha = canvasObject.clients[clientId].alpha

                canvasObject.lines[lineId] = { lineId, clientId, color, width, alpha, points }

                break
            }
            case 'continue': {
                const lineId = message.data.lineId
                const point = message.data.point

                canvasObject.lines[lineId].points.push(point)
                
                break
            }
        }
        // String
        const string = JSON.stringify(message)
        // Forward
        for (const [otherClientId, otherSocket] of Object.entries(canvasObject.sockets)) {
            if (otherClientId != clientId) {
                otherSocket.send(string)
            }
        }
    })
    socket.on('close', () => {
        // Remove
        delete canvasObject.clients[clientId]
        // Message
        const message = { clientId, type: 'leave' }
        // String
        const string = JSON.stringify(message)
        // Forward
        for (const otherSocket of Object.values(canvasObject.sockets)) {
            otherSocket.send(string)
        }
    })
})

// Listen

app.listen(8080)