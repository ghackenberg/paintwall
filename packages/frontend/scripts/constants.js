// GLOBAL CONSTANTS

// DOM element nodes
const body = document.body
const input = document.getElementById('input')
const canvas = document.getElementById('canvas')

// HTML 5 Canvas 2D context
const context = canvas.getContext('2d')

// Client information
const clientId = Math.random().toString(16).substring(2)
const clientName = prompt("What's your name?", localStorage.getItem('name') || '') || 'Anonymous'

localStorage.setItem('name', clientName)

// Socket informaiton
const socketProtocol = location.protocol == 'http:' ? 'ws:' : 'wss:'
const socketHost = location.host