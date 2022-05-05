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
    // Initialize coordinates
    const min = Number.MAX_VALUE
    const max = Number.MIN_VALUE

    const x = { min, max }
    const y = { min, max }

    for (const line of Object.values(canvasObject.lines)) {
        for (const point of line.points) {
            x.min = Math.min(x.min, point.x)
            x.max = Math.max(x.max, point.x)

            y.min = Math.min(y.min, point.y)
            y.max = Math.max(y.max, point.y)
        }
    }

    canvasObject.coordinates = { x, y }

    // Initialize reactions
    if (!canvasObject.reactions) {
        canvasObject.reactions = {}
    }
    
    // Initialize clients
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
        // Create canvas object data
        const created = Date.now()
        const updated = Date.now()
        const min = Number.MAX_VALUE
        const max = Number.MIN_VALUE
        const x = { min, max }
        const y = { min, max }

        // Create canvas object information
        const timestamps = { created, updated }
        const coordinates = { x, y }
        const reactions = {}
        const clients = {}
        const lines = {}

        // Create canvas object
        canvasObjectMap[canvasId] = { canvasId, timestamps, coordinates, reactions, clients, lines }

        // Message
        const message = { type: 'canvas', data: canvasId }
        // Broadcast
        broadcast(Object.values(clientSocketMap), message)
    }

    // Retrieve canvas object
    const canvasObject = canvasObjectMap[canvasId]

    // Retrieve canvas object information
    const timestamps = canvasObject.timestamps
    const coordinates = canvasObject.coordinates
    const reactions = canvasObject.reactions
    const clients = canvasObject.clients
    const lines = canvasObject.lines

    // Retrieve canvas object data
    const x = coordinates.x
    const y = coordinates.y

    // Remember client
    clients[clientId] = { clientId, name: undefined, color: undefined, width: undefined, alpha: undefined, position: undefined }

    // Synchronize timestamp and coordinate data
    socket.send(JSON.stringify({ type: 'timestamps', data: timestamps}))
    socket.send(JSON.stringify({ type: 'coordinates', data: coordinates}))
    socket.send(JSON.stringify({ type: 'reactions', data: reactions}))

    // Synchronize client and line data
    for (const client of Object.values(clients)) {
        socket.send(JSON.stringify({ type: 'client', data: client }))
    }
    for (const line of Object.values(lines)) {
        socket.send(JSON.stringify({ type: 'line', data: line }))
    }

    // Message
    const message = { type: 'live', data: { canvasId, count: Object.entries(clients).length } }
    // Broadcast
    broadcast(Object.values(clientSocketMap), message)

    // Handle
    socket.on('message', (data) => {
        // Timestamp
        timestamps.updated = Date.now()
        // Message
        const message = { clientId, ...JSON.parse(data) }
        // Remember
        switch (message.type) {
            case 'join': {
                if (clientId in clients) {
                    clients[clientId].name = message.data.name
                    clients[clientId].color = message.data.color
                    clients[clientId].width = message.data.width
                    clients[clientId].alpha = message.data.alpha
                    clients[clientId].position = message.data.position
                }
                break
            }
            case 'move': {
                if (clientId in clients) {
                    clients[clientId].position = message.data
                }
                break
            }
            case 'out': {
                if (clientId in clients) {
                    clients[clientId].position = undefined
                }
                break
            }
            case 'over': {
                if (clientId in clients) {
                    canvasObject.clients[clientId].position = message.data
                }
                break
            }
            case 'color': {
                if (clientId in clients) {
                    clients[clientId].color = message.data
                }
                break
            }
            case 'width': {
                if (clientId in clients) {
                    clients[clientId].width = message.data
                }
                break
            }
            case 'alpha': {
                if (clientId in clients) {
                    clients[clientId].alpha = message.data
                }
                break
            }
            case 'start': {
                const clientId = message.clientId
                const lineId = message.data.lineId
                const point = message.data.point
                const points = [point]

                const color = clients[clientId].color
                const width = clients[clientId].width
                const alpha = clients[clientId].alpha

                lines[lineId] = { lineId, clientId, color, width, alpha, points }

                x.min = Math.min(x.min, point.x)
                x.max = Math.max(x.max, point.x)

                y.min = Math.min(y.min, point.y)
                y.max = Math.max(y.max, point.y)

                break
            }
            case 'continue': {
                const lineId = message.data.lineId
                const point = message.data.point

                if (lineId in lines) {
                    lines[lineId].points.push(point)

                    x.min = Math.min(x.min, point.x)
                    x.max = Math.max(x.max, point.x)
    
                    y.min = Math.min(y.min, point.y)
                    y.max = Math.max(y.max, point.y)
                }
                
                break
            }
            case 'react': {
                const reaction = message.data

                if (!(reaction in reactions)) {
                    reactions[reaction] = 1
                } else {
                    reactions[reaction]++
                }

                broadcast(Object.values(clientSocketMap), { type: 'react', data: { canvasId, reaction, count: reactions[reaction] } })

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
        delete clients[clientId]
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
            const message = { type: 'live', data: { canvasId, count: Object.entries(clients).length } }
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