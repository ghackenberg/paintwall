// CLASSES

class CanvasModel {
    constructor(canvasNode, canvasId, clients, lines) {
        this.canvasNode = canvasNode
        this.canvasId = canvasId
        this.clients = clients || {}
        this.lines = lines || {}
        this.socket = null
    }
    connect(client) {
        this.reconnect = true

        if (this.socket != null) {
            return
        }

        this.socket = new WebSocket(makeSocketURL('/api/v1/canvas/' + this.canvasId + '/client/'))

        this.socket.onopen = (event) => {
            this.broadcast('join', client)
        }
        this.socket.onmessage = (event) => {
            // Parse
            const message = JSON.parse(event.data)
            // Process
            switch (message.type) {
                case 'join': {
                    const clientId = message.clientId
                    const name = message.data.name
                    const color = message.data.color
                    const width = message.data.width
                    const alpha = message.data.alpha
                    const position = message.data.position

                    this.clients[clientId] = new ClientModel(clientId, name, color, width, alpha, position)

                    break
                }
                case 'leave': {
                    const clientId = message.clientId

                    if (clientId in this.clients) {
                        delete this.clients[clientId]
                    }

                    break
                }
                case 'move': {
                    const clientId = message.clientId
                    const position = message.data

                    if (clientId in this.clients) {
                        this.clients[clientId].position = position
                    }

                    break
                }
                case 'out': {
                    const clientId = message.clientId

                    if (clientId in this.clients) {
                        this.clients[clientId].position = undefined
                    }

                    break
                }
                case 'over': {
                    const clientId = message.clientId
                    const position = message.data

                    if (clientId in this.clients) {
                        this.clients[clientId].position = position
                    }

                    break
                }
                case 'color': {
                    const clientId = message.clientId
                    const color = message.data
                    
                    if (clientId in this.clients) {
                        this.clients[clientId].color = color
                    }
                    
                    break
                }
                case 'width': {
                    const clientId = message.clientId
                    const width = message.data
                    
                    if (clientId in this.clients) {
                        this.clients[clientId].width = width
                    }

                    break
                }
                case 'alpha': {
                    const clientId = message.clientId
                    const alpha = message.data
                    
                    if (clientId in this.clients) {
                        this.clients[clientId].alpha = alpha
                    }

                    break
                }
                case 'start': {
                    const clientId = message.clientId
                    const lineId = message.data.lineId
                    const point = message.data.point
                    
                    const color = this.clients[clientId].color
                    const width = this.clients[clientId].width
                    const alpha = this.clients[clientId].alpha

                    this.lines[lineId] = new LineModel(lineId, clientId, color, width, alpha, [point])

                    break
                }
                case 'continue': {
                    const lineId = message.data.lineId
                    const point = message.data.point

                    if (lineId in this.lines) {
                        this.lines[lineId].points.push(point)
                    }

                    break
                }
                case 'client': {
                    const clientId = message.data.clientId
                    const name = message.data.name
                    const color = message.data.color
                    const width = message.data.width
                    const alpha = message.data.alpha
                    const position = message.data.position

                    this.clients[clientId] = new ClientModel(clientId, name, color, width, alpha, position)

                    break
                }
                case 'line': {
                    const lineId = message.data.lineId
                    const clientId = message.data.clientId
                    const color = message.data.color
                    const width = message.data.width
                    const alpha = message.data.alpha
                    const points = message.data.points

                    this.lines[lineId] = new LineModel(lineId, clientId, color, width, alpha, points)

                    break
                }
            }
            // Draw
            this.draw()
        }
        this.socket.onerror = function(event) {
            // Close
            this.socket.close()
        }
        this.socket.onclose = function(event) {
            // Reset socket
            this.socket = null
            // Check reconnection
            if (this.reconnect) {
                // Reconnect socket
                this.connect(client)
            }
        }
    }
    disconnect() {
        if (this.socket && this.socket.readyState == WebSocket.OPEN) {
            // Prevent reconnection
            this.reconnect = false
            // Close socket
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