// CLASSES

class BrowseScreen extends BaseScreen {
    constructor() {
        super('browse')
        // States
        this.canvasNodes = []
        this.canvasModels = []
        // Button
        this.buttonNode = document.createElement('button')
        this.buttonNode.textContent = 'New'
        this.buttonNode.onclick = function() {
            location.hash = 'paint/' + Math.random().toString(16).substring(2)
        }
        // Main
        this.headerNode.appendChild(this.buttonNode)
    }
    show() {
        super.show()
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
                    // Canvas node
                    const canvasNode = document.createElement('canvas')
                    canvasNode.addEventListener('click', (event) => {
                        location.hash = 'paint/' + canvasObject.canvasId
                    })
                    // Canvas model
                    const canvasModel = new CanvasModel(canvasNode, canvasId, clients, lines)
                    canvasModel.draw()
                    // Main node
                    self.mainNode.appendChild(canvasNode)
                    // Update state
                    self.canvasNodes.push(canvasNode)
                    self.canvasModels.push(canvasModel)
                }
            }
        }
        this.request.open('GET', '/api/v1/canvas/')
        this.request.send()
    }
    hide() {
        super.hide()
        // Remove childs
        while (this.canvasNodes.length > 0) {
            this.mainNode.removeChild(this.canvasNodes.pop())
        }
        // Update state
        this.canvasNodes = []
        this.canvasModels = []
    }
}