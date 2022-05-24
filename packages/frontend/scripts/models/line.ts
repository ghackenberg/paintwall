import { LineObject, PointObject } from 'paintwall-common'

export class LineModel implements LineObject {

    lineId: string
    clientId: string
    userId: string
    color: string
    width: number
    alpha: number
    points: PointObject[]

    constructor(lineId: string, clientId: string, userId: string, color: string, width: number, alpha: number, points: PointObject[]) {
        this.lineId = lineId
        this.clientId = clientId
        this.userId = userId
        this.color = color
        this.width = width
        this.alpha = alpha
        this.points = points
    }
    
}