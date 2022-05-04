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
        this.countNode.textContent = '1 online'
        // Button
        this.createNode = document.createElement('button')
        this.createNode.id = 'create'
        this.createNode.textContent = 'New canvas'
        this.createNode.onclick = function() {
            history.pushState(null, undefined, base + '/canvas/' + Math.random().toString(16).substring(2))
        }
        // Main
        this.headerNode.appendChild(this.countNode)
        this.headerNode.appendChild(this.createNode)
        // Connect
        this.connect()
    }
    show() {
        super.show()
        // Load
        this.load()
    }
    hide() {
        super.hide()
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
                    const canvasModel = new CanvasModel(canvasNode, canvasId, clients, lines)
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