import { BASE } from 'paintwall-common'
import { USER_DATA } from '../constants/user'
import { append, div, form, h1, img, input, p } from '../functions/html'
import { BaseScreen } from './base'

export class EmailScreen extends BaseScreen {
    backNode: HTMLDivElement

    fromEmailNode: HTMLInputElement
    formSubmitNode: HTMLInputElement
    formNode: HTMLFormElement

    constructor() {
        super('email', 'document')

        this.backNode = div({ id: 'back', className: 'icon active',
            onclick: () => history.back(),
        }, img({ src:  BASE + '/images/back.png' }))

        this.fromEmailNode = input({ type: 'email', placeholder: 'your@email.com' })
        this.formSubmitNode = input({ type: 'submit', value: 'Get code' })
        this.formNode = form({
            onsubmit: event => {
                event.preventDefault()
                const email = this.fromEmailNode.value
                const request = new XMLHttpRequest()
                request.onreadystatechange = event => {
                    if (request.readyState == XMLHttpRequest.DONE) {
                        if (request.status == 200) {
                            USER_DATA.mailToken = JSON.parse(request.responseText)
                            history.replaceState(null, undefined, BASE + '/code')
                        } else {
                            alert('An unexpected error occurred. Please try again.')
                        }
                    }
                }
                request.open('POST', BASE + '/api/v1/token/')
                request.setRequestHeader('Content-Type', 'application/json')
                request.send(JSON.stringify({ email }))
            }
        }, this.fromEmailNode, this.formSubmitNode)

        append(this.mainNode, [
            this.backNode,
            h1('Authentication required'),
            div(this.formNode)
        ])
    }
}