import { PointObject, TriangleObject } from 'paintwall-common'

export class TriangleModel implements TriangleObject {

    triangleId: string
    clientId: string
    userId: string
    color: string
    width: number
    alpha: number
    start: PointObject
    end: PointObject

    constructor(triangleId: string, clientId: string, userId: string, color: string, width: number, alpha: number, start: PointObject, end: PointObject) {
        this.triangleId = triangleId
        this.clientId = clientId
        this.userId = userId
        this.color = color
        this.width = width
        this.alpha = alpha
        this.start = start
        this.end = end
    }
    
}