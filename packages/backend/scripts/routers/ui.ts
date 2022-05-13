import { Router } from 'express'
import { BASE } from 'paintwall-common'
import { join } from 'path'

export function ui() {
    const router = Router()

    router.get(BASE + '/.well-known/*', (request, response) => {
        response.sendFile(join(process.cwd(), '..', 'frontend', request.url.substring(BASE.length)))
    })
    router.get(BASE + '/images/*', (request, response) => {
        response.sendFile(join(process.cwd(), '..', 'frontend', request.url.substring(BASE.length)))
    })
    router.get(BASE + '/styles/*', (request, response) => {
        response.sendFile(join(process.cwd(), '..', 'frontend', request.url.substring(BASE.length)))
    })
    router.get(BASE + '/scripts/services/cache.js', (request, response) => {
        response.sendFile(join(process.cwd(), '..', 'worker', 'bundle.js'))
    })
    router.get(BASE + '/scripts/main.js', (request, response) => {
        response.sendFile(join(process.cwd(), '..', 'frontend', 'bundle.js'))
    })
    router.get(BASE + '/manifest.json', (request, response) => {
        response.sendFile(join(process.cwd(), '..', 'frontend', 'manifest.json'))
    })
    router.get(BASE + '/*', (request, response) => {
        response.sendFile(join(process.cwd(), '..', 'frontend', 'index.html'))
    })

    return router
}
