import { div, footer, header, main } from '../functions/html'

export class BaseScreen {
    // Static
    
    static ACTIVE: BaseScreen
    
    // Non-static

    headerNode: HTMLElement
    mainNode: HTMLElement
    footerNode: HTMLElement
    rootNode: HTMLDivElement

    constructor(id: string, className?: string) {
        // Header
        this.headerNode = header()
        
        // Main
        this.mainNode = main()

        // Footer
        this.footerNode = footer()

        // Root
        this.rootNode = div({ id, className: className ? 'screen ' + className : 'screen' }, this.headerNode, this.mainNode, this.footerNode)

        // Body
        document.body.appendChild(this.rootNode)
    }

    show() {
        // Hide previous active screen
        if (BaseScreen.ACTIVE) {
            BaseScreen.ACTIVE.hide()
        }
        // Update active screen
        BaseScreen.ACTIVE = this
        // Show own screen
        this.rootNode.style.display = 'block'
    }
    
    hide() {
        // Hide own screen
        this.rootNode.style.display = 'none'
    }
}