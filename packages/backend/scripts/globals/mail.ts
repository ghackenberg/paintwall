import { createTransport } from 'nodemailer'
import { CONFIG } from './config'

export const MAIL = createTransport(CONFIG.mail)

MAIL.verify((error, success) => {
    if (error) {
        console.error(error)
    }
})