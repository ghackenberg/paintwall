// CLASSES

class PaintScreen extends BaseScreen {
    // Static

    static COLORS = ['dodgerblue', 'mediumseagreen', 'yellowgreen', 'gold', 'orange', 'tomato', 'hotpink', 'mediumorchid', 'gray', 'black']
    static WIDTHS = [5.0]
    static ALPHAS = [0.5]

    // Non-static

    // Models
    
    clientModel = undefined
    canvasModel = undefined
    lineModel = undefined

    // Nodes

    colorNodes = {}

    // Coordinates

    previousTouches = []
    previousTouchCenter = undefined
    previousTouchLength = undefined

    // Constructor

    constructor() {
        super('paint')
        
        // Constants
        const name = undefined
        const color = PaintScreen.COLORS.includes(localStorage.getItem('color')) ? localStorage.getItem('color') : PaintScreen.COLORS[0]
        const width = PaintScreen.WIDTHS.includes(parseFloat(localStorage.getItem('width'))) ? parseFloat(localStorage.getItem('width')) : PaintScreen.WIDTHS[0]
        const alpha = PaintScreen.ALPHAS.includes(parseFloat(localStorage.getItem('alpha'))) ? parseFloat(localStorage.getItem('alpha')) : PaintScreen.ALPHAS[0]
        const position = undefined

        // States
        this.clientModel = new ClientModel(clientId, name, color, width, alpha, position)

        // Handlers (resize)
        this.handleResize = this.handleResize.bind(this)
        // Handlers (wheel)
        this.handleWheel = this.handleWheel.bind(this)
        // Handlers (mouse)
        this.handleMouseDown = this.handleMouseDown.bind(this)
        this.handleMouseUp = this.handleMouseUp.bind(this)
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
        // Context menu
        this.canvasNode.addEventListener('contextmenu', event => event.preventDefault())
        // Wheel
        this.canvasNode.addEventListener('wheel', this.handleWheel)
        // Mouse
        this.canvasNode.addEventListener('mousedown', this.handleMouseDown)
        this.canvasNode.addEventListener('mouseup', this.handleMouseUp)
        this.canvasNode.addEventListener('mousemove', this.handleMouseMove)
        this.canvasNode.addEventListener('mouseover', this.handleMouseOver)
        this.canvasNode.addEventListener('mouseout', this.handleMouseOut)
        // Touch
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

    // Screen

    show() {
        // Node
        super.show()
        // Canvas id
        const canvasId = location.pathname.substring(location.pathname.lastIndexOf('/') + 1)
        // QR-Code model
        this.qrcodeModel.clear()
        this.qrcodeModel.makeCode(location.href)
        // Client name
        this.clientModel.name = user ? user.nickname : 'Anonymous'
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

    // Handlers (resize)

    handleResize() {
        // Resize
        this.canvasNode.width = window.innerWidth
        this.canvasNode.height = window.innerHeight
        // Draw
        this.canvasModel.draw()
    }

    // Handlers (wheel)

    handleWheel(event) {
        // Check
        if (this.canvasModel && this.canvasModel.center && this.canvasModel.zoom) {
            // Mouse
            const mx = event.clientX
            const my = event.clientY
            // Center
            const cx = this.canvasNode.width / 2
            const cy = this.canvasNode.height / 2
            // Zoom
            const oldZoom = this.canvasModel.zoom
            const newZoom = oldZoom * (1 - event.deltaY / 500)
            // Old
            const ox = (mx - cx) / oldZoom
            const oy = (my - cy) / oldZoom
            // New
            const nx = (mx - cx) / newZoom
            const ny = (my - cy) / newZoom
            // Delta
            const dx = nx - ox
            const dy = ny - oy
            // Canvas model
            this.canvasModel.center.x -= dx
            this.canvasModel.center.y -= dy
            this.canvasModel.zoom = newZoom
            this.canvasModel.draw()
        }
    }

    // Handlers (mouse)

    handleMouseDown(event) {
        event.preventDefault()
        // Check
        if (this.canvasModel && this.canvasModel.center && this.canvasModel.zoom) {
            // Unproject
            const x = unprojectX(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.clientX)
            const y = unprojectY(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.clientY)
            // Define
            const point = { x, y }
            // Check
            if (event.buttons == 1) {
                this.startLine(point)
            }
            // Broadcast
            this.canvasModel.broadcast('move', point)
        }
    }

    handleMouseUp(event) {
        event.preventDefault()
        // Check
        if (this.canvasModel && this.canvasModel.center && this.canvasModel.zoom) {
            // Unproject
            const x = unprojectX(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.clientX)
            const y = unprojectY(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.clientY)
            // Define
            const point = { x, y }
            // Check
            if (event.buttons == 1) {
                this.startLine(point)
            }
            // Broadcast
            this.canvasModel.broadcast('move', point)
        }
    }

    handleMouseMove(event) {
        event.preventDefault()
        // Check
        if (this.canvasModel && this.canvasModel.center && this.canvasModel.zoom) {
            // Unproject
            const x = unprojectX(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.clientX)
            const y = unprojectY(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.clientY)
            // Define
            const point = { x, y }
            // Check
            if (event.buttons == 1) {
                this.continueLine(point)
            }
            // Broadcast
            this.canvasModel.broadcast('move', point)
        }
    }

    handleMouseOver(event) {
        event.preventDefault()
        // Check
        if (this.canvasModel && this.canvasModel.center && this.canvasModel.zoom) {
            // Unproject
            const x = unprojectX(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.clientX)
            const y = unprojectY(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.clientY)
            // Define
            const point = { x, y }
            // Check
            if (event.buttons == 1) {
                this.startLine(point)
            }
            // Broadcast
            this.canvasModel.broadcast('over', point)
        }
    }

    handleMouseOut(event) {
        event.preventDefault()
        // Check
        if (this.canvasModel && this.canvasModel.center && this.canvasModel.zoom) {
            // Unproject
            const x = unprojectX(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.clientX)
            const y = unprojectY(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.clientY)
            // Define
            const point = { x, y }
            // Check
            if (event.buttons == 1) {
                this.continueLine(point)
            }
            // Broadcast
            this.canvasModel.broadcast('out')
        }
    }

    // Handler (touch)

    handleTouchStart(event) {
        event.preventDefault()
        // Check
        if (this.canvasModel && this.canvasModel.center && this.canvasModel.zoom) {
            // Check
            if (event.touches.length == 1 && !event.ctrlKey) {
                // Unproject
                const x = unprojectX(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.touches[0].clientX)
                const y = unprojectY(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.touches[0].clientY)
                // Define
                const point = { x, y }
                // Start
                this.previousTouches = [point]
                // Broadcast
                this.canvasModel.broadcast('over', point)
            } else {
                if (this.lineModel) {
                    // Reset
                    this.lineModel = undefined
                    // Broadcast
                    this.canvasModel.broadcast('out')
                }
                if (event.touches.length == 2 || (event.ctrlKey && event.touches.length == 1)) {
                    // Prepare
                    const x0 = event.touches[0].clientX
                    const y0 = event.touches[0].clientY
                    const x1 = event.touches.length == 2 ? event.touches[1].clientX : 0
                    const y1 = event.touches.length == 2 ? event.touches[1].clientY : 0
                    const dx = x1 - x0
                    const dy = y1 - y0
                    // Remember
                    this.previousTouchCenter = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 }
                    this.previousTouchLength = Math.sqrt(dx * dx + dy * dy)
                }
            }
        }
    }

    handleTouchMove(event) {
        event.preventDefault()
        // Check
        if (this.canvasModel && this.canvasModel.center && this.canvasModel.zoom) {
            // Check
            if (event.touches.length == 1 && !event.ctrlKey) {
                // Unproject
                const x = unprojectX(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.touches[0].clientX)
                const y = unprojectY(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, event.touches[0].clientY)
                // Define
                const point = { x, y }
                // Continue
                if (this.previousTouches.length > 0) {
                    this.previousTouches.push(point)
                    if (this.previousTouches.length > 10) {
                        this.startLine(this.previousTouches.shift())
                        while (this.previousTouches.length > 0) {
                            this.continueLine(this.previousTouches.shift())
                        }
                    }
                } else {
                    this.continueLine(point)
                }
                // Broadcast
                this.canvasModel.broadcast('move', point)
            } else if (event.touches.length == 2 || (event.ctrlKey && event.touches.length == 1)) {
                // Prepare
                const x0 = event.touches[0].clientX
                const y0 = event.touches[0].clientY
                const x1 = event.touches.length == 2 ? event.touches[1].clientX : 0
                const y1 = event.touches.length == 2 ? event.touches[1].clientY : 0
                const dx = x1 - x0
                const dy = y1 - y0
                // Define
                const currentTouchCenter = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 }
                const currentTouchLength = Math.sqrt(dx * dx + dy * dy)
                // Update
                this.canvasModel.zoom *= currentTouchLength / this.previousTouchLength
                this.canvasModel.center.x -= (currentTouchCenter.x - this.previousTouchCenter.x) / this.canvasModel.zoom
                this.canvasModel.center.y -= (currentTouchCenter.y - this.previousTouchCenter.y) / this.canvasModel.zoom
                this.canvasModel.draw()
                // Remember
                this.previousTouchCenter = currentTouchCenter
                this.previousTouchLength = currentTouchLength
            }
        }
    }

    handleTouchEnd(event) {
        event.preventDefault()
        // Check
        if (this.canvasModel && this.canvasModel.center && this.canvasModel.zoom) {
            // Check
            if (this.lineModel) {
                // Reset
                this.lineModel = undefined
                // Broadcast
                this.canvasModel.broadcast('out')
            }
            if (event.touches.length == 2 || (event.ctrlKey && event.touches.length == 1)) {
                // Prepare
                const x0 = event.touches[0].clientX
                const y0 = event.touches[0].clientY
                const x1 = event.touches.length == 2 ? event.touches[1].clientX : 0
                const y1 = event.touches.length == 2 ? event.touches[1].clientY : 0
                const dx = x1 - x0
                const dy = y1 - y0
                // Remember
                this.previousTouchCenter = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 }
                this.previousTouchLength = Math.sqrt(dx * dx + dy * dy)
            }
        }
    }

    // Handlers (change)

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

    // Line

    startLine(point) {
        // Define
        const lineId = '' + Math.random().toString(16).substring(2)
        const color = this.clientModel.color
        const width = this.clientModel.width
        const alpha = this.clientModel.alpha
        // Create
        this.lineModel = new LineModel(lineId, clientId, color, width, alpha, [point])
        // Update
        this.canvasModel.lines[lineId] = this.lineModel
        this.canvasModel.draw()
        // Broadcast
        this.canvasModel.broadcast('start', { lineId: this.lineModel.lineId, point })
    }

    continueLine(point) {
        if (this.lineModel) {
            // Update
            this.lineModel.points.push(point)
            // Draw
            this.canvasModel.draw()
            // Broadcast
            this.canvasModel.broadcast('continue', { lineId: this.lineModel.lineId, point })    
        }
    }
}