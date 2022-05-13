import { Router } from 'express'
import { BASE } from 'paintwall-common'
import { CANVAS_OBJECT_MAP } from '../globals/db'

export function api() {
    const router = Router()

    router.get(BASE + '/api/v1/canvas/', (request, response) => {
        const result = []
        // Convert database entries into array
        for (const canvasObject of Object.values(CANVAS_OBJECT_MAP)) {
            // Append canvas object
            result.push(canvasObject)
        }
        // Send array
        response.send(result.sort((a, b) => a.timestamps.created - b.timestamps.created))
    })

    router.get(BASE + '/api/v1/canvas/:canvas', (request, response) => {
        // Parse path parameter
        const canvasId = request.params.canvas
        // Check if canvas exists in database
        if (canvasId in CANVAS_OBJECT_MAP) {
            // Send canvas object
            response.send(CANVAS_OBJECT_MAP[canvasId])
        } else {
            // Return not found code
            response.status(404).send()
        }
    })

    return router
}