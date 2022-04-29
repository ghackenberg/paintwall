// CLASSES

class PaintScreen extends BaseScreen {
    constructor() {
        super('paint')
        // States
        this.canvasId = undefined
        this.clientName = undefined
        this.canvasModel = undefined
        this.lineId = undefined
        this.color = localStorage.getItem('color') || 'black'
        this.width = parseFloat(localStorage.getItem('width') || '5.0')
        this.alpha = parseFloat(localStorage.getItem('alpha') || '0.5')
        // Handlers (resize)
        this.handleResize = this.handleResize.bind(this)
        // Handlers (mouse)
        this.handleMouseDown = this.handleMouseDown.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)
        this.handleMouseOver = this.handleMouseOver.bind(this)
        this.handleMouseOut = this.handleMouseOut.bind(this)
        // Handers (touch)
        this.handleTouchStart = this.handleTouchStart.bind(this)
        this.handleTouchMove = this.handleTouchMove.bind(this)
        this.handleTouchEnd = this.handleTouchEnd.bind(this)
        // Handlers (change)
        this.handleChange = this.handleChange.bind(this)
        // Nodes (canvas)
        this.canvasNode = document.createElement('canvas')
        this.canvasNode.id = 'canvas'
        this.canvasNode.addEventListener('mousedown', this.handleMouseDown)
        this.canvasNode.addEventListener('mousemove', this.handleMouseMove)
        this.canvasNode.addEventListener('mouseover', this.handleMouseOver)
        this.canvasNode.addEventListener('mouseout', this.handleMouseOut)
        this.canvasNode.addEventListener('touchstart', this.handleTouchStart)
        this.canvasNode.addEventListener('touchmove', this.handleTouchMove)
        this.canvasNode.addEventListener('touchend', this.handleTouchEnd)
        // Nodes (color)
        this.colorNode = document.createElement('input')
        this.colorNode.id = 'color'
        this.colorNode.type = 'color'
        this.colorNode.value = this.color
        this.colorNode.addEventListener('change', this.handleChange)
        // Nodes (code)
        this.qrcodeNode = document.createElement('div')
        this.qrcodeNode.id = 'qrcode'
        // Nodes (main)
        this.mainNode.appendChild(this.qrcodeNode)
        this.mainNode.appendChild(this.canvasNode)
        this.mainNode.appendChild(this.colorNode)
        // Models
        this.qrcodeModel = new QRCode(this.qrcodeNode, { text: location.href, width: 128, height: 128 })
    }
    show() {
        // Node
        super.show()
        // Canvas id
        this.canvasId = location.hash.substring(location.hash.indexOf('/') + 1)
        // Client name
        this.clientName = localStorage.getItem('name') || 'Anonymous'
        this.clientName = prompt("How do you want to be called?", this.clientName) || 'Anonymous'
        localStorage.setItem('name', this.clientName)
        // QR-Code model
        this.qrcodeModel.clear()
        this.qrcodeModel.makeCode(location.href)
        // Canvas model
        this.canvasModel = new CanvasModel(this.canvasNode, this.canvasId)
        this.canvasModel.connect(this.clientName, this.color, this.width, this.alpha, undefined)
        // Resize
        this.handleResize()
        // Window
        window.addEventListener('resize', this.handleResize)
    }
    hide() {
        // Node
        super.hide()
        // Canvas
        this.canvasModel.disconnect()
        // Window
        window.removeEventListener('resize', this.handleResize)
    }
    handleResize() {
        // Resize
        this.canvasNode.width = window.innerWidth
        this.canvasNode.height = window.innerHeight
        // Draw
        this.canvasModel.draw()
    }
    handleMouseDown(event) {
        event.preventDefault()
        // Call
        this.startLine(event.clientX, event.clientY)
    }
    handleMouseMove(event) {
        event.preventDefault()
        // Check
        if (event.buttons > 0) {
            this.continueLine(event.clientX, event.clientY)
        }
        // Broadcast
        this.canvasModel.broadcast('move', { x: event.clientX, y: event.clientY })
    }
    handleMouseOver(event) {
        event.preventDefault()
        // Check
        if (event.buttons > 0) {
            this.startLine(event.clientX, event.clientY)
        }
        // Broadcast
        this.canvasModel.broadcast('over', { x: event.clientX, y: event.clientY })
    }
    handleMouseOut(event) {
        event.preventDefault()
        // Check
        if (event.buttons > 0) {
            this.continueLine(event.clientX, event.clientY)
        }
        // Broadcast
        this.canvasModel.broadcast('out')
    }
    handleTouchStart(event) {
        event.preventDefault()
        // Check
        if (event.touches.length == 1) {
            this.startLine(event.touches[0].clientX, event.touches[0].clientY)
        }
        // Broadcast
        this.canvasModel.broadcast('over', { x: event.touches[0].clientX, y: event.touches[0].clientY })
    }
    handleTouchMove(event) {
        event.preventDefault()
        // Check
        if (event.touches.length == 1) {
            this.continueLine(event.touches[0].clientX, event.touches[0].clientY)
        }
        // Broadcast
        this.canvasModel.broadcast('move', { x: event.touches[0].clientX, y: event.touches[0].clientY })
    }
    handleTouchEnd(event) {
        event.preventDefault()
        // Check
        if (event.touches.length == 1) {
            this.continueLine(event.touches[0].clientX, event.touches[0].clientY)
        }
        // Broadcast
        this.canvasModel.broadcast('out')
    }
    handleChange(event) {
        // Update
        this.color = event.target.value
        // Remember
        localStorage.setItem('color', color)
        // Broadcast
        this.canvasModel.broadcast('color', this.color)
    }
    startLine(x, y) {
        // Create
        this.lineId = '' + Math.random().toString(16).substring(2)
        const point = { x, y }
        // Update
        this.canvasModel.lines[this.lineId] = new Line(this.lineId, clientId, this.color, this.width, this.alpha, [point])
        this.canvasModel.draw()
        // Broadcast
        this.canvasModel.broadcast('start', { lineId: this.lineId, point })
    }
    continueLine(x, y) {
        // Update
        if (this.lineId in this.canvasModel.lines) {
            // Create
            const point = { x, y }
            this.canvasModel.lines[this.lineId].points.push(point)
            this.canvasModel.draw()
            // Broadcast
            this.canvasModel.broadcast('continue', { lineId: this.lineId, point })    
        }
    }
}