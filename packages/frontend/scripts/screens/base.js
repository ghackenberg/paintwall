// CLASSES

class BaseScreen {
    static ACTIVE
    constructor(id) {
        // Header
        this.headerNode = document.createElement('header')
        this.headerNode.textContent = 'Collaborative Paint PWA'
        // Main
        this.mainNode = document.createElement('main')
        // Footer
        this.footerNode = document.createElement('footer')
        this.footerNode.textContent = '© 2022 University of Applied Sciences Upper Austria, School of Engineering, CPA2IL'
        // Root
        this.rootNode = document.createElement('div')
        this.rootNode.id = id
        this.rootNode.className = 'screen'
        this.rootNode.appendChild(this.headerNode)
        this.rootNode.appendChild(this.mainNode)
        this.rootNode.appendChild(this.footerNode)
        // Body
        document.body.appendChild(this.rootNode)
    }
    show() {
        if (BaseScreen.ACTIVE) {
            BaseScreen.ACTIVE.rootNode.style.display = 'none'
        }
        BaseScreen.ACTIVE = this
        BaseScreen.ACTIVE.rootNode.style.display = 'block'
    }
}