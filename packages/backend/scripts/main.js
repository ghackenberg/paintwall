import express from 'express'
import ws from 'express-ws'
import fs from 'fs'

const canvasObjectMapFile = 'database.json'

function loadCanvasObjectMap() {
    try {
        console.log('Loading canvasObjectMap')
        return JSON.parse(fs.readFileSync(canvasObjectMapFile, 'utf-8'))
    } catch (error) {
        console.log('Initializing canvasObjectMap')
        return {}
    }
}
function saveCanvasObjectMap() {
    try {
        console.log('Saving canvasObjectMap')
        fs.writeFileSync(canvasObjectMapFile, JSON.stringify(canvasObjectMap))
    } catch (error) {
        console.error(error)
    }
}

const clientSocketMap = {}
const canvasSocketMap = {}
const canvasObjectMap = loadCanvasObjectMap()

setInterval(saveCanvasObjectMap, 30000)

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
    const result = []
    // Convert database entries into array
    for (const canvasObject of Object.values(canvasObjectMap)) {
        // Append canvas object
        result.push(canvasObject)
    }
    // Send array
    response.send(result.sort((a, b) => a.timestamps.created - b.timestamps.created))
})
app.get('/api/v1/canvas/:canvas', (request, response) => {
    // Parse path parameter
    const canvasId = request.params.canvas
    // Check if canvas exists in database
    if (canvasId in canvasObjectMap) {
        // Send canvas object
        response.send(canvasObjectMap[canvasId])
    } else {
        // Return not found code
        response.status(404).send()
    }
})

// Socket handlers

app.ws('/api/v1/client/:client', (socket, request) => {
    // Extract path parameters
    const clientId = request.params.client

    // Remember socket
    clientSocketMap[clientId] = socket

    // Message
    const message = { type: 'count', data: Object.entries(clientSocketMap).length }
    // String
    const string = JSON.stringify(message)
    // Send
    for (const otherSocket of Object.values(clientSocketMap)) {
        otherSocket.send(string)
    }

    // Handle
    socket.on('close', () => {
        // Remove socket
        delete clientSocketMap[clientId]

        // Message
        const message = { type: 'count', data: Object.entries(clientSocketMap).length }
        // String
        const string = JSON.stringify(message)
        // Send
        for (const otherSocket of Object.values(clientSocketMap)) {
            otherSocket.send(string)
        }
    })
})
app.ws('/api/v1/canvas/:canvas/client/:client', (socket, request) => {
    // Extract path parameters
    const canvasId = request.params.canvas
    const clientId = request.params.client

    // Create canvas socket
    if (!(canvasId in canvasSocketMap)) {
        canvasSocketMap[canvasId] = {}
    }

    // Retrieve canvas socket
    const canvasSocket = canvasSocketMap[canvasId]

    // Remember socket
    canvasSocket[clientId] = socket

    // Create canvas object
    if (!(canvasId in canvasObjectMap)) {
        // Create canvas object information
        const timestamps = { created: Date.now(), updated: Date.now() }
        const clients = {}
        const lines = {}
        // Create canvas object
        canvasObjectMap[canvasId] = { canvasId, timestamps, clients, lines }
    }

    // Retrieve canvas object
    const canvasObject = canvasObjectMap[canvasId]

    // Remember client
    canvasObject.clients[clientId] = { clientId, name: undefined, color: undefined, width: undefined, alpha: undefined, position: undefined }
    
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
                if (clientId in canvasObject.clients) {
                    canvasObject.clients[clientId].name = message.data.name
                    canvasObject.clients[clientId].color = message.data.color
                    canvasObject.clients[clientId].width = message.data.width
                    canvasObject.clients[clientId].alpha = message.data.alpha
                    canvasObject.clients[clientId].position = message.data.position
                }
                break
            }
            case 'move': {
                if (clientId in canvasObject.clients) {
                    canvasObject.clients[clientId].position = message.data
                }
                break
            }
            case 'out': {
                if (clientId in canvasObject.clients) {
                    canvasObject.clients[clientId].position = undefined
                }
                break
            }
            case 'over': {
                if (clientId in canvasObject.clients) {
                    canvasObject.clients[clientId].position = message.data
                }
                break
            }
            case 'color': {
                if (clientId in canvasObject.clients) {
                    canvasObject.clients[clientId].color = message.data
                }
                break
            }
            case 'width': {
                if (clientId in canvasObject.clients) {
                    canvasObject.clients[clientId].width = message.data
                }
                break
            }
            case 'alpha': {
                if (clientId in canvasObject.clients) {
                    canvasObject.clients[clientId].alpha = message.data
                }
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

                if (lineId in canvasObject.lines) {
                    canvasObject.lines[lineId].points.push(point)
                }
                
                break
            }
        }
        // String
        const string = JSON.stringify(message)
        // Forward
        for (const [otherClientId, otherSocket] of Object.entries(canvasSocket)) {
            if (otherClientId != clientId) {
                otherSocket.send(string)
            }
        }
    })
    socket.on('close', () => {
        // Remove socket
        delete canvasSocket[clientId]
        // Remove client
        delete canvasObject.clients[clientId]

        // Message
        const message = { clientId, type: 'leave' }
        // String
        const string = JSON.stringify(message)
        // Forward
        for (const otherSocket of Object.values(canvasSocket)) {
            otherSocket.send(string)
        }
    })
})

// Listen

app.listen(8080)