import { StraightLineObject, PointObject } from 'paintwall-common'

export class StraightLineModel implements StraightLineObject {

    straightLineId: string
    clientId: string
    userId: string
    color: string
    width: number
    alpha: number
    start: PointObject
    end: PointObject

    constructor(straightLineId: string, clientId: string, userId: string, color: string, width: number, alpha: number, start: PointObject, end: PointObject) {
        this.straightLineId = straightLineId
        this.clientId = clientId
        this.userId = userId
        this.color = color
        this.width = width
        this.alpha = alpha
        this.start = start
        this.end = end
    }
    
}