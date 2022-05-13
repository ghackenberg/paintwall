import { readFileSync, writeFileSync } from 'fs'
import { CanvasObjectMap, CanvasSocketMap, ClientSocketMap } from 'paintwall-common'
import { DATABASE } from './config'

function loadCanvasObjectMap(): CanvasObjectMap {
    try {
        console.log('Loading canvasObjectMap')
        return JSON.parse(readFileSync(DATABASE, 'utf-8'))
    } catch (error) {
        console.log('Initializing canvasObjectMap')
        return {}
    }
}

function saveCanvasObjectMap() {
    try {
        console.log('Saving canvasObjectMap')
        writeFileSync(DATABASE, JSON.stringify(CANVAS_OBJECT_MAP))
    } catch (error) {
        console.error(error)
    }
}

export const CLIENT_SOCKET_MAP: ClientSocketMap = {}
export const CANVAS_SOCKET_MAP: CanvasSocketMap = {}
export const CANVAS_OBJECT_MAP: CanvasObjectMap = loadCanvasObjectMap()

// Reset database
for (const canvasObject of Object.values(CANVAS_OBJECT_MAP)) {
    // Reset counts
    canvasObject.counts.clients = 0
    // Reset clients
    canvasObject.clients = {}
}

setInterval(saveCanvasObjectMap, 30000)