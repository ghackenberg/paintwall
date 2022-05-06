class DataScreen extends BaseScreen {
    constructor() {
        super('data', 'document')

        // Back node
        this.backNode = img({ id: 'back', className: 'back', src: base + '/images/back.png',
            onclick: () => history.back()
        })

        // Main node
        append(this.mainNode, [
            this.backNode, h1('PaintWall - Data protection'),
            div(
                p(em('Coming soon'))
            )
        ])
    }
}