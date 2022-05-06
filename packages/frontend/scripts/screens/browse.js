// CLASSES

class BrowseScreen extends BaseScreen {
    // Models

    canvasModels = []

    // Nodes

    clientCountNodes = {}
    reactionCountNodes = {}

    // Constructor

    constructor() {
        super('browse')

        // Logo
        this.logoNode = span({ id: 'logo' }, [ 'PaintWall' ])

        // Count
        this.countNode = span({ id: 'count', className: 'button' }, [ '0 online' ])

        // Button
        this.createNode = button({ id: 'create', className: 'button',
            onclick: () => {
                history.pushState(null, undefined, base + '/canvas/' + Math.random().toString(16).substring(2))
            }
        }, [ 'New canvas' ])

        // Login
        this.loginNode = button({ id: 'login', className: 'button',
            onclick: async () => {
                await auth0.loginWithRedirect({
                    redirect_uri: location.href
                })
            }
        }, [ 'Login' ])

        // Logout
        this.logoutNode = button({ id: 'logout', className: 'button',
            onclick: async () => {
                await auth0.logout({
                    returnTo: location.href
                })
            }
        }, [ 'Logout' ])

        // Header
        this.headerNode.appendChild(this.logoNode)
        this.headerNode.appendChild(this.countNode)
        this.headerNode.appendChild(this.createNode)

        // Imprint
        this.imprintNode = a({ id: 'imprint',
            onclick: () => {
                history.pushState(null, undefined, base + '/imprint')
            }
        }, [ 'Imprint' ])

        // Data
        this.dataNode = a({ id: 'data',
            onclick: () => {
                history.pushState(null, undefined, base + '/data-protection')
            }
        }, [ 'Data protection' ])

        // Terms
        this.termsNode = a({ id: 'terms',
            onclick: () => {
                history.pushState(null, undefined, base + '/terms-of-use')
            }
        }, [ 'Terms of use' ])

        // Footer
        this.footerNode.appendChild(this.imprintNode)
        this.footerNode.appendChild(this.dataNode)
        this.footerNode.appendChild(this.termsNode)

        // Connect
        this.connect()
    }

    show() {
        super.show()
        // Append
        if (user) {
            this.headerNode.appendChild(this.logoutNode)
        } else {
            this.headerNode.appendChild(this.loginNode)
        }
        // Load
        this.load()
    }

    hide() {
        super.hide()
        // Remove header
        if (user) {
            this.headerNode.removeChild(this.logoutNode)
        } else {
            this.headerNode.removeChild(this.loginNode)
        }
        // Clear main
        while (this.mainNode.firstChild) {
            this.mainNode.removeChild(this.mainNode.firstChild)
        }
        // Reset models
        this.canvasModels = []
        // Reset nodes
        this.clientCountNodes = {}
        this.reactionCountNodes = {}
    }

    connect() {
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
                    self.countNode.textContent = count + ' online'
                    break
                }
                case 'canvas-client-count': {
                    const canvasId = message.data.canvasId
                    const count = message.data.count
                    if (canvasId in self.clientCountNodes) {
                        self.clientCountNodes[canvasId].textContent = '' + count
                    }
                    break
                }
                case 'canvas-reaction-count': {
                    const canvasId = message.data.canvasId
                    const count = message.data.count

                    if (canvasId in self.reactionCountNodes) {
                        self.reactionCountNodes[canvasId].textContent = '' + count
                    }

                    break
                }
                case 'canvas-create': {
                    const canvasId = message.data.canvasId
                    // TODO Show new canvas?
                    break
                }
            }
        }
        this.socket.onerror = function(event) {
            // Close
            self.socket.close()
        }
        this.socket.onclose = function(event) {
            // Connect
            self.connect()
        }
    }

    load() {
        // Self
        const self = this
        // Request
        this.request = new XMLHttpRequest()
        this.request.onreadystatechange = function() {
            // Check
            if (this.readyState == XMLHttpRequest.DONE) {
                // Parse
                const canvasObjects = JSON.parse(this.responseText)
                // Loop
                for (const canvasObject of canvasObjects.reverse()) {
                    // Extract information
                    const canvasId = canvasObject.canvasId
                    const timestamps = canvasObject.timestamps
                    const coordinates = canvasObject.coordinates
                    const reactions = canvasObject.reactions
                    const clients = canvasObject.clients
                    const lines = canvasObject.lines

                    // Calculate informaton
                    const clientCount = Object.entries(clients).length
                    const reactionCount = Object.values(reactions).reduce((a, b) => a + b, 0)

                    // Canvas node
                    const canvasNode = canvas()
                    
                    // Client count node
                    const clientCountNode = span([ '' + clientCount ])
                    
                    // Reaction count node
                    const reactionCountNode = span([ '' + reactionCount ])

                    // Client count container node
                    const clientCountContainerNode = div({ className:  'count client' }, [ clientCountNode ])

                    // Reaction count container node
                    const reactionCountContainerNode = div({ className: 'count reaction' }, [ reactionCountNode ])
                    
                    // Info node
                    const infoNode = div([ clientCountContainerNode, reactionCountContainerNode ])
                    
                    // Container node
                    const containerNode = div({
                        onclick: () => {
                            history.pushState(null, undefined, base + '/canvas/' + canvasObject.canvasId)
                        }
                    }, [ canvasNode, infoNode ])
                    
                    // Main node
                    self.mainNode.appendChild(containerNode)
                    
                    // Canvas model
                    const canvasModel = new CanvasModel(canvasNode, canvasId, timestamps, coordinates, reactions, clients, lines)
                    canvasModel.draw()
                    
                    // Update models
                    self.canvasModels.push(canvasModel)

                    // Update nodes
                    self.clientCountNodes[canvasId] = clientCountNode
                    self.reactionCountNodes[canvasId] = reactionCountNode
                }
            }
        }
        this.request.open('GET', base + '/api/v1/canvas/')
        this.request.send()
    }
}