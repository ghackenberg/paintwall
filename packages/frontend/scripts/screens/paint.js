// CLASSES

class PaintScreen extends BaseScreen {
    // Static

    static COLORS = ['mediumseagreen', 'yellowgreen', 'gold', 'orange', 'tomato', 'hotpink', 'mediumorchid', 'dodgerblue', 'gray', 'black']
    static WIDTHS = [5.0]
    static ALPHAS = [0.5]

    // Non-static

    constructor() {
        super('paint')
        // Constants
        const name = undefined
        const color = localStorage.getItem('color') || PaintScreen.COLORS[0]
        const width = parseFloat(localStorage.getItem('width') || ('' + PaintScreen.WIDTHS[0]))
        const alpha = parseFloat(localStorage.getItem('alpha') || ('' + PaintScreen.ALPHAS[0]))
        const position = undefined
        // States
        this.clientModel = new ClientModel(clientId, name, color, width, alpha, position)
        this.canvasModel = undefined
        this.lineModel = undefined
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
        // Nodes (back)
        this.backNode = document.createElement('img')
        this.backNode.id = 'back'
        this.backNode.className = 'back'
        this.backNode.src = base + '/images/back.png'
        this.backNode.onclick = function() {
            history.back()
        }
        // Nodes (color)
        this.colorNode = document.createElement('div')
        this.colorNode.id = 'color'
        // Nodes (colors)
        this.colorNodes = {}
        for (const otherColor of PaintScreen.COLORS) {
            // Create
            const colorNode = document.createElement('span')
            // Update
            colorNode.id = otherColor
            colorNode.classList.add('color')
            if (otherColor == color) {
                colorNode.classList.add('active')
            }
            colorNode.style.backgroundColor = otherColor
            colorNode.value = otherColor
            colorNode.onclick = this.handleChange
            // Remember
            this.colorNodes[otherColor] = colorNode
            // Append
            this.colorNode.appendChild(colorNode)
        }
        // Nodes (code)
        this.qrcodeNode = document.createElement('div')
        this.qrcodeNode.id = 'qrcode'
        // Nodes (main)
        this.mainNode.appendChild(this.qrcodeNode)
        this.mainNode.appendChild(this.canvasNode)
        this.mainNode.appendChild(this.backNode)
        this.mainNode.appendChild(this.colorNode)
        // Models
        this.qrcodeModel = new QRCode(this.qrcodeNode, { text: location.href, width: 128, height: 128 })
    }
    show() {
        // Node
        super.show()
        // Canvas id
        const canvasId = location.pathname.substring(location.pathname.lastIndexOf('/') + 1)
        // QR-Code model
        this.qrcodeModel.clear()
        this.qrcodeModel.makeCode(location.href)
        // Client name
        if (user) {
            this.clientModel.name = user.nickname
        } else {
            this.clientModel.name = localStorage.getItem('name') || 'Anonymous'
            this.clientModel.name = prompt("How do you want to be called?", this.clientModel.name) || 'Anonymous'
            localStorage.setItem('name', this.clientModel.name)
        }
        // Canvas model
        this.canvasModel = new CanvasModel(this.canvasNode, canvasId)
        this.canvasModel.connect(this.clientModel)
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
        this.canvasModel = undefined
        this.lineModel = undefined
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
        // Deactivate
        this.colorNodes[this.clientModel.color].classList.remove('active')
        // Update
        this.clientModel.color = event.target.value
        // Activate
        this.colorNodes[this.clientModel.color].classList.add('active')
        // Remember
        localStorage.setItem('color', this.clientModel.color)
        // Broadcast
        this.canvasModel.broadcast('color', this.clientModel.color)
    }
    startLine(x, y) {
        // Define
        const lineId = '' + Math.random().toString(16).substring(2)
        const color = this.clientModel.color
        const width = this.clientModel.width
        const alpha = this.clientModel.alpha
        const point = { x, y }
        // Create
        this.lineModel = new LineModel(lineId, clientId, color, width, alpha, [point])
        // Update
        this.canvasModel.lines[lineId] = this.lineModel
        this.canvasModel.draw()
        // Broadcast
        this.canvasModel.broadcast('start', { lineId: this.lineModel.lineId, point })
    }
    continueLine(x, y) {
        if (this.lineModel) {
            // Define
            const point = { x, y }
            // Update
            this.lineModel.points.push(point)
            // Draw
            this.canvasModel.draw()
            // Broadcast
            this.canvasModel.broadcast('continue', { lineId: this.lineModel.lineId, point })    
        }
    }
}