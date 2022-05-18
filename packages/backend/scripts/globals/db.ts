import * as WebSocket from 'ws'
import { readFileSync, writeFileSync } from 'fs'
import { CanvasObject } from 'paintwall-common'

const canvasObjectMapFile = 'database.json'

function loadCanvasObjectMap(): CanvasObjectMap {
    try {
        console.log('Loading canvasObjectMap')
        return JSON.parse(readFileSync(canvasObjectMapFile, 'utf-8'))
    } catch (error) {
        console.log('Initializing canvasObjectMap')
        return {}
    }
}

function saveCanvasObjectMap() {
    try {
        console.log('Saving canvasObjectMap')
        writeFileSync(canvasObjectMapFile, JSON.stringify(CANVAS_OBJECT_MAP))
    } catch (error) {
        console.error(error)
    }
}

interface ClientSocketMap {
    [id: string]: WebSocket
}

interface CanvasSocketMap {
    [id: string]: ClientSocketMap
}

interface CanvasObjectMap {
    [id: string]: CanvasObject
}

export const CLIENT_SOCKET_MAP: ClientSocketMap = {}
export const CANVAS_SOCKET_MAP: CanvasSocketMap = {}
export const CANVAS_OBJECT_MAP: CanvasObjectMap = loadCanvasObjectMap()

// Reset database
for (const canvasObject of Object.values(CANVAS_OBJECT_MAP)) {
    // Initial circles and squares for existing canvasObjects
    if (!('circles' in canvasObject)) {
        canvasObject.circles = {}
    }
    if (!('squares' in canvasObject)) {
        canvasObject.squares = {}
    }
    // Reset counts
    canvasObject.counts.clients = 0
    // Reset clients
    canvasObject.clients = {}
}

setInterval(saveCanvasObjectMap, 30000)