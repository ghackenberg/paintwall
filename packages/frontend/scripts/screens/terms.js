class TermsScreen extends BaseScreen {
    constructor() {
        super('terms', 'document')

        // Back node
        this.backNode = img({ id: 'back', className: 'back', src: base + '/images/back.png',
            onclick: () => history.back()
        })

        // Main node
        append(this.mainNode, [
            this.backNode, h1('PaintWall - Terms of use'),
            div(
                p(em('Coming soon'))
            )
        ])
    }
}