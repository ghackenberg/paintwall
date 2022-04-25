// GLOBAL CONSTANTS AND VARIABLES

// DOM nodes

// Get references to DOM element nodes
const body = document.body
const input = document.getElementById('input')
const canvas = document.getElementById('canvas')
// Get reference to HTML 5 Canvas 2D context
const context = canvas.getContext('2d')

// Web socket

// Define web socket connection parameters
const canvasId = 'test'
const clientId = '' + Math.random()
const name = prompt("What's your name?")
// Create web socket connection
const socket = new WebSocket('ws://localhost:8080/api/v1/canvas/' + canvasId + '/client/' + clientId)

// App data

// Define names, positions, and lines
const names = {}
const colors = {}
const widths = {}
const alphas = {}
const positions = {}
const lines = {}
// Define current line parameters
var lineId = undefined
var points = undefined
var color = 'black'
var width = 5
var alpha = 0.5