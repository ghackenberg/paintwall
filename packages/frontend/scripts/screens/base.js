// CLASSES

class BaseScreen {      //gilt als Mutterklasse zum erben
    // Static
    
    static ACTIVE       //
    
    // Non-static

    constructor(id, className) {        //Aufbau Construktor   
        // Header
        this.headerNode = header()      //Konstruktor erzeugt Inhalt aus header
        
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