class ImprintScreen extends BaseScreen {
    constructor() {
        super('imprint', 'document')

        // Back node
        this.backNode = img({ id: 'back', className: 'back', src: base + '/images/back.png',
            onclick: () => history.back()
        })

        // Main node
        append(this.mainNode, [
            this.backNode, h1('PaintWall - Imprint'), div(
                h2('Contact information'),
                h3('Person'),
                p(
                    span('Dr. Georg Hackenberg'),
                    span('Professor for Industrial Informatics')
                ),
                h3('Affiliation'),
                p(
                    span('School of Engineering'),
                    span('University of Applied Sciences Upper Austria')
                ),
                h3('Address'),
                p(
                    span('Stelzhamerstr. 9'),
                    span('4600 Wels'),
                    span('Austria')
                )
            )
        ])
    }
}