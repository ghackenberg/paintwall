import { CircleObject, LineObject, PointObject } from 'paintwall-common'

export class CircleModel implements CircleObject {

    circleId: string
    clientId: string
    color: string
    width: number
    alpha: number
    start: PointObject
    end: PointObject

    constructor(circleId: string, clientId: string, color: string, width: number, alpha: number, start: PointObject, end: PointObject) {
        this.circleId = circleId
        this.clientId = clientId
        this.color = color
        this.width = width
        this.alpha = alpha
        this.start = start
        this.end = end
    }
    
}