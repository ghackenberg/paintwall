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
    // Initialize counts
    if (!('counts' in canvasObject)) {
        var reactions = 0
        for (const count of Object.values(canvasObject.reactions)) {
            reactions += count
        }
        canvasObject.counts = { views: 1, clients: 0, reactions }
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
    const message = { type: 'client-count', data: Object.entries(clientSocketMap).length }
    // Broadcast
    broadcast(Object.values(clientSocketMap), message)

    // Handle
    socket.on('close', () => {
        // Remove socket
        delete clientSocketMap[clientId]

        // Message
        const message = { type: 'client-count', data: Object.entries(clientSocketMap).length }
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
        const counts = { views: 0, clients: 0, reactions: 0 }
        const coordinates = { x, y }
        const reactions = {}
        const clients = {}
        const lines = {}

        // Create canvas object
        canvasObjectMap[canvasId] = { canvasId, timestamps, counts, coordinates, reactions, clients, lines }

        // Message
        const message = { type: 'canvas-count', data: Object.entries(canvasObjectMap).length }
        // Broadcast
        broadcast(Object.values(clientSocketMap), message)
    }

    // Retrieve canvas object
    const canvasObject = canvasObjectMap[canvasId]

    // Retrieve canvas object information
    const timestamps = canvasObject.timestamps
    const counts = canvasObject.counts
    const coordinates = canvasObject.coordinates
    const reactions = canvasObject.reactions
    const clients = canvasObject.clients
    const lines = canvasObject.lines

    // Retrieve canvas object data
    const x = coordinates.x
    const y = coordinates.y

    // Update counts
    counts.views++
    counts.clients++

    // Remember client
    clients[clientId] = { clientId, name: undefined, color: undefined, width: undefined, alpha: undefined, position: undefined }

    // Synchronize timestamp and coordinate data
    socket.send(JSON.stringify({ type: 'init-timestamps', data: timestamps}))
    socket.send(JSON.stringify({ type: 'init-counts', data: counts}))
    socket.send(JSON.stringify({ type: 'init-coordinates', data: coordinates}))
    socket.send(JSON.stringify({ type: 'init-reactions', data: reactions}))

    // Synchronize client and line data
    for (const client of Object.values(clients)) {
        socket.send(JSON.stringify({ type: 'init-client', data: client }))
    }
    for (const line of Object.values(lines)) {
        socket.send(JSON.stringify({ type: 'init-line', data: line }))
    }

    // Broadcast
    broadcast(Object.values(clientSocketMap), { type: 'canvas-view-count', data: { canvasId, count: counts.views } })
    broadcast(Object.values(clientSocketMap), { type: 'canvas-client-count', data: { canvasId, count: counts.clients } })

    // Handle
    socket.on('message', (data) => {
        // Timestamp
        timestamps.updated = Date.now()
        // Message
        const message = { clientId, ...JSON.parse(data) }
        // Remember
        switch (message.type) {
            case 'client-enter': {
                if (clientId in clients) {
                    clients[clientId].name = message.data.name
                    clients[clientId].color = message.data.color
                    clients[clientId].width = message.data.width
                    clients[clientId].alpha = message.data.alpha
                    clients[clientId].position = message.data.position
                }
                break
            }
            case 'client-pointer-move': {
                if (clientId in clients) {
                    clients[clientId].position = message.data
                }
                break
            }
            case 'client-pointer-out': {
                if (clientId in clients) {
                    clients[clientId].position = undefined
                }
                break
            }
            case 'client-pointer-over': {
                if (clientId in clients) {
                    canvasObject.clients[clientId].position = message.data
                }
                break
            }
            case 'client-color': {
                if (clientId in clients) {
                    clients[clientId].color = message.data
                }
                break
            }
            case 'client-width': {
                if (clientId in clients) {
                    clients[clientId].width = message.data
                }
                break
            }
            case 'client-alpha': {
                if (clientId in clients) {
                    clients[clientId].alpha = message.data
                }
                break
            }
            case 'client-line-start': {
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
            case 'client-line-continue': {
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
            case 'client-react': {
                const reaction = message.data

                if (!(reaction in reactions)) {
                    reactions[reaction] = 1
                } else {
                    reactions[reaction]++
                }

                counts.reactions++

                broadcast(Object.values(clientSocketMap), { type: 'canvas-reaction-count', data: { canvasId, count: counts.reactions } })

                break
            }
        }
        // Broadcast
        broadcast(Object.entries(canvasSocket).filter(pair => pair[0] != clientId).map(pair => pair[1]), message)
    })
    socket.on('close', () => {
        // Remove socket
        delete canvasSocket[clientId]
        // Update counts
        counts.clients--
        // Remove client
        delete clients[clientId]
        // Local broadcast
        broadcast(Object.values(canvasSocket), { clientId, type: 'client-leave' })
        // Global broadcast
        broadcast(Object.values(clientSocketMap), { type: 'canvas-client-count', data: { canvasId, count: counts.clients } })
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