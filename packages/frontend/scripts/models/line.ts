import { LineObject, PointObject } from 'paintwall-common'

export class LineModel implements LineObject {

    lineId: string
    clientId: string
    color: string
    width: number
    alpha: number
    points: PointObject[]

    constructor(lineId: string, clientId: string, color: string, width: number, alpha: number, points: PointObject[]) {
        this.lineId = lineId
        this.clientId = clientId
        this.color = color
        this.width = width
        this.alpha = alpha
        this.points = points
    }
    
}