// SOCKET FUNCTIONS

function connect() {
    const path = '/api/v1/canvas/' + canvasId + '/client/' + clientId

    socket = new WebSocket(socketProtocol + '//' + socketHost + path)

    socket.onopen = (event) => {
        socket.send(JSON.stringify({ type: 'join', data: clientName }))
    }
    socket.onmessage = (event) => {
        // Parse
        const message = JSON.parse(event.data)
        // Process
        switch (message.type) {
            case 'join': {
                const clientId = message.clientId
                const clientName = message.data

                names[clientId] = clientName
                colors[clientId] = 'black'
                widths[clientId] = 5
                alphas[clientId] = 0.5
                positions[clientId] = undefined

                break
            }
            case 'leave': {
                const clientId = message.clientId

                delete names[clientId]
                delete colors[clientId]
                delete widths[clientId]
                delete alphas[clientId]
                delete positions[clientId]

                break
            }
            case 'move': {
                const clientId = message.clientId
                const position = message.data

                positions[clientId] = position

                draw()
                break
            }
            case 'out': {
                const clientId = message.clientId

                positions[clientId] = undefined

                draw()
                break
            }
            case 'over': {
                const clientId = message.clientId
                const position = message.data

                positions[clientId] = position

                draw()
                break
            }
            case 'color': {
                const clientId = message.clientId
                const color = message.data
                
                colors[clientId] = color

                draw()
                break
            }
            case 'width': {
                const clientId = message.clientId
                const width = message.data
                
                widths[clientId] = width

                draw()
                break
            }
            case 'alpha': {
                const clientId = message.clientId
                const alpha = message.data
                
                alphas[clientId] = alpha

                draw()
                break
            }
            case 'start': {
                const clientId = message.clientId
                const lineId = message.data.lineId
                const points = [message.data.point]
                
                const color = colors[clientId]
                const width = widths[clientId]
                const alpha = alphas[clientId]

                lines[lineId] = { lineId, clientId, points, color, width, alpha }

                draw()
                break
            }
            case 'continue': {
                const lineId = message.data.lineId

                lines[lineId].points.push(message.data.point)

                draw()
                break
            }
            case 'line': {
                const lineId = message.data.lineId
                const clientId = message.data.clientId
                const points = message.data.points
                const color = message.data.color
                const width = message.data.width
                const alpha = message.data.alpha

                lines[lineId] = { lineId, clientId, points, color, width, alpha }

                draw()
                break
            }
        }
    }
}