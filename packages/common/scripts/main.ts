export const BASE = '/paintwall'

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

export interface LineObjectMap {
    [id: string]: LineObject
}

export interface ClientObject {
    clientId: string
    name: string
    color: string
    width: number
    alpha: number
    position: PointObject
}

export interface ClientObjectMap {
    [id: string]: ClientObject
}

export interface TimestampData {
    created: number
    updated: number
}

export interface CountData {
    views: number
    clients: number
    reactions: number
}

export interface CoordinateData {
    x: {
        min: number
        max: number
    }
    y: {
        min: number
        max: number
    }
}

export interface ReactionData {
    [id: string]: number
}

export interface CanvasObject {
    canvasId: string
    timestamps: TimestampData
    counts: CountData
    coordinates: CoordinateData
    reactions: ReactionData
    clients: ClientObjectMap
    lines: LineObjectMap
}