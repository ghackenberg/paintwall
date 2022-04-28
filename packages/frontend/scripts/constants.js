// GLOBAL CONSTANTS

// DOM nodes
const browseNode = document.getElementById('browse')
const paintNode = document.getElementById('paint')
const qrcodeNode = document.getElementById('qrcode')
const canvasNode = document.getElementById('canvas')
const colorNode = document.getElementById('color')

// HTML 5 Canvas 2D context
const context = canvasNode.getContext('2d')

// Client information
const clientId = Math.random().toString(16).substring(2)

// Socket informaiton
const socketProtocol = location.protocol == 'http:' ? 'ws:' : 'wss:'
const socketHost = location.host