// CLASSES

class BrowseScreen extends BaseScreen {
    constructor() {
        super('browse')

        // States
        this.canvasModels = []
        this.liveNodes = {}

        // Count
        this.countNode = document.createElement('span')
        this.countNode.id = 'count'
        this.countNode.className = 'button'
        this.countNode.textContent = '0 online'

        // Button
        this.createNode = document.createElement('button')
        this.createNode.id = 'create'
        this.createNode.className = 'button'
        this.createNode.textContent = 'New canvas'
        this.createNode.onclick = function() {
            history.pushState(null, undefined, base + '/canvas/' + Math.random().toString(16).substring(2))
        }

        // Login
        this.loginNode = document.createElement('button')
        this.loginNode.id = 'login'
        this.loginNode.className = 'button'
        this.loginNode.textContent = 'Login'
        this.loginNode.onclick = async function() {
            await auth0.loginWithRedirect({
                redirect_uri: location.href
            })
        }

        // Logout
        this.logoutNode = document.createElement('button')
        this.logoutNode.id = 'logout'
        this.logoutNode.className = 'button'
        this.logoutNode.textContent = 'Logout'
        this.logoutNode.onclick = async function() {
            await auth0.logout({
                returnTo: location.href
            })
        }

        // Main
        this.headerNode.appendChild(this.countNode)
        this.headerNode.appendChild(this.createNode)

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
        // Reset state
        this.canvasModels = []
        this.liveNodes = {}
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
                case 'online': {
                    const count = message.data
                    self.countNode.textContent = count + ' online'
                    break
                }
                case 'live': {
                    const canvasId = message.data.canvasId
                    const count = message.data.count
                    if (canvasId in self.liveNodes) {
                        self.liveNodes[canvasId].textContent = count + ' live'
                    }
                    break
                }
                case 'canvas': {
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
                    const clients = canvasObject.clients
                    const lines = canvasObject.lines
                    const live = Object.entries(clients).length
                    // Canvas node
                    const canvasNode = document.createElement('canvas')
                    // Info node
                    const liveNode = document.createElement('div')
                    liveNode.textContent = live + ' live'
                    // Container node
                    const containerNode = document.createElement('div')
                    containerNode.appendChild(canvasNode)
                    containerNode.appendChild(liveNode)
                    containerNode.addEventListener('click', (event) => {
                        history.pushState(null, undefined, base + '/canvas/' + canvasObject.canvasId)
                    })
                    // Main node
                    self.mainNode.appendChild(containerNode)
                    // Canvas model
                    const canvasModel = new CanvasModel(canvasNode, canvasId, timestamps, coordinates, clients, lines)
                    canvasModel.draw()
                    // Update state
                    self.canvasModels.push(canvasModel)
                    self.liveNodes[canvasId] = liveNode
                }
            }
        }
        this.request.open('GET', base + '/api/v1/canvas/')
        this.request.send()
    }
}