import * as express from 'express'
import * as expressWs from 'express-ws'
import { BASE } from 'paintwall-common'
import { api } from './routers/api'
import { ui } from './routers/ui'
import { ws } from './routers/ws'

// Create application

const application = express()

// Enable WebSocket support

expressWs(application)

// Register middleware

application.use((request, response, next) => {
    response.header('Service-Worker-Allowed', BASE + '/')
    next()
})
application.use(api())
application.use(ws())
application.use(ui())

// Regiser redirect handler

application.get('/*', (request, response) => {
    response.redirect(BASE + request.url)
})

// Listen

application.listen(8080)