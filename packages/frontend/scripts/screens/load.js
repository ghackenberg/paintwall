class LoadScreen extends BaseScreen {
    constructor() {
        super('load')
        
        // Image node
        this.imageNode = img({ id: 'image', className: 'load', src: base + '/images/load.png' })

        // Main node
        this.mainNode.appendChild(this.imageNode)
    }
}