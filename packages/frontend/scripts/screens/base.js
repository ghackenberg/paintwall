// CLASSES

class BaseScreen {
    // Static
    
    static ACTIVE
    
    // Non-static

    constructor(id) {        
        // Header
        this.headerNode = header()
        
        // Main
        this.mainNode = main()

        // Footer
        this.footerNode = footer()

        // Root
        this.rootNode = div({ id, className: 'screen' }, [ this.headerNode, this.mainNode, this.footerNode ])

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