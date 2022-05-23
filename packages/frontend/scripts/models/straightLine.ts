import { StraightLineObject, PointObject } from 'paintwall-common'

export class StraightLineModel implements StraightLineObject {

    straightLineId: string
    clientId: string
    color: string
    width: number
    alpha: number
    start: PointObject
    end: PointObject

    constructor(straightLineId: string, clientId: string, color: string, width: number, alpha: number, start: PointObject, end: PointObject) {
        this.straightLineId = straightLineId
        this.clientId = clientId
        this.color = color
        this.width = width
        this.alpha = alpha
        this.start = start
        this.end = end
    }
    
}