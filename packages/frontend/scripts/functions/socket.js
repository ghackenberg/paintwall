// CONSTANTS

const clientId = Math.random().toString(16).substring(2)

const socketProtocol = location.protocol == 'http:' ? 'ws:' : 'wss:'
const socketHost = location.host

// FUNCTIONS

function makeSocketURL(path) {
    return socketProtocol + '//' + socketHost + path + clientId
}