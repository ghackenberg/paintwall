import { BASE, CanvasObject } from 'paintwall-common'
import { a, append, button, canvas, clear, div, img, prepend, remove, span } from '../functions/html'
import { makeSocketURL } from '../functions/socket'
import { CanvasModel } from '../models/canvas'
import { BaseScreen } from './base'

interface CountNodeMap {
    [id: string]: HTMLSpanElement
}

export class BrowseScreen extends BaseScreen {
    // Counts

    canvasCount = 0

    // Models

    canvasModels: CanvasModel[] = []

    // Nodes

    logoNode: HTMLSpanElement
    createNode: HTMLButtonElement

    loadNode: HTMLImageElement
    canvasNode: HTMLDivElement

    clientCountNode: HTMLSpanElement
    canvasCountNode: HTMLSpanElement

    viewCountNodes: CountNodeMap = {}
    clientCountNodes: CountNodeMap = {}
    reactionCountNodes: CountNodeMap = {}

    imprintNode: HTMLAnchorElement
    dataNode: HTMLAnchorElement
    termsNode: HTMLAnchorElement

    // Connection

    socket: WebSocket = null
    request: XMLHttpRequest = null

    // Constructor

    constructor() {
        super('browse')

        // Logo
        this.logoNode = span({ id: 'logo' }, 'PaintWall')

        // Client count
        this.clientCountNode = span({ id: 'client-count', className: 'button' }, img({ className: 'load', src: BASE + '/images/load.png' }))

        // Button
        this.createNode = button({ id: 'canvas-create', className: 'button',
            onclick: () => {
                history.pushState(null, undefined, BASE + '/canvas/' + Math.random().toString(16).substring(2))
            }
        }, 'New canvas')

        // Header
        append(this.headerNode, [ this.logoNode, this.clientCountNode, this.createNode ])

        // Load
        this.loadNode = img({ className: 'load', src: BASE + '/images/load.png' })

        // Canvas count
        this.canvasCountNode = span({ id: 'canvas-count' })

        // Canvas
        this.canvasNode = div()

        // Main
        append(this.mainNode, [ this.canvasNode ])

        // Imprint
        this.imprintNode = a({ id: 'imprint',
            onclick: () => {
                history.pushState(null, undefined, BASE + '/imprint')
            }
        }, 'Imprint')

        // Data
        this.dataNode = a({ id: 'data',
            onclick: () => {
                history.pushState(null, undefined, BASE + '/data-protection')
            }
        }, 'Data protection')

        // Terms
        this.termsNode = a({ id: 'terms',
            onclick: () => {
                history.pushState(null, undefined, BASE + '/terms-of-use')
            }
        }, 'Terms of use')

        // Footer
        append(this.footerNode, [ this.imprintNode, this.dataNode, this.termsNode ])

        // Connect
        this.connect()
    }

    updateCanvasCount(total: number) {
        const loaded = this.canvasModels.length
        const difference = total - loaded

        this.canvasCount = total
        this.canvasCountNode.textContent = `${difference}`

        if (loaded > 0 && difference > 0) {
            if (!this.canvasCountNode.parentNode) {
                prepend(this.mainNode, [ this.canvasCountNode ])
            }
        } else {
            if (this.canvasCountNode.parentNode) {
                remove(this.mainNode, [ this.canvasCountNode ])
            }
        }
    }

    connect() {
        // Check
        if (this.socket) {
            return
        }
        // Socket
        this.socket = new WebSocket(makeSocketURL(BASE + '/api/v1/client/'))
        this.socket.onmessage = (event) => {
            // Parse
            const message = JSON.parse(event.data)
            // Switch
            switch (message.type) {
                case 'client-count': {
                    const count = message.data
                    this.clientCountNode.textContent = count
                    break
                }
                case 'canvas-count': {
                    const count = message.data
                    this.updateCanvasCount(count)
                    break
                }
                case 'canvas-view-count': {
                    const canvasId = message.data.canvasId
                    const count = message.data.count
                    if (canvasId in this.viewCountNodes) {
                        this.viewCountNodes[canvasId].textContent = count
                    }
                    break
                }
                case 'canvas-client-count': {
                    const canvasId = message.data.canvasId
                    const count = message.data.count
                    if (canvasId in this.clientCountNodes) {
                        this.clientCountNodes[canvasId].textContent = count
                    }
                    break
                }
                case 'canvas-reaction-count': {
                    const canvasId = message.data.canvasId
                    const count = message.data.count
                    if (canvasId in this.reactionCountNodes) {
                        this.reactionCountNodes[canvasId].textContent = count
                    }
                    break
                }
            }
        }
        this.socket.onerror = (event) => {
            // Close
            this.socket.close()
        }
        this.socket.onclose = (event) => {
            // Reset
            this.socket = null
            // Connect
            this.connect()
        }
    }

    show() {
        super.show()
        // Main
        this.mainNode.appendChild(this.loadNode)
        // Load
        this.load()
    }

    load() {
        // Check
        if (this.request) {
            return
        }
        // Request
        this.request = new XMLHttpRequest()
        this.request.onreadystatechange = () => {
            // Check
            if (this.request.readyState == XMLHttpRequest.DONE) {
                // Remove
                this.mainNode.removeChild(this.loadNode)
                // Parse
                const canvasObjects: CanvasObject[] = JSON.parse(this.request.responseText)
                // Reset
                this.request = null
                // Loop
                for (const canvasObject of canvasObjects.reverse()) {
                    // Extract information
                    const canvasId = canvasObject.canvasId
                    const timestamps = canvasObject.timestamps
                    const counts = canvasObject.counts
                    const coordinates = canvasObject.coordinates
                    const reactions = canvasObject.reactions
                    const clients = canvasObject.clients
                    const lines = canvasObject.lines
                    const circles = canvasObject.circles
                    const squares = canvasObject.squares

                    // Calculate informaton
                    const viewCount = counts.views
                    const clientCount = counts.clients
                    const reactionCount = counts.reactions

                    // Canvas node
                    const canvasNode = canvas()
                    
                    // View count node
                    const viewCountNode = span(viewCount)
                    // Client count node
                    const clientCountNode = span(clientCount)
                    // Reaction count node
                    const reactionCountNode = span(reactionCount)

                    // View count container node
                    const viewCountContainerNode = div({ className:  'count view' }, viewCountNode)
                    // Client count container node
                    const clientCountContainerNode = div({ className:  'count client' }, clientCountNode)
                    // Reaction count container node
                    const reactionCountContainerNode = div({ className: 'count reaction' }, reactionCountNode)
                    
                    // Info node
                    const infoNode = div(viewCountContainerNode, clientCountContainerNode, reactionCountContainerNode)
                    
                    // Container node
                    const containerNode = div({
                        onclick: () => {
                            history.pushState(null, undefined, BASE + '/canvas/' + canvasObject.canvasId)
                        }
                    }, canvasNode, infoNode)
                    
                    // Main node
                    append(this.canvasNode, [ containerNode ])
                    
                    // Canvas model
                    const canvasModel = new CanvasModel(canvasNode, canvasId, timestamps, counts, coordinates, reactions, clients, lines, circles, squares)
                    canvasModel.draw()
                    
                    // Update models
                    this.canvasModels.push(canvasModel)

                    // Update nodes
                    this.viewCountNodes[canvasId] = viewCountNode
                    this.clientCountNodes[canvasId] = clientCountNode
                    this.reactionCountNodes[canvasId] = reactionCountNode
                }
                // Count
                this.updateCanvasCount(Math.max(this.canvasCount, this.canvasModels.length))
            }
        }
        this.request.open('GET', BASE + '/api/v1/canvas/')
        this.request.send()
    }

    hide() {
        super.hide()
        // Request
        if (this.request) {
            this.request.abort()
            this.request = null
        }
        // Clear main
        clear(this.canvasNode)
        // Reset models
        this.canvasModels = []
        // Reset nodes
        this.clientCountNodes = {}
        this.reactionCountNodes = {}
        // Update
        this.updateCanvasCount(this.canvasCount)
    }
}