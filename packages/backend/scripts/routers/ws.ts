import { Router } from 'express'
import { BASE } from 'paintwall-common'
import * as WebSocket from 'ws'
import { CANVAS_OBJECT_MAP, CANVAS_SOCKET_MAP, CLIENT_SOCKET_MAP } from '../globals/db'

export function ws() {
    const router = Router()

    router.ws(BASE + '/api/v1/client/:client', (socket, request) => {
        // Extract path parameters
        const clientId = request.params.client

        // Remember socket
        CLIENT_SOCKET_MAP[clientId] = socket

        // Message
        const message = { type: 'client-count', data: Object.entries(CLIENT_SOCKET_MAP).length }
        // Broadcast
        broadcast(Object.values(CLIENT_SOCKET_MAP), message)

        // Handle
        socket.on('close', () => {
            // Remove socket
            delete CLIENT_SOCKET_MAP[clientId]

            // Message
            const message = { type: 'client-count', data: Object.entries(CLIENT_SOCKET_MAP).length }
            // Broadcast
            broadcast(Object.values(CLIENT_SOCKET_MAP), message)
        })
    })

    router.ws(BASE + '/api/v1/canvas/:canvas/client/:client', (socket, request) => {
        // Extract path parameters
        const canvasId = request.params.canvas
        const clientId = request.params.client

        // Create canvas socket
        if (!(canvasId in CANVAS_SOCKET_MAP)) {
            CANVAS_SOCKET_MAP[canvasId] = {}
        }

        // Retrieve canvas socket
        const canvasSocket = CANVAS_SOCKET_MAP[canvasId]

        // Remember socket
        canvasSocket[clientId] = socket

        // Create canvas object
        if (!(canvasId in CANVAS_OBJECT_MAP)) {
            // Create canvas object data
            const created = Date.now()
            const updated = Date.now()
            const min = Number.MAX_VALUE
            const max = Number.MIN_VALUE
            const x = { min, max }
            const y = { min, max }

            // Create canvas object information
            const timestamps = { created, updated }
            const counts = { views: 0, shapes: 0, clients: 0, reactions: 0 }
            const coordinates = { x, y }
            const reactions = {}
            const clients = {}
            const lines = {}
            const circles = {}
            const squares = {}

            // Create canvas object
            CANVAS_OBJECT_MAP[canvasId] = { canvasId, timestamps, counts, coordinates, reactions, clients, lines, circles, squares }

            // Message
            const message = { type: 'canvas-count', data: Object.entries(CANVAS_OBJECT_MAP).length }
            // Broadcast
            broadcast(Object.values(CLIENT_SOCKET_MAP), message)
        }

        // Retrieve canvas object
        const canvasObject = CANVAS_OBJECT_MAP[canvasId]

        // Retrieve canvas object information
        const timestamps = canvasObject.timestamps
        const counts = canvasObject.counts
        const coordinates = canvasObject.coordinates
        const reactions = canvasObject.reactions
        const clients = canvasObject.clients
        const lines = canvasObject.lines
        const circles = canvasObject.circles
        const squares = canvasObject.squares

        // Retrieve canvas object data
        const x = coordinates.x
        const y = coordinates.y

        // Update counts
        counts.views++
        counts.clients++

        // Remember client
        clients[clientId] = { clientId, name: undefined, tool: undefined, color: undefined, width: undefined, alpha: undefined, position: undefined }

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
        for (const circle of Object.values(circles)) {
            socket.send(JSON.stringify({ type: 'init-circle', data: circle }))
        }
        for (const square of Object.values(squares)) {
            socket.send(JSON.stringify({ type: 'init-square', data: square }))
        }

        // Broadcast
        broadcast(Object.values(CLIENT_SOCKET_MAP), { type: 'canvas-view-count', data: { canvasId, count: counts.views } })
        broadcast(Object.values(CLIENT_SOCKET_MAP), { type: 'canvas-client-count', data: { canvasId, count: counts.clients } })

        // Handle
        socket.on('message', (data) => {
            // Timestamp
            timestamps.updated = Date.now()
            // Message
            const message = { clientId, ...JSON.parse(data.toString()) }
            // Remember
            switch (message.type) {
                case 'client-enter': {
                    if (clientId in clients) {
                        clients[clientId].name = message.data.name
                        clients[clientId].tool = message.data.tool
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
                case 'client-tool': {
                    if (clientId in clients) {
                        clients[clientId].tool = message.data
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

                    counts.shapes++

                    broadcast(Object.values(CLIENT_SOCKET_MAP), { type: 'canvas-shape-count', data: { canvasId, count: counts.shapes } })

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

                    broadcast(Object.values(CLIENT_SOCKET_MAP), { type: 'canvas-reaction-count', data: { canvasId, count: counts.reactions } })

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
            broadcast(Object.values(CLIENT_SOCKET_MAP), { type: 'canvas-client-count', data: { canvasId, count: counts.clients } })
        })
    })

    return router
}

function broadcast(sockets: WebSocket[], message: any) {
    // String
    const string = JSON.stringify(message)
    // Send
    for (const socket of sockets) {
        socket.send(string)
    }
}