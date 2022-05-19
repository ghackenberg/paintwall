import { StringLiteralType } from "typescript"

export const BASE = '/paintwall'

export interface PointObject {
    x: number
    y: number
}

export interface ShapeObject {
    clientId: string
    color: string
    width: number
    alpha: number
}

export interface LineObject extends ShapeObject {
    lineId: string
    points: PointObject[]
}

export interface LineObjectMap {
    [id: string]: LineObject
}

export interface CircleObject extends ShapeObject {
    circleId: string
    start: PointObject
    end: PointObject
}

export interface CircleObjectMap {
    [id: string]: CircleObject
}

export interface SquareObject extends ShapeObject {
    squareId: string
    start: PointObject
    end: PointObject
}

export interface SquareObjectMap {
    [id: string]: SquareObject
}

export interface CommentObject {
    commentId: string
    parentId?: string
    clientId: string
    content: string
}

export interface CommentObjectMap {
    [id: string]: CommentObject
}

export interface ClientObject extends ShapeObject {
    name: string
    tool: string
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
    shapes: number
    clients: number
    reactions: number
    comments: number
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
    circles: CircleObjectMap
    squares: SquareObjectMap
    comments: CommentObjectMap
}