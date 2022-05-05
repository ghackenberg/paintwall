class LoadScreen extends BaseScreen {
    constructor() {
        super('load')
        
        // Image node
        this.imageNode = document.createElement('img')
        this.imageNode.id = 'image'
        this.imageNode.className = 'load'
        this.imageNode.src = base + '/images/load.png'

        // Main node
        this.mainNode.appendChild(this.imageNode)
    }
    show() {
        super.show()
    }
    hide() {
        super.hide()
    }
}