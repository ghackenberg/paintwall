import express from 'express'
import ws from 'express-ws'
import fs from 'fs'
import path from 'path'

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

// Reset clients
for (const canvasObject of Object.values(canvasObjectMap)) {
    canvasObject.clients = {}
}

setInterval(saveCanvasObjectMap, 30000)

const base = '/paintwall'

const app = express()

ws(app) // Enable WebSocket support

// Middleware

app.use((request, response, next) => {
    response.header('Service-Worker-Allowed', base + '/')
    next()
})

// Request handlers (API)

app.get(base + '/api/v1/canvas/', (request, response) => {
    const result = []
    // Convert database entries into array
    for (const canvasObject of Object.values(canvasObjectMap)) {
        // Append canvas object
        result.push(canvasObject)
    }
    // Send array
    response.send(result.sort((a, b) => a.timestamps.created - b.timestamps.created))
})
app.get(base + '/api/v1/canvas/:canvas', (request, response) => {
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

// Socket handlers (API)

function broadcast(sockets, message) {
    // String
    const string = JSON.stringify(message)
    // Send
    for (const socket of sockets) {
        socket.send(string)
    }
}

app.ws(base + '/api/v1/client/:client', (socket, request) => {
    // Extract path parameters
    const clientId = request.params.client

    // Remember socket
    clientSocketMap[clientId] = socket

    // Message
    const message = { type: 'online', data: Object.entries(clientSocketMap).length }
    // Broadcast
    broadcast(Object.values(clientSocketMap), message)

    // Handle
    socket.on('close', () => {
        // Remove socket
        delete clientSocketMap[clientId]

        // Message
        const message = { type: 'online', data: Object.entries(clientSocketMap).length }
        // Broadcast
        broadcast(Object.values(clientSocketMap), message)
    })
})
app.ws(base + '/api/v1/canvas/:canvas/client/:client', (socket, request) => {
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

        // Message
        const message = { type: 'canvas', data: canvasId }
        // Broadcast
        broadcast(Object.values(clientSocketMap), message)
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

    // Message
    const message = { type: 'live', data: { canvasId, count: Object.entries(canvasObject.clients).length } }
    // Broadcast
    broadcast(Object.values(clientSocketMap), message)

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
        // Broadcast
        broadcast(Object.entries(canvasSocket).filter(pair => pair[0] != clientId).map(pair => pair[1]), message)
    })
    socket.on('close', () => {
        // Remove socket
        delete canvasSocket[clientId]
        // Remove client
        delete canvasObject.clients[clientId]
        // Local broadcast
        {
            // Message
            const message = { clientId, type: 'leave' }
            // Broadcast
            broadcast(Object.values(canvasSocket), message)
        }
        // Global broadcast
        {
            // Message
            const message = { type: 'live', data: { canvasId, count: Object.entries(canvasObject.clients).length } }
            // Broadcast
            broadcast(Object.values(clientSocketMap), message)
        }
    })
})

// Request handlers (frontend)

app.get(base + '/.well-known/*', (request, response) => {
    response.sendFile(path.join(process.cwd(), '..', 'frontend', request.url.substring(base.length)))
})
app.get(base + '/images/*', (request, response) => {
    response.sendFile(path.join(process.cwd(), '..', 'frontend', request.url.substring(base.length)))
})
app.get(base + '/styles/*', (request, response) => {
    response.sendFile(path.join(process.cwd(), '..', 'frontend', request.url.substring(base.length)))
})
app.get(base + '/scripts/*', (request, response) => {
    response.sendFile(path.join(process.cwd(), '..', 'frontend', request.url.substring(base.length)))
})
app.get(base + '/manifest.json', (request, response) => {
    response.sendFile(path.join(process.cwd(), '..', 'frontend', request.url.substring(base.length)))
})
app.get(base + '/*', (request, response) => {
    response.sendFile(path.join(process.cwd(), '..', 'frontend', 'index.html'))
})

// Request handlers (other)

app.get('/*', (request, response) => {
    response.redirect(base + request.url)
})

// Listen

app.listen(8080)