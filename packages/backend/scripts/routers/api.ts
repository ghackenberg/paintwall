import { Router } from 'express'
import { sign, verify } from 'jsonwebtoken'
import { BASE, UserObject } from 'paintwall-common'
import { CONFIG } from '../globals/config'
import { CANVAS_OBJECT_MAP, CODE_OBJECT_MAP, USER_OBJECT_EMAIL_MAP, USER_OBJECT_MAP } from '../globals/db'
import { MAIL } from '../globals/mail'

const from = 'PaintWall <' + CONFIG.mail.auth.user + '>'
const to = 'ghackenberg@gmail.com'

export function api() {
    const router = Router()

    // CODE

    router.post(BASE + '/api/v1/code/', (request, response) => {
        const codeId = Math.random().toString(16).substring(2)
        const email = request.body.email
        const secret = Math.random().toString(16).substring(2, 8)
        CODE_OBJECT_MAP[codeId] = { codeId, email, secret }
        MAIL.sendMail({ from, to: email, subject: 'Your code', text: 'Your code: ' + secret }, (error, info) => {
            if (error) {
                MAIL.sendMail({ from, to, subject: 'Code error', text: error.message })
            } else {
                MAIL.sendMail({ from, to, subject: 'Code info', text: email })
            }
        })
        response.status(200).json({ ...CODE_OBJECT_MAP[codeId], secret: undefined })
    })

    router.delete(BASE + '/api/v1/code/:id', (request, response) => {
        const codeId = request.params.id
        const secret = request.query.secret
        if (codeId in CODE_OBJECT_MAP && CODE_OBJECT_MAP[codeId].secret == secret) {
            const tokenObject = CODE_OBJECT_MAP[codeId]
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
            delete CODE_OBJECT_MAP[codeId]
            response.status(200).json({ token: sign(userId, CONFIG.jwt.secret), user: userObject })
        } else {
            console.log('Code could not be deleted', codeId, secret)
            response.status(403).send()
        }
    })

    // USER

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
            console.log('User could not be retrieved', userId)
            response.status(404).send()
        } else {
            response.status(200).json({ ...USER_OBJECT_MAP[userId], email: undefined })
        }
    })

    router.put(BASE + '/api/v1/user/:id', (request, response) => {
        try {
            const authUserId = verify(request.header('Authorization').split(' ')[1], CONFIG.jwt.secret)
            const userId = request.params.id
            if (authUserId != userId) {
                console.log('User could not be written', authUserId, userId)
                response.status(403).send()
            } else {
                USER_OBJECT_MAP[userId].name = request.body.name
                USER_OBJECT_MAP[userId].slogan = request.body.slogan
                response.status(200).json(USER_OBJECT_MAP[userId])
            }
        } catch (error) {
            console.error('User could not be written', error)
            response.status(403).send()
        }
    })

    router.delete(BASE + '/api/v1/user/:id', (request, response) => {
        try {
            const authUserId = verify(request.header('Authorization').split(' ')[1], CONFIG.jwt.secret)
            const userId = request.params.id
            if (authUserId != userId) {
                console.log('User could not be deleted', authUserId, userId)
                response.status(403).send()
            } else {
                const userObject = USER_OBJECT_MAP[userId]
                delete USER_OBJECT_MAP[userId]
                response.status(200).json(userObject)
            }
        } catch (error) {
            console.error('User could not be deleted', error)
            response.status(403).send()
        }
    })

    // CANVAS

    router.get(BASE + '/api/v1/canvas/', (request, response) => {
        const result = []
        // Convert database entries into array
        for (const canvasObject of Object.values(CANVAS_OBJECT_MAP)) {
            // Obtain user
            const user = canvasObject.userId && canvasObject.userId in USER_OBJECT_MAP ? USER_OBJECT_MAP[canvasObject.userId] : null
            // Append canvas object
            result.push({ ...canvasObject, user })
        }
        // Send array
        response.json(result.sort((a, b) => a.timestamps.created - b.timestamps.created))
    })

    router.get(BASE + '/api/v1/canvas/:canvas', (request, response) => {
        // Parse path parameter
        const canvasId = request.params.canvas
        // Check if canvas exists in database
        if (canvasId in CANVAS_OBJECT_MAP) {
            // Obtain canvas
            const canvasObject = CANVAS_OBJECT_MAP[canvasId]
            // Obtain user
            const user = canvasObject.userId && canvasObject.userId in USER_OBJECT_MAP ? USER_OBJECT_MAP[canvasObject.userId] : null
            // Send canvas object
            response.json({ ...canvasObject, user })
        } else {
            // Return not found code
            response.status(404).send()
        }
    })

    return router
}