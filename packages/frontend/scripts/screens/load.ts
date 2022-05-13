import { BASE } from 'paintwall-common'
import { img } from '../functions/html'
import { BaseScreen } from './base'

export class LoadScreen extends BaseScreen {
    constructor() {
        super('load')
        
        this.mainNode.appendChild(
            img({ id: 'image', className: 'load', src: BASE + '/images/load.png' })
        )
    }
}