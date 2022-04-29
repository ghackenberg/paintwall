// CLASSES

class BrowseScreen extends BaseScreen {
    constructor() {
        super('browse')
        // States
        this.canvasModels = []
        // Count
        this.countNode = document.createElement('span')
        this.countNode.textContent = '0'
        // Button
        this.buttonNode = document.createElement('button')
        this.buttonNode.textContent = 'New canvas'
        this.buttonNode.onclick = function() {
            location.hash = 'paint/' + Math.random().toString(16).substring(2)
        }
        // Main
        this.headerNode.appendChild(this.countNode)
        this.headerNode.appendChild(this.buttonNode)
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
    }
    connect() {
        // Self
        const self = this
        // Socket
        this.socket = new WebSocket(makeSocketURL('/api/v1/client/'))
        this.socket.onmessage = function(event) {
            // Parse
            const message = JSON.parse(event.data)
            // Switch
            switch (message.type) {
                case 'count': {
                    const count = message.data
                    self.countNode.textContent = count + ' users online'
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
                    const infoNode = document.createElement('div')
                    infoNode.textContent = live + ' users live'
                    // Container node
                    const containerNode = document.createElement('div')
                    containerNode.appendChild(canvasNode)
                    containerNode.appendChild(infoNode)
                    containerNode.addEventListener('click', (event) => {
                        location.hash = 'paint/' + canvasObject.canvasId
                    })
                    // Main node
                    self.mainNode.appendChild(containerNode)
                    // Canvas model
                    const canvasModel = new CanvasModel(canvasNode, canvasId, clients, lines)
                    canvasModel.draw()
                    // Update state
                    self.canvasModels.push(canvasModel)
                }
            }
        }
        this.request.open('GET', '/api/v1/canvas/')
        this.request.send()
    }
}