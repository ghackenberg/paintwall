import { BASE, CanvasObject, CircleObject, CircleObjectMap, ClientObject, ClientObjectMap, CoordinateData, CountData, LineObject, LineObjectMap, PointObject, ReactionData, SquareObject, SquareObjectMap, StraightLineObject, StraightLineObjectMap, TimestampData, TriangleObject, TriangleObjectMap } from 'paintwall-common'
import { draw } from '../functions/draw'
import { makeSocketURL } from '../functions/socket'
import { CircleModel } from './circle'
import { ClientModel } from './client'
import { LineModel } from './line'
import { StraightLineModel } from './straightLine'
import { SquareModel } from './square'
import { TriangleModel } from './triangle'

interface Handler {
    (...args: any[]): void
}

interface HandlerMap {
    [event: string]: Handler[]   
}

export class CanvasModel implements CanvasObject {

    handlers: HandlerMap = {}

    socket: WebSocket = null
    reconnect: boolean = null

    center: PointObject = null
    zoom: number = null

    canvasNode: HTMLCanvasElement
    canvasId: string
    timestamps: TimestampData
    counts: CountData
    coordinates: CoordinateData
    reactions: ReactionData
    clients: ClientObjectMap
    lines: LineObjectMap
    straightLines: StraightLineObjectMap
    circles: CircleObjectMap
    squares: SquareObjectMap
    triangles: TriangleObjectMap

    constructor(canvasNode: HTMLCanvasElement, canvasId: string, timestamps?: TimestampData, counts?: CountData, coordinates?: CoordinateData, reactions?: ReactionData, clients?: ClientObjectMap, lines?: LineObjectMap, straightLines?: StraightLineObjectMap, circles?: CircleObjectMap, squares?: SquareObjectMap, triangles?: TriangleObjectMap) {
        this.canvasNode = canvasNode
        this.canvasId = canvasId
        this.timestamps = timestamps
        this.counts = counts
        this.coordinates = coordinates
        this.reactions = reactions || {}
        this.clients = clients || {}
        this.lines = lines || {}
        this.straightLines = straightLines || {}
        this.circles = circles || {}
        this.squares = squares || {}
        this.triangles = triangles || {}
        this.updateCenter()
        this.updateZoom()
    }

    updateCenter() {
        if (this.coordinates) {
            if (this.coordinates.x.min != Number.MAX_VALUE) {
                const dx = this.coordinates.x.max - this.coordinates.x.min
                const dy = this.coordinates.y.max - this.coordinates.y.min
    
                const cx = this.coordinates.x.min + dx / 2
                const cy = this.coordinates.y.min + dy / 2
    
                this.center = { x: cx, y: cy }
            } else {
                const cx = this.canvasNode.width / 2
                const cy = this.canvasNode.height / 2

                this.center = { x: cx, y: cy }
            }
        }
    }

    updateZoom() {
        if (this.coordinates) {
            if (this.coordinates.x.min != Number.MAX_VALUE) {
                const dx = (this.coordinates.x.max - this.coordinates.x.min) * 1.2
                const dy = (this.coordinates.y.max - this.coordinates.y.min) * 1.2

                const width = this.canvasNode.width
                const height = this.canvasNode.height
                
                this.zoom = Math.min(1, width / dx, height / dy)
            } else {
                this.zoom = 1
            }
        }
    }

    on(event: 'init-client', handle: (data: ClientObject) => void): void
    on(event: 'init-timestamps', handle: (data: TimestampData) => void): void
    on(event: 'init-counts', handle: (data: CountData) => void): void
    on(event: 'init-coordinates', handle: (data: CoordinateData) => void): void
    on(event: 'init-reactions', handle: (data: ReactionData) => void): void
    on(event: 'init-client', handle: (data: ClientObject) => void): void
    on(event: 'init-line', handle: (data: LineObject) => void): void
    on(event: 'init-straigthLine', handle: (data: StraightLineObject) => void): void
    on(event: 'init-circle', handle: (data: CircleObject) => void): void
    on(event: 'init-square', handle: (data: SquareObject) => void): void
    on(event: 'init-triangle', handle: (data: TriangleObject) => void): void
    on(event: 'client-enter', handler: (clientId: string, data: ClientObject) => void): void
    on(event: 'client-leave', handler: (clientId: string) => void): void
    on(event: 'client-tool', handler: (clientId: string, data: string) => void): void
    on(event: 'client-color', handler: (clientId: string, data: string) => void): void
    on(event: 'client-width', handler: (clientId: string, data: number) => void): void
    on(event: 'client-alpha', handler: (clientId: string, data: number) => void): void
    on(event: 'client-pointer-over', handler: (clientId: string, data: PointObject) => void): void
    on(event: 'client-pointer-move', handler: (clientId: string, data: PointObject) => void): void
    on(event: 'client-pointer-out', handler: (clientId: string) => void): void
    on(event: 'client-line-start', handler: (clientId: string, data: { lineId: string, point: PointObject }) => void): void
    on(event: 'client-line-continue', handler: (clientId: string, data: { lineId: string, point: PointObject }) => void): void
    on(event: 'client-straightLine-start', handler: (clientId: string, data: { straightLineId: string, point: PointObject }) => void): void
    on(event: 'client-straightLine-continue', handler: (clientId: string, data: { straightLineId: string, point: PointObject }) => void): void
    on(event: 'client-circle-start', handler: (clientId: string, data: { circleId: string, point: PointObject }) => void): void
    on(event: 'client-circle-continue', handler: (clientId: string, data: { circleId: string, point: PointObject }) => void): void
    on(event: 'client-square-start', handler: (clientId: string, data: { squareId: string, point: PointObject }) => void): void
    on(event: 'client-square-continue', handler: (clientId: string, data: { squareId: string, point: PointObject }) => void): void
    on(event: 'client-triangle-start', handler: (clientId: string, data: { triangleId: string, point: PointObject }) => void): void
    on(event: 'client-triangle-continue', handler: (clientId: string, data: { triangleId: string, point: PointObject }) => void): void

    on(event: 'client-react', handler: (clientId: string, data: string) => void): void
    on(event: string, handler: Handler) {
        if (!(event in this.handlers)) {
            this.handlers[event] = []
        }
        this.handlers[event].push(handler)
    }

    off(event: 'init-client', handle: (data: ClientObject) => void): void
    off(event: 'init-timestamps', handle: (data: TimestampData) => void): void
    off(event: 'init-counts', handle: (data: CountData) => void): void
    off(event: 'init-coordinates', handle: (data: CoordinateData) => void): void
    off(event: 'init-reactions', handle: (data: ReactionData) => void): void
    off(event: 'init-client', handle: (data: ClientObject) => void): void
    off(event: 'init-line', handle: (data: LineObject) => void): void
    off(event: 'init-straightLine', handle: (data: StraightLineObject) => void): void
    off(event: 'init-circle', handle: (data: CircleObject) => void): void
    off(event: 'init-square', handle: (data: SquareObject) => void): void
    off(event: 'init-triangle', handle: (data: TriangleObject) => void): void
    off(event: 'client-enter', handler: (clientId: string, data: ClientObject) => void): void
    off(event: 'client-leave', handler: (clientId: string) => void): void
    off(event: 'client-tool', handler: (clientId: string, data: string) => void): void
    off(event: 'client-color', handler: (clientId: string, data: string) => void): void
    off(event: 'client-width', handler: (clientId: string, data: number) => void): void
    off(event: 'client-alpha', handler: (clientId: string, data: number) => void): void
    off(event: 'client-pointer-over', handler: (clientId: string, data: PointObject) => void): void
    off(event: 'client-pointer-move', handler: (clientId: string, data: PointObject) => void): void
    off(event: 'client-pointer-out', handler: (clientId: string) => void): void
    off(event: 'client-line-start', handler: (clientId: string, data: { lineId: string, point: PointObject }) => void): void
    off(event: 'client-line-continue', handler: (clientId: string, data: { lineId: string, point: PointObject }) => void): void
    off(event: 'client-straightLine-start', handler: (clientId: string, data: { straightLineId: string, point: PointObject }) => void): void
    off(event: 'client-straightLine-continue', handler: (clientId: string, data: { straightLineId: string, point: PointObject }) => void): void
    off(event: 'client-circle-start', handler: (clientId: string, data: { circleId: string, point: PointObject }) => void): void
    off(event: 'client-circle-continue', handler: (clientId: string, data: { circleId: string, point: PointObject }) => void): void
    off(event: 'client-square-start', handler: (clientId: string, data: { squareId: string, point: PointObject }) => void): void
    off(event: 'client-square-continue', handler: (clientId: string, data: { squareId: string, point: PointObject }) => void): void
    off(event: 'client-triangle-start', handler: (clientId: string, data: { triangleId: string, point: PointObject }) => void): void
    off(event: 'client-triangle-continue', handler: (clientId: string, data: { triangleId: string, point: PointObject }) => void): void
    off(event: 'client-react', handler: (clientId: string, data: string) => void): void
    off(event: string, handler: Handler) {
        if (event in this.handlers) {
            const index = this.handlers[event].indexOf(handler)
            this.handlers[event].splice(index, 1)
        }
    }

    private dispatch(event: string, args: any[]) {
        if (event in this.handlers) {
            for (const handler of this.handlers[event]) {
                handler(...args)
            }
        }
    }

    connect(client: ClientModel) {
        this.reconnect = true

        if (this.socket != null) {
            return
        }

        this.socket = new WebSocket(makeSocketURL(`${BASE}/api/v1/canvas/${this.canvasId}/client/`))

        this.socket.onopen = (event) => {
            this.broadcast('client-enter', client)
        }
        this.socket.onmessage = (event) => {
            // Parse
            const message = JSON.parse(event.data)
            // Process
            switch (message.type) {
                case 'client-enter': {
                    const clientId = message.clientId
                    const name = message.data.name
                    const tool = message.data.tool
                    const color = message.data.color
                    const width = message.data.width
                    const alpha = message.data.alpha
                    const position = message.data.position

                    this.clients[clientId] = new ClientModel(clientId, name, tool, color, width, alpha, position)

                    this.counts.views++
                    this.counts.clients++

                    break
                }
                case 'client-leave': {
                    const clientId = message.clientId

                    if (clientId in this.clients) {
                        delete this.clients[clientId]
                    }
                    
                    this.counts.clients--

                    break
                }
                case 'client-pointer-move': {
                    const clientId = message.clientId
                    const position = message.data

                    if (clientId in this.clients) {
                        this.clients[clientId].position = position
                    }

                    break
                }
                case 'client-pointer-out': {
                    const clientId = message.clientId

                    if (clientId in this.clients) {
                        this.clients[clientId].position = undefined
                    }

                    break
                }
                case 'client-pointer-over': {
                    const clientId = message.clientId
                    const position = message.data

                    if (clientId in this.clients) {
                        this.clients[clientId].position = position
                    }

                    break
                }
                case 'client-tool': {
                    const clientId = message.clientId
                    const tool = message.data
                    
                    if (clientId in this.clients) {
                        this.clients[clientId].tool = tool
                    }
                    
                    break
                }
                case 'client-color': {
                    const clientId = message.clientId
                    const color = message.data
                    
                    if (clientId in this.clients) {
                        this.clients[clientId].color = color
                    }
                    
                    break
                }
                case 'client-width': {
                    const clientId = message.clientId
                    const width = message.data
                    
                    if (clientId in this.clients) {
                        this.clients[clientId].width = width
                    }

                    break
                }
                case 'client-alpha': {
                    const clientId = message.clientId
                    const alpha = message.data
                    
                    if (clientId in this.clients) {
                        this.clients[clientId].alpha = alpha
                    }

                    break
                }
                case 'client-line-start': {
                    const clientId = message.clientId
                    const lineId = message.data.lineId
                    const point = message.data.point
                    
                    const color = this.clients[clientId].color
                    const width = this.clients[clientId].width
                    const alpha = this.clients[clientId].alpha

                    this.lines[lineId] = new LineModel(lineId, clientId, color, width, alpha, [point])

                    this.coordinates.x.min = Math.min(this.coordinates.x.min, point.x)
                    this.coordinates.x.max = Math.max(this.coordinates.x.max, point.x)

                    this.coordinates.y.min = Math.min(this.coordinates.y.min, point.y)
                    this.coordinates.y.max = Math.max(this.coordinates.y.max, point.y)

                    break
                }
                case 'client-line-continue': {
                    const lineId = message.data.lineId
                    const point = message.data.point

                    if (lineId in this.lines) {
                        this.lines[lineId].points.push(point)

                        this.coordinates.x.min = Math.min(this.coordinates.x.min, point.x)
                        this.coordinates.x.max = Math.max(this.coordinates.x.max, point.x)
    
                        this.coordinates.y.min = Math.min(this.coordinates.y.min, point.y)
                        this.coordinates.y.max = Math.max(this.coordinates.y.max, point.y)
                    }

                    break
                }
                case 'client-straightLine-start': {
                    const clientId = message.clientId
                    const straightLineId = message.data.straightLineId
                    const point = message.data.point
                    
                    const color = this.clients[clientId].color
                    const width = this.clients[clientId].width
                    const alpha = this.clients[clientId].alpha

                    this.straightLines[straightLineId] = new StraightLineModel(straightLineId, clientId, color, width, alpha, point, point)

                    this.coordinates.x.min = Math.min(this.coordinates.x.min, point.x)
                    this.coordinates.x.max = Math.max(this.coordinates.x.max, point.x)

                    this.coordinates.y.min = Math.min(this.coordinates.y.min, point.y)
                    this.coordinates.y.max = Math.max(this.coordinates.y.max, point.y)

                    break
                }
                case 'client-straightLine-continue': {
                    const straightLineId = message.data.straightLineId
                    const point = message.data.point

                    if (straightLineId in this.straightLines) {
                        this.straightLines[straightLineId].end = point

                        this.coordinates.x.min = Math.min(this.coordinates.x.min, point.x)
                        this.coordinates.x.max = Math.max(this.coordinates.x.max, point.x)
    
                        this.coordinates.y.min = Math.min(this.coordinates.y.min, point.y)
                        this.coordinates.y.max = Math.max(this.coordinates.y.max, point.y)
                    }

                    break
                }
                case 'client-circle-start': {
                    const clientId = message.clientId
                    const circleId = message.data.circleId
                    const point = message.data.point
                    
                    const color = this.clients[clientId].color
                    const width = this.clients[clientId].width
                    const alpha = this.clients[clientId].alpha

                    this.circles[circleId] = new CircleModel(circleId, clientId, color, width, alpha, point, point)

                    this.coordinates.x.min = Math.min(this.coordinates.x.min, point.x)
                    this.coordinates.x.max = Math.max(this.coordinates.x.max, point.x)

                    this.coordinates.y.min = Math.min(this.coordinates.y.min, point.y)
                    this.coordinates.y.max = Math.max(this.coordinates.y.max, point.y)

                    break
                }
                case 'client-circle-continue': {
                    const circleId = message.data.circleId
                    const point = message.data.point

                    if (circleId in this.circles) {
                        this.circles[circleId].end = point

                        this.coordinates.x.min = Math.min(this.coordinates.x.min, point.x)
                        this.coordinates.x.max = Math.max(this.coordinates.x.max, point.x)
    
                        this.coordinates.y.min = Math.min(this.coordinates.y.min, point.y)
                        this.coordinates.y.max = Math.max(this.coordinates.y.max, point.y)
                    }

                    break
                }
                case 'client-square-start': {
                    const clientId = message.clientId
                    const squareId = message.data.squareId
                    const point = message.data.point
                    
                    const color = this.clients[clientId].color
                    const width = this.clients[clientId].width
                    const alpha = this.clients[clientId].alpha

                    this.squares[squareId] = new SquareModel(squareId, clientId, color, width, alpha, point, point)

                    this.coordinates.x.min = Math.min(this.coordinates.x.min, point.x)
                    this.coordinates.x.max = Math.max(this.coordinates.x.max, point.x)

                    this.coordinates.y.min = Math.min(this.coordinates.y.min, point.y)
                    this.coordinates.y.max = Math.max(this.coordinates.y.max, point.y)

                    break
                }
                case 'client-square-continue': {
                    const squareId = message.data.squareId
                    const point = message.data.point

                    if (squareId in this.squares) {
                        this.squares[squareId].end = point

                        this.coordinates.x.min = Math.min(this.coordinates.x.min, point.x)
                        this.coordinates.x.max = Math.max(this.coordinates.x.max, point.x)
    
                        this.coordinates.y.min = Math.min(this.coordinates.y.min, point.y)
                        this.coordinates.y.max = Math.max(this.coordinates.y.max, point.y)
                    }

                    break
                }
                case 'client-triangle-start': {
                    const clientId = message.clientId
                    const triangleId = message.data.triangleId
                    const point = message.data.point
                    
                    const color = this.clients[clientId].color
                    const width = this.clients[clientId].width
                    const alpha = this.clients[clientId].alpha

                    this.triangles[triangleId] = new TriangleModel(triangleId, clientId, color, width, alpha, point, point)

                    this.coordinates.x.min = Math.min(this.coordinates.x.min, point.x)
                    this.coordinates.x.max = Math.max(this.coordinates.x.max, point.x)

                    this.coordinates.y.min = Math.min(this.coordinates.y.min, point.y)
                    this.coordinates.y.max = Math.max(this.coordinates.y.max, point.y)

                    break
                }
                case 'client-triangle-continue': {
                    const triangleId = message.data.triangleId
                    const point = message.data.point

                    if (triangleId in this.squares) {
                        this.squares[triangleId].end = point

                        this.coordinates.x.min = Math.min(this.coordinates.x.min, point.x)
                        this.coordinates.x.max = Math.max(this.coordinates.x.max, point.x)
    
                        this.coordinates.y.min = Math.min(this.coordinates.y.min, point.y)
                        this.coordinates.y.max = Math.max(this.coordinates.y.max, point.y)
                    }

                    break
                }
                case 'client-react': {
                    const reaction = message.data

                    if (!(reaction in this.reactions)) {
                        this.reactions[reaction] = 1
                    } else {
                        this.reactions[reaction]++
                    }

                    this.counts.reactions++

                    break
                }
                case 'init-timestamps': {
                    this.timestamps = message.data

                    break
                }
                case 'init-counts': {
                    this.counts = message.data

                    break
                }
                case 'init-coordinates': {
                    this.coordinates = message.data

                    this.updateCenter()
                    this.updateZoom()

                    break
                }
                case 'init-reactions': {
                    this.reactions = message.data

                    break
                }
                case 'init-client': {
                    const clientId = message.data.clientId
                    const name = message.data.name
                    const tool = message.data.tool
                    const color = message.data.color
                    const width = message.data.width
                    const alpha = message.data.alpha
                    const position = message.data.position

                    this.clients[clientId] = new ClientModel(clientId, name, tool, color, width, alpha, position)

                    break
                }
                case 'init-line': {
                    const lineId = message.data.lineId
                    const clientId = message.data.clientId
                    const color = message.data.color
                    const width = message.data.width
                    const alpha = message.data.alpha
                    const points = message.data.points

                    this.lines[lineId] = new LineModel(lineId, clientId, color, width, alpha, points)

                    break
                }
                case 'init-straightLine': {
                    const straightLineId = message.data.straightLineId
                    const clientId = message.data.clientId
                    const color = message.data.color
                    const width = message.data.width
                    const alpha = message.data.alpha
                    const start = message.data.start
                    const end = message.data.end

                    this.straightLines[straightLineId] = new StraightLineModel(straightLineId, clientId, color, width, alpha, start, end)

                    break
                }
                case 'init-circle': {
                    const circleId = message.data.circleId
                    const clientId = message.data.clientId
                    const color = message.data.color
                    const width = message.data.width
                    const alpha = message.data.alpha
                    const start = message.data.start
                    const end = message.data.end

                    this.circles[circleId] = new CircleModel(circleId, clientId, color, width, alpha, start, end)

                    break
                }
                case 'init-square': {
                    const squareId = message.data.squareId
                    const clientId = message.data.clientId
                    const color = message.data.color
                    const width = message.data.width
                    const alpha = message.data.alpha
                    const start = message.data.start
                    const end = message.data.end

                    this.squares[squareId] = new SquareModel(squareId, clientId, color, width, alpha, start, end)

                    break
                }
                case 'init-triangle': {
                    const triangleId = message.data.triangleId
                    const clientId = message.data.clientId
                    const color = message.data.color
                    const width = message.data.width
                    const alpha = message.data.alpha
                    const start = message.data.start
                    const end = message.data.end

                    this.triangles[triangleId] = new TriangleModel(triangleId, clientId, color, width, alpha, start, end)

                    break
                }
            }
            // Dispatch
            if ('clientId' in message && 'data' in message) {
                this.dispatch(message.type, [message.clientId, message.data])
            } else if ('clientId' in message) {
                this.dispatch(message.type, [message.clientId])
            } else if ('data' in message) {
                this.dispatch(message.type, [message.data])
            } else {
                this.dispatch(message.type, [])
            }
            // Draw
            this.draw()
        }
        this.socket.onerror = (event) => {
            // Close
            this.socket.close()
        }
        this.socket.onclose = (event) => {
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

    broadcast(type: 'client-enter', data: ClientObject): void
    broadcast(type: 'client-leave'): void
    broadcast(type: 'client-tool', data: string): void
    broadcast(type: 'client-color', data: string): void
    broadcast(type: 'client-width', data: number): void
    broadcast(type: 'client-alpha', data: number): void
    broadcast(type: 'client-pointer-over', data: PointObject): void
    broadcast(type: 'client-pointer-move', data: PointObject): void
    broadcast(type: 'client-pointer-out'): void
    broadcast(type: 'client-line-start', data: { lineId: string, point: PointObject }): void
    broadcast(type: 'client-line-continue', data: { lineId: string, point: PointObject }): void
    broadcast(type: 'client-straightLine-start', data: { straightLineId: string, point: PointObject }): void
    broadcast(type: 'client-straightLine-continue', data: { straightLineId: string, point: PointObject }): void
    broadcast(type: 'client-circle-start', data: { circleId: string, point: PointObject }): void
    broadcast(type: 'client-circle-continue', data: { circleId: string, point: PointObject }): void
    broadcast(type: 'client-square-start', data: { squareId: string, point: PointObject }): void
    broadcast(type: 'client-square-continue', data: { squareId: string, point: PointObject }): void
    broadcast(type: 'client-triangle-start', data: { triangleId: string, point: PointObject }): void
    broadcast(type: 'client-triangle-continue', data: { triangleId: string, point: PointObject }): void
    broadcast(type: 'client-react', data: string): void
    broadcast(type: string, data?: any) {
        if (this.socket && this.socket.readyState == WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type, data }))
        }
    }

    draw() {
        if (this.center && this.zoom) {
            draw(this.canvasNode, this.center, this.zoom, this)
        }
    }
}