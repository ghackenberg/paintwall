import * as qrcode from 'qrcode'
import { BASE, PointObject } from 'paintwall-common'
import { CLIENT_ID } from '../constants/client'
import { unprojectX, unprojectY } from '../functions/draw'
import { append, canvas, div, img, input, span, button, textarea, p } from '../functions/html'
import { CanvasModel } from '../models/canvas'
import { ClientModel } from '../models/client'
import { LineModel } from '../models/line'
import { BaseScreen } from './base'
import { SquareModel } from '../models/square'
import { CircleModel } from '../models/circle'
import { CommentModel } from '../models/comment'

interface NodeMap {
    [id: string]: HTMLSpanElement
}

export class PaintScreen extends BaseScreen {
    // Static

    static TOOLS = [ 'line', 'circle', 'square']
    static COLORS = ['dodgerblue', 'mediumseagreen', 'yellowgreen', 'gold', 'orange', 'tomato', 'hotpink', 'mediumorchid', 'gray', 'black']
    static WIDTHS = [5.0]
    static ALPHAS = [0.5]
    static REACTIONS = ['🧡', '🤣', '👍', '😂', '✌']

    // Non-static
    isTextBoxActive = false
    // Models
    
    clientModel: ClientModel = undefined
    canvasModel: CanvasModel = undefined
    lineModel: LineModel = undefined
    circleModel: CircleModel = undefined
    squareModel: SquareModel = undefined

    // Nodes

    loadNode: HTMLImageElement
    canvasNode: HTMLCanvasElement
    backNode: HTMLDivElement

    countNode: HTMLDivElement
    viewCountNode: HTMLSpanElement
    shapeCountNode: HTMLSpanElement
    clientCountNode: HTMLSpanElement
    reactionCountNode: HTMLSpanElement

    toolNode: HTMLDivElement
    toolNodes: NodeMap = {}

    colorNode: HTMLDivElement
    colorNodes: NodeMap = {}

    shareNode: HTMLDivElement
    sharePopupImageNode: HTMLImageElement
    sharePopupInputNode: HTMLInputElement
    sharePopupDivNode: HTMLDivElement
    sharePopupCanvasNode: HTMLCanvasElement
    sharePopupNode: HTMLDivElement

    reactionNode: HTMLDivElement
    reactionNodes: NodeMap = {}
    reactionCountNodes: NodeMap = {}

    commentNode: HTMLSpanElement
    commentCountNode: HTMLSpanElement
    commentPopupTextareaNode: HTMLTextAreaElement
    commentPopupButtonNode: HTMLButtonElement
    commentPopupNode: HTMLDivElement

    commentsListNode: HTMLDivElement
    commentsListItemNode: HTMLParagraphElement

    // Coordinates

    previousTouches: PointObject[] = []
    targetTouchCenter: PointObject = undefined
    previousTouchLength: number = undefined

    // Constructor

    constructor() {
        super('paint')
        
        // Constants
        const name: string = undefined
        const tool = PaintScreen.TOOLS.includes(localStorage.getItem('tool')) ? localStorage.getItem('tool') : PaintScreen.TOOLS[0]
        const color = PaintScreen.COLORS.includes(localStorage.getItem('color')) ? localStorage.getItem('color') : PaintScreen.COLORS[0]
        const width = PaintScreen.WIDTHS.includes(parseFloat(localStorage.getItem('width'))) ? parseFloat(localStorage.getItem('width')) : PaintScreen.WIDTHS[0]
        const alpha = PaintScreen.ALPHAS.includes(parseFloat(localStorage.getItem('alpha'))) ? parseFloat(localStorage.getItem('alpha')) : PaintScreen.ALPHAS[0]
        const position: PointObject = undefined

        // States
        this.clientModel = new ClientModel(CLIENT_ID, name, tool, color, width, alpha, position)

        // Handlers
        this.handleResize = this.handleResize.bind(this)

        // Nodes (load)
        this.loadNode = img({ className: 'load', src: BASE + '/images/load.png' })

        // Nodes (canvas)
        this.canvasNode = canvas({ id: 'canvas',
            oncontextmenu: event => event.preventDefault(),
            onwheel: this.handleWheel.bind(this),
            onmousedown: this.handleMouseDown.bind(this),
            onmouseup: this.handleMouseUp.bind(this),
            onmousemove: this.handleMouseMove.bind(this),
            onmouseover: this.handleMouseOver.bind(this),
            onmouseout: this.handleMouseOut.bind(this),
            ontouchstart: this.handleTouchStart.bind(this),
            ontouchmove: this.handleTouchMove.bind(this),
            ontouchend: this.handleTouchEnd.bind(this)
        })

        // Nodes (back)
        this.backNode = div({ id: 'back', className: 'icon active',
            onclick: () => {
                this.commentsListNode.childNodes.forEach(c => c.remove())
                history.back()
            }
        }, img({ src:  BASE + '/images/back.png' }))


        // Nodes (view count)
        this.viewCountNode = span()

        // Nodes (shape count)
        this.shapeCountNode = span()

        // Nodes (client count)
        this.clientCountNode = span()

        // Nodes (reaction count)
        this.reactionCountNode = span()
        
        // Nodes (count)
        this.countNode = div({ id: 'count' }, 
            span({ className: 'count view' }, this.viewCountNode),
            span({ className: 'count shape' }, this.shapeCountNode),
            span({ className: 'count client' }, this.clientCountNode, img({ src: BASE + '/images/live.png' })),
            span({ className: 'count reaction' }, this.reactionCountNode))

        // Nodes (tools)
        for (const othertool of PaintScreen.TOOLS) {
            this.toolNodes[othertool] = span({ className: othertool == tool ? 'tool icon active' : 'tool icon',
                onclick: () => {
                    this.changeTool(othertool)
                }
            }, img({ src: BASE + '/images/' + othertool + '.png' }))
        }

        // Nodes (tool)
        this.toolNode = div({id: 'tool'}, Object.values(this.toolNodes))

        // Nodes (share)
        this.shareNode = div({ id: 'share', className: 'icon active',
            onclick: () => {
                this.sharePopupNode.style.display = 'block'
                navigator.clipboard.writeText(location.href)
            }
        }, img({ src: BASE + '/images/share.png' }))

        // Nodes (share popup image)
        this.sharePopupImageNode = img({ src: BASE + '/images/close.png', 
            onclick: () => {
                this.sharePopupNode.style.display = 'none' 
            }
        })

        // Nodes (share popup input)
        this.sharePopupInputNode = input()

        // Nodes (share popup div)
        this.sharePopupDivNode = div('Copied to clipboard 📋')

        // Nodes (share popup canvas)
        this.sharePopupCanvasNode = canvas()

        // Nodes (share popup)
        this.sharePopupNode = div({ id: 'share-popup' }, this.sharePopupInputNode, this.sharePopupImageNode, this.sharePopupDivNode, this.sharePopupCanvasNode)

        // Nodes (colors)
        for (const otherColor of PaintScreen.COLORS) {
            this.colorNodes[otherColor] = span({ className: otherColor == color ? 'color active' : 'color',
                onclick: () => {
                    this.changeColor(otherColor)
                }
            })
            this.colorNodes[otherColor].style.backgroundColor = otherColor
        }

        // Nodes (color)
        this.colorNode = div({ id: 'color' }, Object.values(this.colorNodes))

        // Nodes (reactions)
        for (const reaction of PaintScreen.REACTIONS){
            this.reactionCountNodes[reaction] = span()
            this.reactionCountNodes[reaction].style.display = 'none'

            this.reactionNodes[reaction] = span({
                onclick: () => {
                    // Update reaction count
                    if (reaction in this.canvasModel.reactions) {
                        this.canvasModel.reactions[reaction]++
                    } else {
                        this.canvasModel.reactions[reaction] = 1
                    }
                    // Update reaction count node
                    this.reactionCountNodes[reaction].textContent = `${this.canvasModel.reactions[reaction]}`
                    this.reactionCountNodes[reaction].style.display = 'block'
                    // Broadcast reaction
                    this.canvasModel.broadcast('client-react', reaction)
                }
            }, span(reaction), this.reactionCountNodes[reaction])
        }

        // Nodes (reaction)
        this.reactionNode = div({ id: 'reaction' }, Object.values(this.reactionNodes))

        // Nodes (comment)
        this.commentNode = span({ 
            id: "commentmain",
            onclick: () => this.handleToggleCommentBox()
        }, '💬')

        //
        this.commentPopupTextareaNode = textarea({ id: 'commentinput' })

        //
        this.commentPopupButtonNode = button(
            { 
                id: 'commentbutton',
                onclick: () => {
                    const content = this.commentPopupTextareaNode.value.trim()

                    if (content != "") {
                        // Submit comment
                        const commentId = '' + Math.random().toString(16).substring(2)

                        this.canvasModel.comments[commentId] = new CommentModel(commentId, undefined, CLIENT_ID, content)
                        this.canvasModel.counts.comments++
                        
                        this.canvasModel.broadcast('client-comment', { commentId, content })
                        
                        this.handleToggleCommentBox()
                        this.handleAddNewComment(content)
                        this.commentPopupTextareaNode.value = ""
                        
                    }
                },
            }, 
            "Comment"
        )

        // Nodes (comments List)
        this.commentsListNode = div({ id: 'commentlist' })

        //
        this.commentPopupNode = div({ id: 'textbox' }, this.commentPopupTextareaNode, this.commentPopupButtonNode)

        // Nodes (main)
        append(this.mainNode, [ this.loadNode, this.canvasNode, this.backNode, this.countNode, this.toolNode, this.colorNode, this.shareNode, this.sharePopupNode, this.reactionNode, this.commentNode, this.commentPopupNode, this.commentsListNode])
    }

    // Screen

    show() {
        // Node
        super.show()

        // Canvas id
        const canvasId = location.pathname.substring(location.pathname.lastIndexOf('/') + 1)

        // Load
        this.loadNode.style.display = 'block'

        // Share popup
        this.sharePopupNode.style.display = 'none'

        // Share popup input
        this.sharePopupInputNode.value = location.href

        // Share popup code
        qrcode.toCanvas(this.sharePopupCanvasNode, location.href)

        // Client name
        this.clientModel.name = 'Anonymous'

        // Canvas model
        this.canvasModel = new CanvasModel(this.canvasNode, canvasId)
        this.canvasModel.on('init-counts', (data) => {
            this.clientCountNode.textContent = `${this.canvasModel.counts.clients}`
        })
        this.canvasModel.on('init-reactions', (data) => {
            for (const reaction of PaintScreen.REACTIONS){
                if (reaction in this.canvasModel.reactions) {
                    this.reactionCountNodes[reaction].textContent = `${data[reaction]}`
                    this.reactionCountNodes[reaction].style.display = 'block'
                } else {
                    this.reactionCountNodes[reaction].textContent = '0'
                    this.reactionCountNodes[reaction].style.display = 'none'
                }
            }
        })
        this.canvasModel.on('init-coordinates', (data) => {
            this.loadNode.style.display = 'none'
        })
        this.canvasModel.on('init-client', (data) => {
            console.log('init-client')
        })
        this.canvasModel.on('client-enter', (clientId, data) => {
            this.clientCountNode.textContent = `${this.canvasModel.counts.clients}`
        })
        this.canvasModel.on('client-leave', (clientId) => {
            this.clientCountNode.textContent = `${this.canvasModel.counts.clients}`
        })
        this.canvasModel.on('client-react', (clientId, data) => {
            if (data in this.reactionCountNodes) {
                this.reactionCountNodes[data].textContent = `${this.canvasModel.reactions[data]}`
                this.reactionCountNodes[data].style.display = 'block'
            }
        })
        this.canvasModel.on('client-comment', (clientId, data) => {
            this.handleAddNewComment(data.content)
        })
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

    handleWheel(event: WheelEvent) {
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

    handleMouseDown(event: MouseEvent) {
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
                if (this.clientModel.tool == 'line') {
                    this.startLine(point)
                } else if (this.clientModel.tool == 'circle') {
                    this.startCircle(point)
                } else if (this.clientModel.tool == 'square') {
                    this.startSquare(point)
                }
            }
            // Broadcast
            this.canvasModel.broadcast('client-pointer-move', point)
        }
    }

    handleMouseUp(event: MouseEvent) {
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
                //this.continueLine(point)
            }
            // Broadcast
            this.canvasModel.broadcast('client-pointer-move', point)
        }
    }

    handleMouseMove(event: MouseEvent) {
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
                if (this.clientModel.tool == 'line') {
                    this.continueLine(point)
                } else if (this.clientModel.tool == 'circle') {
                    this.continueCircle(point)
                } else if (this.clientModel.tool == 'square') {
                    this.continueSquare(point)
                }          
            }
            // Broadcast
            this.canvasModel.broadcast('client-pointer-move', point)
        }
    }

    handleMouseOver(event: MouseEvent) {
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
                if (this.clientModel.tool == 'line') {
                    this.startLine(point)
                } else if (this.clientModel.tool == 'circle') {
                    this.startCircle(point)
                } else if (this.clientModel.tool == 'square') {
                    this.startSquare(point)
                }              
            }
            // Broadcast
            this.canvasModel.broadcast('client-pointer-over', point)
        }
    }

    handleMouseOut(event: MouseEvent) {
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
                //this.continueLine(point)
            }
            // Broadcast
            this.canvasModel.broadcast('client-pointer-out')
        }
    }

    // Handler (touch)

    handleTouchStart(event: TouchEvent) {
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
                this.canvasModel.broadcast('client-pointer-over', point)
            } else {
                if (this.lineModel) {
                    // Reset
                    this.lineModel = undefined
                    // Broadcast
                    this.canvasModel.broadcast('client-pointer-out')
                }
                if (event.touches.length == 2 || (event.ctrlKey && event.touches.length == 1)) {
                    // Prepare
                    const x0 = event.touches[0].clientX
                    const y0 = event.touches[0].clientY
                    const x1 = event.touches.length == 2 ? event.touches[1].clientX : 0
                    const y1 = event.touches.length == 2 ? event.touches[1].clientY : 0
                    const dx = x1 - x0
                    const dy = y1 - y0
                    // Target
                    this.targetTouchCenter = {
                        x: unprojectX(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, (x0 + x1) / 2),
                        y: unprojectY(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, (y0 + y1) / 2)
                    }
                    // Previous
                    this.previousTouchLength = Math.sqrt(dx * dx + dy * dy)
                }
            }
        }
    }

    handleTouchMove(event: TouchEvent) {
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
                        if (this.clientModel.tool == 'line') {
                            this.startLine(this.previousTouches.shift())
                            while (this.previousTouches.length > 0) {
                                this.continueLine(this.previousTouches.shift())
                            }
                        } else if (this.clientModel.tool == 'circle') {
                            this.startCircle(this.previousTouches.shift())
                            while (this.previousTouches.length > 0) {
                                this.continueCircle(this.previousTouches.shift())
                            }
                        } else if (this.clientModel.tool == 'square') {
                            this.startSquare(this.previousTouches.shift())
                            while (this.previousTouches.length > 0) {
                                this.continueSquare(this.previousTouches.shift())
                            }
                        }                     
                    }
                } else {
                    if (this.clientModel.tool == 'line') {
                        this.continueLine(point)
                    } else if (this.clientModel.tool == 'circle') {
                        this.continueCircle(point)
                    } else if (this.clientModel.tool == 'square') {
                        this.continueSquare(point)
                    }
                }
                // Broadcast
                this.canvasModel.broadcast('client-pointer-move', point)
            } else if (event.touches.length == 2 || (event.ctrlKey && event.touches.length == 1)) {
                // Prepare
                const x0 = event.touches[0].clientX
                const y0 = event.touches[0].clientY
                const x1 = event.touches.length == 2 ? event.touches[1].clientX : 0
                const y1 = event.touches.length == 2 ? event.touches[1].clientY : 0
                const dx = x1 - x0
                const dy = y1 - y0
                // Update zoom
                const currentTouchLength = Math.sqrt(dx * dx + dy * dy)
                this.canvasModel.zoom *= currentTouchLength / this.previousTouchLength
                // Update center
                const currentTouchCenter = {
                    x: unprojectX(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, (x0 + x1) / 2),
                    y: unprojectY(this.canvasNode, this.canvasModel.center, this.canvasModel.zoom, (y0 + y1) / 2)
                }
                this.canvasModel.center.x -= (currentTouchCenter.x - this.targetTouchCenter.x)
                this.canvasModel.center.y -= (currentTouchCenter.y - this.targetTouchCenter.y)
                // Redraw
                this.canvasModel.draw()
                // Remember current touch length
                this.previousTouchLength = currentTouchLength
            }
        }
    }

    handleTouchEnd(event: TouchEvent) {
        event.preventDefault()
        // Check
        if (this.canvasModel && this.canvasModel.center && this.canvasModel.zoom) {
            // Check
            if (this.lineModel) {
                // Reset
                this.lineModel = undefined
                // Broadcast
                this.canvasModel.broadcast('client-pointer-out')
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
                this.targetTouchCenter = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 }
                this.previousTouchLength = Math.sqrt(dx * dx + dy * dy)
            }
        }
    }

    // Handlers (change)

    changeColor(value: string) {
        // Deactivate
        this.colorNodes[this.clientModel.color].classList.remove('active')
        // Update
        this.clientModel.color = value
        // Activate
        this.colorNodes[this.clientModel.color].classList.add('active')
        // Remember
        localStorage.setItem('color', this.clientModel.color)
        // Broadcast
        this.canvasModel.broadcast('client-color', this.clientModel.color)
    }

    changeTool(value: string) {
        // Deactivate
        this.toolNodes[this.clientModel.tool].classList.remove('active')
        // Update
        this.clientModel.tool = value
        // Activate
        this.toolNodes[this.clientModel.tool].classList.add('active')
        // Remember
        localStorage.setItem('tool', this.clientModel.tool)
        // Broadcast
        this.canvasModel.broadcast('client-tool', this.clientModel.tool)
    }

    // Line

    startLine(point: PointObject) {
        // Define
        const lineId = '' + Math.random().toString(16).substring(2)
        const color = this.clientModel.color
        const width = this.clientModel.width
        const alpha = this.clientModel.alpha
        // Create
        this.lineModel = new LineModel(lineId, CLIENT_ID, color, width, alpha, [point])
        // Update
        this.canvasModel.lines[lineId] = this.lineModel
        this.canvasModel.draw()
        // Broadcast
        this.canvasModel.broadcast('client-line-start', { lineId: this.lineModel.lineId, point })
    }

    continueLine(point: PointObject) {
        if (this.lineModel) {
            // Update
            this.lineModel.points.push(point)
            // Draw
            this.canvasModel.draw()
            // Broadcast
            this.canvasModel.broadcast('client-line-continue', { lineId: this.lineModel.lineId, point })    
        }
    }

    // Circle

    startCircle(point: PointObject) {
        // Define
        const circleId = '' + Math.random().toString(16).substring(2)
        const color = this.clientModel.color
        const width = this.clientModel.width
        const alpha = this.clientModel.alpha
        // Create
        this.circleModel = new CircleModel(circleId, CLIENT_ID, color, width, alpha, point, point)
        // Update
        this.canvasModel.circles[circleId] = this.circleModel
        this.canvasModel.draw()
        // Broadcast
        this.canvasModel.broadcast('client-circle-start', { circleId: this.circleModel.circleId, point })
    }

    continueCircle(point: PointObject) {
        if (this.circleModel) {
            // Update
            this.circleModel.end = point
            // Draw
            this.canvasModel.draw()
            // Broadcast
            this.canvasModel.broadcast('client-circle-continue', { circleId: this.circleModel.circleId, point })    
        }
    }

    // Square

    startSquare(point: PointObject) {
        // Define
        const squareId = '' + Math.random().toString(16).substring(2)
        const color = this.clientModel.color
        const width = this.clientModel.width
        const alpha = this.clientModel.alpha
        // Create
        this.squareModel = new SquareModel(squareId, CLIENT_ID, color, width, alpha, point, point)
        // Update
        this.canvasModel.squares[squareId] = this.squareModel
        this.canvasModel.draw()
        // Broadcast
        this.canvasModel.broadcast('client-square-start', { squareId: this.squareModel.squareId, point })
    }

    continueSquare(point: PointObject) {
        if (this.squareModel) {
            // Update
            this.squareModel.end = point
            // Draw
            this.canvasModel.draw()
            // Broadcast
            this.canvasModel.broadcast('client-square-continue', { squareId: this.squareModel.squareId, point })    
        }
    }

    // comment
    handleToggleCommentBox() {
        if (this.isTextBoxActive) {
            this.commentPopupNode.style.top = "calc(100vh + 100px)"
            this.commentPopupNode.style.animationName = "movedown" 
            this.commentPopupNode.style.animationDuration = "1s"
        } else {
            this.commentPopupNode.style.top = "calc(100vh - 250px)"
            this.commentPopupNode.style.animationName = "moveup" 
            this.commentPopupNode.style.animationDuration = "1s"
        }
        this.isTextBoxActive = !this.isTextBoxActive
    }

    handleAddNewComment(comment: string) {
        this.commentsListItemNode = p(
            { 
                id: "commentlistitem",
            }, 
            comment
        )
        this.commentsListNode.appendChild(this.commentsListItemNode)

        setTimeout(() => {
            this.commentsListNode.childNodes[0].remove()
        }, 15000)
    }

}