export interface PointObject {
    x: number
    y: number
}

export interface LineObject {
    lineId: string
    clientId: string
    color: string
    width: number
    alpha: number
    points: PointObject[]
}

export interface ClientObject {
    clientId: string
    name: string
    color: string
    width: number
    alpha: number
    position: PointObject
}

export interface CanvasObject {
    canvasId: string
    timestamps: {
        created: number
        updated: number
    }
    counts: {
        views: number
        clients: number
        reactions: number
    }
    coordinates: {
        x: {
            min: number
            max: number
        }
        y: {
            min: number
            max: number
        }
    }
    reactions: {
        [id: string]: number
    }
    clients: {
        [id: string]: ClientObject
    }
    lines: {
        [id: string]: LineObject
    }
}

export interface ClientSocketMap {
    [id: string]: WebSocket
}

export interface CanvasSocketMap {
    [id: string]: ClientSocketMap
}

export interface CanvasObjectMap {
    [id: string]: CanvasObject
}