import { Router } from 'express'
import { sign, verify } from 'jsonwebtoken'
import { BASE, UserObject } from 'paintwall-common'
import { CONFIG } from '../globals/config'
import { CANVAS_OBJECT_MAP, TOKEN_OBJECT_MAP, USER_OBJECT_EMAIL_MAP, USER_OBJECT_MAP } from '../globals/db'
import { MAIL } from '../globals/mail'

export function api() {
    const router = Router()

    router.post(BASE + '/api/v1/token/', (request, response) => {
        const tokenId = Math.random().toString(16).substring(2)
        const email = request.body.email
        const code = Math.random().toString(16).substring(2, 6)
        TOKEN_OBJECT_MAP[tokenId] = { tokenId, email, code }
        MAIL.sendMail({ from: 'PaintWall <' + CONFIG.mail.auth.user + '>', to: email, text: 'Your code: ' + code }, (error, info) => {
            if (error) {
                console.error(error)
                console.log(TOKEN_OBJECT_MAP[tokenId])
            }
        })
        response.status(200).json(TOKEN_OBJECT_MAP[tokenId])
    })

    router.delete(BASE + '/api/v1/token/:id', (request, response) => {
        const tokenId = request.params.id
        const code = typeof request.query.code == 'string' ? request.query.code : undefined
        if (tokenId in TOKEN_OBJECT_MAP && TOKEN_OBJECT_MAP[tokenId].code == code) {
            const tokenObject = TOKEN_OBJECT_MAP[tokenId]
            const email = tokenObject.email
            if (!(email in USER_OBJECT_EMAIL_MAP)) {
                const userId = Math.random().toString(16).substring(2)
                const name: string = null
                const slogan: string = null
                const userObject = { userId, email, name, slogan }
                USER_OBJECT_MAP[userId] = userObject
                USER_OBJECT_EMAIL_MAP[email] = userObject
            }
            const userObject = USER_OBJECT_EMAIL_MAP[email]
            const userId = userObject.userId
            delete TOKEN_OBJECT_MAP[tokenId]
            response.setHeader('authorization', sign(userId, CONFIG.jwt.secret))
            response.status(200).json(tokenObject)
        } else {
            response.status(403).send()
        }
    })

    router.get(BASE + '/api/v1/user/', (request, response) => {
        const result: UserObject[] = []
        for (const userObject of Object.values(USER_OBJECT_MAP)) {
            result.push({ ...userObject, email: undefined })
        }
        response.status(200).json(result)
    })

    router.get(BASE + '/api/v1/user/:id', (request, response) => {
        const userId = request.params.id
        if (!(userId in USER_OBJECT_MAP)) {
            response.status(404).send()
        } else {
            response.status(200).json({ ...USER_OBJECT_MAP[userId], email: undefined })
        }
    })

    router.put(BASE + '/api/v1/user/:id', (request, response) => {
        try {
            const authUserId = verify(request.header('authentication'), CONFIG.jwt.secret)
            const userId = request.params.userId
            if (authUserId != userId) {
                response.status(403).send()
            } else {
                USER_OBJECT_MAP[userId].name = request.body.name
                USER_OBJECT_MAP[userId].slogan = request.body.slogan
                response.status(200).json(USER_OBJECT_MAP[userId])
            }
        } catch (error) {
            response.status(403).send()
        }
    })

    router.delete(BASE + '/api/v1/user/:id', (request, response) => {
        try {
            const authUserId = verify(request.header('authentication'), CONFIG.jwt.secret)
            const userId = request.params.id
            if (authUserId != userId) {
                response.status(403).send()
            } else {
                const userObject = USER_OBJECT_MAP[userId]
                delete USER_OBJECT_MAP[userId]
                response.status(200).json(userObject)
            }
        } catch (error) {
            response.status(403).send()
        }
    })

    router.get(BASE + '/api/v1/canvas/', (request, response) => {
        const result = []
        // Convert database entries into array
        for (const canvasObject of Object.values(CANVAS_OBJECT_MAP)) {
            // Append canvas object
            result.push(canvasObject)
        }
        // Send array
        response.json(result.sort((a, b) => a.timestamps.created - b.timestamps.created))
    })

    router.get(BASE + '/api/v1/canvas/:canvas', (request, response) => {
        // Parse path parameter
        const canvasId = request.params.canvas
        // Check if canvas exists in database
        if (canvasId in CANVAS_OBJECT_MAP) {
            // Send canvas object
            response.json(CANVAS_OBJECT_MAP[canvasId])
        } else {
            // Return not found code
            response.status(404).send()
        }
    })

    return router
}