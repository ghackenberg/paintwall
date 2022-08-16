import * as qrcode from 'qrcode'
import { BASE, PointObject, StraightLineObject } from 'paintwall-common'
import { CLIENT_ID } from '../constants/client'
import { unprojectX, unprojectY } from '../functions/draw'
import { append, canvas, div, img, input, span } from '../functions/html'
import { CanvasModel } from '../models/canvas'
import { ClientModel } from '../models/client'
import { LineModel } from '../models/line'
import { StraightLineModel } from '../models/straightLine'
import { BaseScreen } from './base'
import { SquareModel } from '../models/square'
import { CircleModel } from '../models/circle'
import { TriangleModel } from '../models/triangle'
import { USER_DATA } from '../constants/user'

interface NodeMap<T extends HTMLElement> {
    [id: string]: T
}

export class PaintScreen extends BaseScreen {
    // Static

    static TOOLS = [ 'line', 'straightLine', 'circle', 'square', 'triangle']
    static COLORS = ['dodgerblue', 'mediumseagreen', 'yellowgreen', 'gold', 'orange', 'tomato', 'hotpink', 'mediumorchid', 'gray', 'black']
    static WIDTHS = [1, 5, 10]
    static ALPHAS = [1, 0.75, 0.5, 0.25]
    static REACTIONS = ['🧡', '🤣', '👍', '😂', '✌']

    // Non-static

    // Models
    
    clientModel: ClientModel = undefined
    canvasModel: CanvasModel = undefined
    lineModel: LineModel = undefined
    straightLineModel: StraightLineModel = undefined
    circleModel: CircleModel = undefined
    squareModel: SquareModel = undefined
    triangleModel: TriangleModel = undefined

    // Nodes

    loadNode: HTMLImageElement
    canvasNode: HTMLCanvasElement
    backNode: HTMLDivElement

    countNode: HTMLDivElement
    viewCountNode: HTMLSpanElement
    shapeCountNode: HTMLSpanElement
    clientCountNode: HTMLSpanElement
    reactionCountNode: HTMLSpanElement

    shareButtonNode: HTMLDivElement
    sharePopupNode: HTMLDivElement
    sharePopupImageNode: HTMLImageElement
    sharePopupLabelNode: HTMLDivElement
    sharePopupDivNode: HTMLDivElement
    sharePopupCanvasNode: HTMLCanvasElement

    toolButtonNode: HTMLDivElement
    toolButtonImageNode: HTMLImageElement
    toolPopupNode: HTMLDivElement
    toolPopupImageNode: HTMLImageElement
    toolPopupLabelNode: HTMLDivElement
    toolPopupSelectNode: HTMLDivElement
    toolPopupSelectChildNodes: NodeMap<HTMLSpanElement> = {}

    colorButtonNode: HTMLDivElement
    colorPopupNode: HTMLDivElement
    colorPopupImageNode: HTMLImageElement
    colorPopupLabelNode: HTMLDivElement
    colorPopupSelectNode: HTMLDivElement
    colorPopupSelectChildNodes: NodeMap<HTMLSpanElement> = {}

    widthButtonNode: HTMLDivElement
    widthButtonSpanNode: HTMLSpanElement
    widthPopupNode: HTMLDivElement
    widthPopupImageNode: HTMLImageElement
    widthPopupLabelNode: HTMLDivElement
    widthPopupSelectNode: HTMLDivElement
    widthPopupSelectChildNodes: NodeMap<HTMLSpanElement> = {}

    alphaButtonNode: HTMLDivElement
    alphaButtonSpanNode: HTMLSpanElement
    alphaPopupNode: HTMLDivElement
    alphaPopupImageNode: HTMLImageElement
    alphaPopupLabelNode: HTMLDivElement
    alphaPopupSelectNode: HTMLDivElement
    alphaPopupSelectChildNodes: NodeMap<HTMLSpanElement> = {}

    reactionSelectNode: HTMLDivElement
    reactionSelectChildNodes: NodeMap<HTMLSpanElement> = {}
    reactionSelectCountNodes: NodeMap<HTMLSpanElement> = {}

    // Coordinates

    previousTouches: PointObject[] = []
    targetTouchCenter: PointObject = undefined
    previousTouchLength: number = undefined

    // Constructor

    constructor() {
        super('paint')
        
        // Constants
        const clientId = CLIENT_ID
        const userId: string = USER_DATA.user ? USER_DATA.user.userId : null
        const color = PaintScreen.COLORS.includes(localStorage.getItem('color')) ? localStorage.getItem('color') : PaintScreen.COLORS[0]
        const width = PaintScreen.WIDTHS.includes(parseFloat(localStorage.getItem('width'))) ? parseFloat(localStorage.getItem('width')) : PaintScreen.WIDTHS[0]
        const alpha = PaintScreen.ALPHAS.includes(parseFloat(localStorage.getItem('alpha'))) ? parseFloat(localStorage.getItem('alpha')) : PaintScreen.ALPHAS[0]
        const tool = PaintScreen.TOOLS.includes(localStorage.getItem('tool')) ? localStorage.getItem('tool') : PaintScreen.TOOLS[0]
        const position: PointObject = undefined

        // States
        this.clientModel = new ClientModel(clientId, userId, tool, color, width, alpha, position)

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
            onclick: () => history.back()
        }, img({ src:  BASE + '/images/back.png' }))

        // Nodes (count)
        {
            // Children
            this.viewCountNode = span()
            this.shapeCountNode = span()
            this.clientCountNode = span()
            this.reactionCountNode = span()
            
            // Container
            this.countNode = div({ id: 'count' }, [
                span({ className: 'count view' }, this.viewCountNode),
                span({ className: 'count shape' }, this.shapeCountNode),
                span({ className: 'count client' }, this.clientCountNode, img({ src: BASE + '/images/live.png' })),
                span({ className: 'count reaction' }, this.reactionCountNode)
            ])
        }

        // Nodes (share)
        {
            // Button
            this.shareButtonNode = div({ id: 'share-button', className: 'icon active',
                onclick: () => {
                    this.hidePopups()
                    this.sharePopupNode.style.display = 'block'
                    navigator.clipboard.writeText(location.href)
                }
            }, img({ src: BASE + '/images/share.png' }))

            // Popup children
            this.sharePopupImageNode = img({ src: BASE + '/images/close.png', 
                onclick: () => {
                    this.sharePopupNode.style.display = 'none' 
                }
            })
            this.sharePopupLabelNode = div({ className: 'label' })
            this.sharePopupDivNode = div({ className: 'note' }, 'Copied to clipboard 📋')
            this.sharePopupCanvasNode = canvas()

            // Popup container
            this.sharePopupNode = div({ id: 'share-popup', className: 'popup' }, [
                this.sharePopupLabelNode,
                this.sharePopupImageNode,
                this.sharePopupDivNode,
                this.sharePopupCanvasNode
            ])
        }
        
        // Nodes (tool)
        {
            // Button children
            this.toolButtonImageNode = img({ src: BASE + '/images/' + tool + '.png' })

            // Button container
            this.toolButtonNode = div({ id: 'tool-button', className: 'icon active',
                onclick: () => {
                    this.hidePopups()
                    this.toolPopupNode.style.display = 'block'
                }
            }, this.toolButtonImageNode)

            // Popup select children
            for (const otherTool of PaintScreen.TOOLS) {
                this.toolPopupSelectChildNodes[otherTool] = span({ className: otherTool == tool ? 'icon active' : 'icon',
                    onclick: () => {
                        this.changeTool(otherTool)
                        this.toolPopupNode.style.display = 'none'
                    }
                }, img({ src: BASE + '/images/' + otherTool + '.png' }))
            }

            // Popup children
            this.toolPopupImageNode = img({ src: BASE + '/images/close.png', 
                onclick: () => {
                    this.toolPopupNode.style.display = 'none' 
                }
            })
            this.toolPopupLabelNode = div({ className: 'label' }, 'Select tool!')
            this.toolPopupSelectNode = div({ className: 'select' }, Object.values(this.toolPopupSelectChildNodes))

            // Popup container
            this.toolPopupNode = div({ id: 'tool-popup', className: 'popup' }, [
                this.toolPopupImageNode,
                this.toolPopupLabelNode,
                this.toolPopupSelectNode
            ])
        }

        // Nodes (color)
        {
            // Button
            this.colorButtonNode = div({ id: 'color-button', className: 'icon active',
                onclick: () => {
                    this.hidePopups()
                    this.colorPopupNode.style.display = 'block'
                }
            })
            this.colorButtonNode.style.backgroundColor = color

            // Popup select children
            for (const otherColor of PaintScreen.COLORS) {
                this.colorPopupSelectChildNodes[otherColor] = span({ className: otherColor == color ? 'icon active' : 'icon',
                    onclick: () => {
                        this.changeColor(otherColor)
                        this.colorPopupNode.style.display = 'none'
                    }
                })
                this.colorPopupSelectChildNodes[otherColor].style.backgroundColor = otherColor
            }

            // Popup children
            this.colorPopupImageNode = img({ src: BASE + '/images/close.png', 
                onclick: () => {
                    this.colorPopupNode.style.display = 'none' 
                }
            })
            this.colorPopupLabelNode = div({ className: 'label' }, 'Select color!')
            this.colorPopupSelectNode = div({ className: 'select' }, Object.values(this.colorPopupSelectChildNodes))

            // Popup
            this.colorPopupNode = div({ id: 'color-popup', className: 'popup' }, [
                this.colorPopupImageNode,
                this.colorPopupLabelNode,
                this.colorPopupSelectNode
            ])
        }

        // Nodes (width)
        {
            // Button children
            this.widthButtonSpanNode = span(width)

            // Button container
            this.widthButtonNode = div({ id: 'width-button', className: 'icon active',
                onclick: () => {
                    this.hidePopups()
                    this.widthPopupNode.style.display = 'block'
                }
            }, this.widthButtonSpanNode)

            // Popup select children
            for (const otherWidth of PaintScreen.WIDTHS) {
                this.widthPopupSelectChildNodes[otherWidth] = span({ className: otherWidth == width ? 'icon active': 'icon',
                    onclick: () => {
                        this.handleChangeWidth(otherWidth)
                        this.widthPopupNode.style.display = 'none'
                    }
                }, span(otherWidth))
            }

            // Popup children
            this.widthPopupImageNode = img({ src: BASE + '/images/close.png', 
                onclick: () => {
                    this.widthPopupNode.style.display = 'none' 
                }
            })
            this.widthPopupLabelNode = div({ className: 'label' }, 'Select width!')
            this.widthPopupSelectNode = div({ className: 'select' }, Object.values(this.widthPopupSelectChildNodes))

            // Popup container
            this.widthPopupNode = div({ id: 'width-popup', className: 'popup' }, [
                this.widthPopupImageNode,
                this.widthPopupLabelNode,
                this.widthPopupSelectNode
            ])
        }

        // Nodes (alpha)
        {
            const color = Math.round(255 - 255 * alpha)

            // Button children
            this.alphaButtonSpanNode = span((100 - alpha * 100) + '%')

            // Button container
            this.alphaButtonNode = div({ id: 'alpha-button', className: 'icon active',
                onclick: () => {
                    this.hidePopups()
                    this.alphaPopupNode.style.display = 'block'
                }
            }, this.alphaButtonSpanNode)
            this.alphaButtonNode.style.backgroundColor = 'rgb(' + color + ',' + color + ',' + color + ')'

            // Popup select children
            for (const otherAlpha of PaintScreen.ALPHAS) {
                const color = Math.round(255 - 255 * otherAlpha)

                const percentage = 100 - otherAlpha * 100;
                this.alphaPopupSelectChildNodes[otherAlpha] = span({ className: otherAlpha == alpha ? 'icon active': 'icon',
                    onclick: () => {
                        this.handleChangeAlpha(otherAlpha)
                        this.alphaPopupNode.style.display = 'none'
                    }
                }, span(percentage + '%'))
                this.alphaPopupSelectChildNodes[otherAlpha].style.backgroundColor = 'rgb(' + color + ',' + color + ',' + color + ')'
            }

            // Popup children
            this.alphaPopupImageNode = img({ src: BASE + '/images/close.png', 
                onclick: () => {
                    this.alphaPopupNode.style.display = 'none' 
                }
            })
            this.alphaPopupLabelNode = div({ className: 'label' }, 'Select transparency!')
            this.alphaPopupSelectNode = div({ className: 'select' }, Object.values(this.alphaPopupSelectChildNodes))

            // Popup container
            this.alphaPopupNode = div({ id: 'alpha-popup', className: 'popup' }, [
                this.alphaPopupImageNode,
                this.alphaPopupLabelNode,
                this.alphaPopupSelectNode
            ])
        }

        // Nodes (reaction)
        {
            // Children
            for (const reaction of PaintScreen.REACTIONS){
                this.reactionSelectCountNodes[reaction] = span()
                this.reactionSelectCountNodes[reaction].style.display = 'none'

                this.reactionSelectChildNodes[reaction] = span({
                    onclick: () => {
                        // Update reaction count
                        if (reaction in this.canvasModel.reactions) {
                            this.canvasModel.reactions[reaction]++
                        } else {
                            this.canvasModel.reactions[reaction] = 1
                        }
                        // Update reaction count node
                        this.reactionSelectCountNodes[reaction].textContent = `${this.canvasModel.reactions[reaction]}`
                        this.reactionSelectCountNodes[reaction].style.display = 'block'
                        // Broadcast reaction
                        this.canvasModel.broadcast('client-react', reaction)
                    }
                }, [
                    span(reaction),
                    this.reactionSelectCountNodes[reaction]
                ])
            }

            // Container
            this.reactionSelectNode = div({id: 'reaction' }, Object.values(this.reactionSelectChildNodes))
        }

        // Nodes (main)
        append(this.mainNode, [
            this.loadNode,
            this.canvasNode,
            this.backNode,
            this.countNode,
            this.reactionSelectNode,
            this.colorButtonNode, this.colorPopupNode,
            this.alphaButtonNode, this.alphaPopupNode,
            this.widthButtonNode, this.widthPopupNode,
            this.toolButtonNode, this.toolPopupNode,
            this.shareButtonNode, this.sharePopupNode
        ])
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
        this.sharePopupLabelNode.textContent = location.href

        // Share popup code
        qrcode.toCanvas(this.sharePopupCanvasNode, location.href)

        // Canvas model
        this.canvasModel = new CanvasModel(this.canvasNode, canvasId)
        this.canvasModel.on('init-counts', (data) => {
            this.clientCountNode.textContent = `${this.canvasModel.counts.clients}`
        })
        this.canvasModel.on('init-reactions', (data) => {
            for (const reaction of PaintScreen.REACTIONS){
                if (reaction in this.canvasModel.reactions) {
                    this.reactionSelectCountNodes[reaction].textContent = `${data[reaction]}`
                    this.reactionSelectCountNodes[reaction].style.display = 'block'
                } else {
                    this.reactionSelectCountNodes[reaction].textContent = '0'
                    this.reactionSelectCountNodes[reaction].style.display = 'none'
                }
            }
        })
        this.canvasModel.on('init-coordinates', (data) => {
            this.loadNode.style.display = 'none'
        })
        this.canvasModel.on('client-enter', (clientId, data) => {
            this.clientCountNode.textContent = `${this.canvasModel.counts.clients}`
        })
        this.canvasModel.on('client-leave', (clientId) => {
            this.clientCountNode.textContent = `${this.canvasModel.counts.clients}`
        })
        this.canvasModel.on('client-react', (clientId, data) => {
            if (data in this.reactionSelectCountNodes) {
                this.reactionSelectCountNodes[data].textContent = `${this.canvasModel.reactions[data]}`
                this.reactionSelectCountNodes[data].style.display = 'block'
            }
        })
        this.canvasModel.on('client-react', (clientId, data) => {
            console.log(`Neue Reaktion ${data} von Client ${clientId} zum Zeitpunkt ${Date.now()}`)
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
        // Popups
        this.hidePopups()
        // Canvas
        this.canvasModel.disconnect()
        this.canvasModel = undefined
        // Line
        this.lineModel = undefined
        // Window
        window.removeEventListener('resize', this.handleResize)
    }

    hidePopups() {
        this.sharePopupNode.style.display = 'none'
        this.toolPopupNode.style.display = 'none'
        this.colorPopupNode.style.display = 'none'
        this.widthPopupNode.style.display = 'none'
        this.alphaPopupNode.style.display = 'none'
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
                this.hidePopups()
                if (this.clientModel.tool == 'line') {
                    this.startLine(point)
                } else if (this.clientModel.tool == 'straightLine') {
                    this.startStraightLine(point)
                } else if (this.clientModel.tool == 'circle') {
                    this.startCircle(point)
                } else if (this.clientModel.tool == 'square') {
                    this.startSquare(point)
                } else if (this.clientModel.tool == 'triangle') {
                    this.startTriangle(point)
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
                } else if (this.clientModel.tool == 'straightLine') {
                    this.continueStraightLine(point)
                } else if (this.clientModel.tool == 'circle') {
                    this.continueCircle(point)
                } else if (this.clientModel.tool == 'square') {
                    this.continueSquare(point)
                } else if (this.clientModel.tool == 'triangle') {
                    this.continueTriangle(point)
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
                this.hidePopups()
                if (this.clientModel.tool == 'line') {
                    this.startLine(point)
                } else if (this.clientModel.tool == 'straightLine') {
                    this.startStraightLine(point)
                } else if (this.clientModel.tool == 'circle') {
                    this.startCircle(point)
                } else if (this.clientModel.tool == 'square') {
                    this.startSquare(point)
                } else if (this.clientModel.tool == 'triangle') {
                    this.startTriangle(point)
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
                        this.hidePopups()
                        if (this.clientModel.tool == 'line') {
                            this.startLine(this.previousTouches.shift())
                            while (this.previousTouches.length > 0) {
                                this.continueLine(this.previousTouches.shift())
                            }
                        } else if (this.clientModel.tool == 'straightLine') {
                            this.startStraightLine(this.previousTouches.shift())
                            while (this.previousTouches.length > 0) {
                                this.continueStraightLine(this.previousTouches.shift())
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
                        } else if (this.clientModel.tool == 'triangle') {
                            this.startTriangle(this.previousTouches.shift())
                            while (this.previousTouches.length > 0) {
                                this.continueTriangle(this.previousTouches.shift())
                            }
                        }                    
                    }
                } else {
                    if (this.clientModel.tool == 'line') {
                        this.continueLine(point)
                    } else if (this.clientModel.tool == 'straightLine') {
                        this.continueStraightLine(point)
                    } else if (this.clientModel.tool == 'circle') {
                        this.continueCircle(point)
                    } else if (this.clientModel.tool == 'square') {
                        this.continueSquare(point)
                    }  else if (this.clientModel.tool == 'triangle') {
                        this.continueTriangle(point)
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
        this.colorButtonNode.style.backgroundColor = value
        // Deactivate
        this.colorPopupSelectChildNodes[this.clientModel.color].classList.remove('active')
        // Update
        this.clientModel.color = value
        // Activate
        this.colorPopupSelectChildNodes[this.clientModel.color].classList.add('active')
        // Remember
        localStorage.setItem('color', this.clientModel.color)
        // Broadcast
        this.canvasModel.broadcast('client-color', this.clientModel.color)
    }


    handleChangeWidth(value: number) {
        this.widthButtonSpanNode.textContent = '' + value
        // Deactivate
        this.widthPopupSelectChildNodes[this.clientModel.width].classList.remove('active')
        // Update
        this.clientModel.width = value
        // Activate
        this.widthPopupSelectChildNodes[this.clientModel.width].classList.add('active')
        // Remember
        localStorage.setItem('width', '' + this.clientModel.width)
        // Broadcast
        this.canvasModel.broadcast('client-width', this.clientModel.width)
    }

    handleChangeAlpha(value: number) {
        const color = Math.round(255 - value * 255)
        // Update button span
        this.alphaButtonSpanNode.textContent = (100 - value * 100) + '%'
        // Update button
        this.alphaButtonNode.style.backgroundColor = 'rgb(' + color + ',' + color + ',' + color + ')'
        // Deactivate
        this.alphaPopupSelectChildNodes[this.clientModel.alpha].classList.remove('active')
        // Update
        this.clientModel.alpha = value
        // Activate
        this.alphaPopupSelectChildNodes[this.clientModel.alpha].classList.add('active')
        // Remember
        localStorage.setItem('alpha', '' + this.clientModel.alpha)
        // Broadcast
        this.canvasModel.broadcast('client-alpha', this.clientModel.alpha)
    }
    
    changeTool(value: string) {
        this.toolButtonImageNode.src = BASE + '/images/' + value + '.png'
        // Deactivate
        this.toolPopupSelectChildNodes[this.clientModel.tool].classList.remove('active')
        // Update
        this.clientModel.tool = value
        // Activate
        this.toolPopupSelectChildNodes[this.clientModel.tool].classList.add('active')
        // Remember
        localStorage.setItem('tool', this.clientModel.tool)
        // Broadcast
        this.canvasModel.broadcast('client-tool', this.clientModel.tool)
    }

    // Line

    startLine(point: PointObject) {
        // Define
        const lineId = '' + Math.random().toString(16).substring(2)
        const clientId = this.clientModel.clientId
        const userId = this.clientModel.userId
        const color = this.clientModel.color
        const width = this.clientModel.width
        const alpha = this.clientModel.alpha
        // Create
        this.lineModel = new LineModel(lineId, clientId, userId, color, width, alpha, [point])
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

    // StraightLine

    startStraightLine(point: PointObject) {
        // Define
        const straightLineId = '' + Math.random().toString(16).substring(2)
        const clientId = this.clientModel.clientId
        const userId = this.clientModel.userId
        const color = this.clientModel.color
        const width = this.clientModel.width
        const alpha = this.clientModel.alpha
        // Create
        this.straightLineModel = new StraightLineModel(straightLineId, clientId, userId, color, width, alpha, point, point)
        // Update
        this.canvasModel.straightLines[straightLineId] = this.straightLineModel
        this.canvasModel.draw()
        // Broadcast
        this.canvasModel.broadcast('client-straightLine-start', { straightLineId: this.straightLineModel.straightLineId, point })
    }

    continueStraightLine(point: PointObject) {
        if (this.straightLineModel) {
            // Update
            this.straightLineModel.end = point
            // Draw
            this.canvasModel.draw()
            // Broadcast
            this.canvasModel.broadcast('client-straightLine-continue', { straightLineId: this.straightLineModel.straightLineId, point })    
        }
    }

    // Circle

    startCircle(point: PointObject) {
        // Define
        const circleId = '' + Math.random().toString(16).substring(2)
        const clientId = this.clientModel.clientId
        const userId = this.clientModel.userId
        const color = this.clientModel.color
        const width = this.clientModel.width
        const alpha = this.clientModel.alpha
        // Create
        this.circleModel = new CircleModel(circleId, clientId, userId, color, width, alpha, point, point)
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
        const clientId = this.clientModel.clientId
        const userId = this.clientModel.userId
        const color = this.clientModel.color
        const width = this.clientModel.width
        const alpha = this.clientModel.alpha
        // Create
        this.squareModel = new SquareModel(squareId, clientId, userId, color, width, alpha, point, point)
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

    // Triangle

    startTriangle(point: PointObject) {
        // Define
        const triangleId = '' + Math.random().toString(16).substring(2)
        const clientId = this.clientModel.clientId
        const userId = this.clientModel.userId
        const color = this.clientModel.color
        const width = this.clientModel.width
        const alpha = this.clientModel.alpha
        // Create
        this.triangleModel = new TriangleModel(triangleId, clientId, userId, color, width, alpha, point, point)
        // Update
        this.canvasModel.triangles[triangleId] = this.triangleModel
        this.canvasModel.draw()
        // Broadcast
        this.canvasModel.broadcast('client-triangle-start', { triangleId: this.triangleModel.triangleId, point })
    }

    continueTriangle(point: PointObject) {
        if (this.triangleModel) {
            // Update
            this.triangleModel.end = point
            // Draw
            this.canvasModel.draw()
            // Broadcast
            this.canvasModel.broadcast('client-triangle-continue', { triangleId: this.triangleModel.triangleId, point })    
        }
    }

}