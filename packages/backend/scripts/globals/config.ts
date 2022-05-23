import { readFileSync } from 'fs'

const CONFIG_FILE = 'config.json'

interface ConfigObject {
    jwt: {
        secret: string
    }
    mail: {
        host: string
        port: number
        secure: boolean
        auth: {
            user: string
            pass: string
        }
    }
}

export const CONFIG: ConfigObject = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))