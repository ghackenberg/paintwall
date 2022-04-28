// CONSTANTS

const clientId = Math.random().toString(16).substring(2)

const socketProtocol = location.protocol == 'http:' ? 'ws:' : 'wss:'
const socketHost = location.host

// CLASSES

class Canvas {
    constructor(canvasNode, canvasId) {
        this.canvasNode = canvasNode
        this.canvasId = canvasId
        this.socket = null
        this.lines = {}
        this.clients = {}
    }
    get() {
        // TODO
    }
    connect(clientName) {
        if (this.socket != null) {
            return
        }

        const path = '/api/v1/canvas/' + this.canvasId + '/client/' + clientId

        this.socket = new WebSocket(socketProtocol + '//' + socketHost + path)

        this.socket.onopen = (event) => {
            this.broadcast('join', clientName)
        }
        this.socket.onmessage = (event) => {
            // Parse
            const message = JSON.parse(event.data)
            // Process
            switch (message.type) {
                case 'join': {
                    const clientId = message.clientId
                    const name = message.data

                    this.clients[clientId] = new Client(clientId, name, 'black', 5, 0.5, undefined)

                    break
                }
                case 'leave': {
                    const clientId = message.clientId

                    delete this.clients[clientId]

                    break
                }
                case 'move': {
                    const clientId = message.clientId
                    const position = message.data

                    this.clients[clientId].position = position

                    break
                }
                case 'out': {
                    const clientId = message.clientId

                    this.clients[clientId].position = undefined

                    break
                }
                case 'over': {
                    const clientId = message.clientId
                    const position = message.data

                    this.clients[clientId].position = position

                    break
                }
                case 'color': {
                    const clientId = message.clientId
                    const color = message.data
                    
                    this.clients[clientId].color = color
                    
                    break
                }
                case 'width': {
                    const clientId = message.clientId
                    const width = message.data
                    
                    this.clients[clientId].width = width

                    break
                }
                case 'alpha': {
                    const clientId = message.clientId
                    const alpha = message.data
                    
                    this.clients[clientId].alpha = alpha

                    break
                }
                case 'start': {
                    const clientId = message.clientId
                    const lineId = message.data.lineId
                    const point = message.data.point
                    
                    const color = this.clients[clientId].color
                    const width = this.clients[clientId].width
                    const alpha = this.clients[clientId].alpha

                    this.lines[lineId] = new Line(lineId, clientId, color, width, alpha, [point])

                    break
                }
                case 'continue': {
                    const lineId = message.data.lineId
                    const point = message.data.point

                    this.lines[lineId].points.push(point)

                    break
                }
                case 'client': {
                    const clientId = message.data.clientId
                    const name = message.data.name
                    const color = message.data.color
                    const width = message.data.width
                    const alpha = message.data.alpha
                    const position = message.data.position

                    this.clients[clientId] = new Client(clientId, name, color, width, alpha, position)

                    break
                }
                case 'line': {
                    const lineId = message.data.lineId
                    const clientId = message.data.clientId
                    const color = message.data.color
                    const width = message.data.width
                    const alpha = message.data.alpha
                    const points = message.data.points

                    this.lines[lineId] = new Line(lineId, clientId, color, width, alpha, points)

                    break
                }
            }
            // Draw
            this.draw()
        }
    }
    disconnect() {
        if (this.socket && this.socket.readyState == WebSocket.OPEN) {
            this.socket.close()
            this.socket = null
        }
    }
    broadcast(type, data) {
        if (this.socket && this.socket.readyState == WebSocket.OPEN) {
            if (data) {
                this.socket.send(JSON.stringify({ type, data }))
            } else {
                this.socket.send(JSON.stringify({ type }))
            }
        }
    }
    draw() {
        draw(this.canvasNode, this.lines, this.clients)
    }
}