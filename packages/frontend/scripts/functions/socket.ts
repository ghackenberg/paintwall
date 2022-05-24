import { CLIENT_ID } from '../constants/client'
import { USER_DATA } from '../constants/user'

// CONSTANTS

const socketProtocol = location.protocol == 'http:' ? 'ws:' : 'wss:'
const socketHost = location.host

// FUNCTIONS

export function makeSocketURL(path: string) {
    return socketProtocol + '//' + socketHost + path + CLIENT_ID + (USER_DATA.token ? '?token=' + USER_DATA.token : '')
}