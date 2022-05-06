class ImprintScreen extends BaseScreen {
    constructor() {
        super('imprint')

        // Back node
        this.backNode = img({ id: 'back', className: 'back', src: base + '/images/back.png',
            onclick: () => history.back()
        })

        // Main node
        append(this.mainNode, [ this.backNode, h1('Imprint') ])
    }
}