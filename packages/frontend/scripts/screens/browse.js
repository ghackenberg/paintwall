// CLASSES

class BrowseScreen extends BaseScreen {
    // Counts

    canvasCount = 0

    // Models

    canvasModels = []

    // Nodes

    viewCountNodes = {}
    clientCountNodes = {}
    reactionCountNodes = {}

    // Connection

    socket = null
    request = null

    // Constructor

    constructor() {
        super('browse')

        // Logo
        this.logoNode = span({ id: 'logo' }, 'PaintWall')

        // Client count
        this.clientCountNode = span({ id: 'client-count', className: 'button' }, img({ className: 'load', src: base + '/images/load.png' }))

        // Button
        this.createNode = button({ id: 'canvas-create', className: 'button',
            onclick: () => {
                history.pushState(null, undefined, base + '/canvas/' + Math.random().toString(16).substring(2))
            }
        }, 'New canvas')

        // Login
        this.loginNode = button({ id: 'user-login', className: 'button',
            onclick: async () => {
                await auth0.loginWithRedirect({
                    redirect_uri: location.href
                })
            }
        }, 'Login')

        // Logout
        this.logoutNode = button({ id: 'user-logout', className: 'button',
            onclick: async () => {
                await auth0.logout({
                    returnTo: location.href
                })
            }
        }, 'Logout')

        // Wait
        this.waitNode = button({ id: 'user-wait', className: 'button' }, img({ className: 'load', src: base + '/images/load.png' }))

        // Header
        append(this.headerNode, [ this.logoNode, this.clientCountNode, this.createNode, this.waitNode ])

        // Load
        this.loadNode = img({ className: 'load', src: base + '/images/load.png' })

        // Canvas count
        this.canvasCountNode = span({ id: 'canvas-count' })

        // Canvas
        this.canvasNode = div()

        // Main
        append(this.mainNode, [ this.canvasNode ])

        // Imprint
        this.imprintNode = a({ id: 'imprint',
            onclick: () => {
                history.pushState(null, undefined, base + '/imprint')
            }
        }, 'Imprint')

        // Data
        this.dataNode = a({ id: 'data',
            onclick: () => {
                history.pushState(null, undefined, base + '/data-protection')
            }
        }, 'Data protection')

        // Terms
        this.termsNode = a({ id: 'terms',
            onclick: () => {
                history.pushState(null, undefined, base + '/terms-of-use')
            }
        }, 'Terms of use')

        // Footer
        append(this.footerNode, [ this.imprintNode, this.dataNode, this.termsNode ])

        // Handle
        this.handleAuthorize()

        // Connect
        this.connect()

        // Listen
        window.addEventListener('authorize', this.handleAuthorize.bind(this))
    }

    handleAuthorize() {
        // Remove
        this.headerNode.removeChild(this.headerNode.lastChild)
        // Append
        if (user) {
            this.headerNode.appendChild(this.logoutNode)
        } else if (user === undefined) {
            this.headerNode.appendChild(this.loginNode)
        } else if (user === null) {
            this.headerNode.appendChild(this.waitNode)
        }
    }

    updateCanvasCount(total) {
        const loaded = this.canvasModels.length
        const difference = total - loaded

        this.canvasCount = total
        this.canvasCountNode.textContent = difference

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
        // Self
        const self = this
        // Socket
        this.socket = new WebSocket(makeSocketURL(base + '/api/v1/client/'))
        this.socket.onmessage = function(event) {
            // Parse
            const message = JSON.parse(event.data)
            // Switch
            switch (message.type) {
                case 'client-count': {
                    const count = message.data
                    self.clientCountNode.textContent = count
                    break
                }
                case 'canvas-count': {
                    const count = message.data
                    self.updateCanvasCount(count)
                    break
                }
                case 'canvas-view-count': {
                    const canvasId = message.data.canvasId
                    const count = message.data.count
                    if (canvasId in self.viewCountNodes) {
                        self.viewCountNodes[canvasId].textContent = count
                    }
                    break
                }
                case 'canvas-client-count': {
                    const canvasId = message.data.canvasId
                    const count = message.data.count
                    if (canvasId in self.clientCountNodes) {
                        self.clientCountNodes[canvasId].textContent = count
                    }
                    break
                }
                case 'canvas-reaction-count': {
                    const canvasId = message.data.canvasId
                    const count = message.data.count
                    if (canvasId in self.reactionCountNodes) {
                        self.reactionCountNodes[canvasId].textContent = count
                    }
                    break
                }
            }
        }
        this.socket.onerror = function(event) {
            // Close
            self.socket.close()
        }
        this.socket.onclose = function(event) {
            // Reset
            self.socket = null
            // Connect
            self.connect()
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
        // Self
        const self = this
        // Request
        this.request = new XMLHttpRequest()
        this.request.onreadystatechange = function() {
            // Check
            if (this.readyState == XMLHttpRequest.DONE) {
                // Reset
                self.request = null
                // Remove
                self.mainNode.removeChild(self.loadNode)
                // Parse
                const canvasObjects = JSON.parse(this.responseText)
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
                            history.pushState(null, undefined, base + '/canvas/' + canvasObject.canvasId)
                        }
                    }, canvasNode, infoNode)
                    
                    // Main node
                    append(self.canvasNode, [ containerNode ])
                    
                    // Canvas model
                    const canvasModel = new CanvasModel(canvasNode, canvasId, timestamps, counts, coordinates, reactions, clients, lines)
                    canvasModel.draw()
                    
                    // Update models
                    self.canvasModels.push(canvasModel)

                    // Update nodes
                    self.viewCountNodes[canvasId] = viewCountNode
                    self.clientCountNodes[canvasId] = clientCountNode
                    self.reactionCountNodes[canvasId] = reactionCountNode
                }
                // Count
                self.updateCanvasCount(Math.max(self.canvasCount, self.canvasModels.length))
            }
        }
        this.request.open('GET', base + '/api/v1/canvas/')
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