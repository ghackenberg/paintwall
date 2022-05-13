import { Router } from 'express'
import { join } from 'path'
import { BASE } from '../globals/config'

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
    router.get(BASE + '/scripts/*', (request, response) => {
        response.sendFile(join(process.cwd(), '..', 'frontend', request.url.substring(BASE.length)))
    })
    router.get(BASE + '/manifest.json', (request, response) => {
        response.sendFile(join(process.cwd(), '..', 'frontend', request.url.substring(BASE.length)))
    })
    router.get(BASE + '/*', (request, response) => {
        response.sendFile(join(process.cwd(), '..', 'frontend', 'index.html'))
    })

    return router
}
