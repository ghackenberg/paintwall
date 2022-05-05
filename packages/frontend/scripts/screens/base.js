// CLASSES

class BaseScreen {
    // Static
    
    static ACTIVE
    
    // Non-static

    constructor(id) {
        // Text
        this.logoNode = document.createElement('span')
        this.logoNode.id = 'logo'
        this.logoNode.textContent = "PaintWall"
        
        // Header
        this.headerNode = document.createElement('header')
        this.headerNode.appendChild(this.logoNode)
        
        // Main
        this.mainNode = document.createElement('main')

        // Data
        this.dataNode = document.createElement('a')
        this.dataNode.id = 'data'
        this.dataNode.textContent = 'Data protection'
        this.dataNode.onclick = function() {
            history.pushState(null, undefined, base + '/data-protection')
        }

        // Terms
        this.termsNode = document.createElement('a')
        this.termsNode.id = 'terms'
        this.termsNode.textContent = 'Terms of use'
        this.termsNode.onclick = function() {
            history.pushState(null, undefined, base + '/terms-of-use')
        }

        // Footer
        this.footerNode = document.createElement('footer')
        this.footerNode.appendChild(this.dataNode)
        this.footerNode.appendChild(this.termsNode)

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