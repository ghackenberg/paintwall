// CLASSES

class BrowseScreen extends BaseScreen {
    constructor() {
        super('browse')
        // States
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
                    const live = Object.entries(clients).length
                    // Canvas node
                    const canvasNode = document.createElement('canvas')
                    // Info node
                    const infoNode = document.createElement('div')
                    infoNode.textContent = live + ' live'
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
    hide() {
        super.hide()
        // Clear main
        while (this.mainNode.firstChild) {
            this.mainNode.removeChild(this.mainNode.firstChild)
        }
        // Reset state
        this.canvasModels = []
    }
}