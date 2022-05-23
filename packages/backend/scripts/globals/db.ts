import * as WebSocket from 'ws'
import { readFileSync, writeFileSync } from 'fs'
import { CanvasObject, UserObjectMap } from 'paintwall-common'

const USER_OBJECT_MAP_FILE = 'user.json'
const CANVAS_OBJECT_MAP_FILE = 'canvas.json'

function loadUserObjectMap(): UserObjectMap {
    try {
        console.log('Loading USER_OBJECT_MAP')
        return JSON.parse(readFileSync(USER_OBJECT_MAP_FILE, 'utf-8'))
    } catch (error) {
        console.log('Initializing USER_OBJECT_MAP')
        return {}
    }
}

function loadCanvasObjectMap(): CanvasObjectMap {
    try {
        console.log('Loading CANVAS_OBJECT_MAP')
        return JSON.parse(readFileSync(CANVAS_OBJECT_MAP_FILE, 'utf-8'))
    } catch (error) {
        console.log('Initializing CANVAS_OBJECT_MAP')
        return {}
    }
}

function saveUserObjectMap() {
    try {
        console.log('Saving USER_OBJECT_MAP')
        writeFileSync(USER_OBJECT_MAP_FILE, JSON.stringify(USER_OBJECT_MAP))
    } catch (error) {
        console.error(error)
    }
}

function saveCanvasObjectMap() {
    try {
        console.log('Saving CANVAS_OBJECT_MAP')
        writeFileSync(CANVAS_OBJECT_MAP_FILE, JSON.stringify(CANVAS_OBJECT_MAP))
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
export const TOKEN_OBJECT_MAP: {[id: string]: { tokenId: string, email: string, code: string }} = {}
export const USER_OBJECT_MAP = loadUserObjectMap()
export const CANVAS_OBJECT_MAP = loadCanvasObjectMap()
export const USER_OBJECT_EMAIL_MAP: UserObjectMap = {}

// Initialize user
for (const userObject of Object.values(USER_OBJECT_MAP)) {
    USER_OBJECT_EMAIL_MAP[userObject.email] = userObject
}

// Reset canvas
for (const canvasObject of Object.values(CANVAS_OBJECT_MAP)) {
    if (!('userId' in canvasObject)) {
        canvasObject.userId = null
    }
    for (const line of Object.values(canvasObject.lines)) {
        if (!('userId' in line)) {
            line.userId = null
        }
    }
    for (const circle of Object.values(canvasObject.circles)) {
        if (!('userId' in circle)) {
            circle.userId = null
        }
    }
    for (const square of Object.values(canvasObject.squares)) {
        if (!('userId' in square)) {
            square.userId = null
        }
    }
    for (const triangle of Object.values(canvasObject.triangles)) {
        if (!('userId' in triangle)) {
            triangle.userId = null
        }
    }
    for (const straightLine of Object.values(canvasObject.straightLines)) {
        if (!('userId' in straightLine)) {
            straightLine.userId = null
        }
    }
    // Reset counts
    canvasObject.counts.clients = 0
    // Reset clients
    canvasObject.clients = {}
}

setTimeout(() => {
    setInterval(() => console.log('Saving data in 5 seconds'), 30000)
}, 0)
setTimeout(() => {
    setInterval(saveUserObjectMap, 30000)
}, 5000)
setTimeout(() => {
    setInterval(saveCanvasObjectMap, 30000)
}, 10000)
setTimeout(() => {
    setInterval(() => console.log('Saving data done'), 30000)
}, 15000)