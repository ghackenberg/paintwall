import { BASE } from 'paintwall-common'
import { append, div, em, h1, h2, h3, img, p, span } from '../functions/html'
import { BaseScreen } from './base'

export class ImprintScreen extends BaseScreen {
    backNode: HTMLDivElement

    constructor() {
        super('imprint', 'document')

        this.backNode = div({ id: 'back', className: 'icon active',
            onclick: () => history.back(),
        }, img({ src:  BASE + '/images/back.png' }))

        append(this.mainNode, [
            this.backNode,
            h1('PaintWall - Imprint'),
            div(
                p(em('Last updated: May 12, 2022')),

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

    show() {
        this.scrollTop = 0
        this.scrollLeft = 0
        
        super.show()
    }
}