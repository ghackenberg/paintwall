import { SquareObject, PointObject } from 'paintwall-common'

export class SquareModel implements SquareObject {

    squareId: string
    clientId: string
    userId: string
    color: string
    width: number
    alpha: number
    start: PointObject
    end: PointObject

    constructor(squareId: string, clientId: string, userId: string, color: string, width: number, alpha: number, start: PointObject, end: PointObject) {
        this.squareId = squareId
        this.clientId = clientId
        this.userId = userId
        this.color = color
        this.width = width
        this.alpha = alpha
        this.start = start
        this.end = end
    }
    
}