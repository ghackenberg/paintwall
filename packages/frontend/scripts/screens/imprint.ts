import { BASE } from 'paintwall-common'
import { append, div, em, h1, h2, h3, img, p, span } from '../functions/html'
import { BaseScreen } from './base'

export class ImprintScreen extends BaseScreen {
    constructor() {
        super('imprint', 'document')

        append(this.mainNode, [
            img({ id: 'back', className: 'back', src: BASE + '/images/back.png',
                onclick: () => history.back()
            }),
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
}