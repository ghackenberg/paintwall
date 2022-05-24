import { BASE } from 'paintwall-common'
import { USER_DATA } from '../constants/user'
import { append, div, form, h1, img, input, label, p } from '../functions/html'
import { BaseScreen } from './base'

export class EmailScreen extends BaseScreen {
    backNode: HTMLDivElement

    fromEmailNode: HTMLInputElement
    formSubmitNode: HTMLInputElement
    formResetNode: HTMLInputElement
    formNode: HTMLFormElement

    constructor() {
        super('email', 'document')

        this.backNode = div({ id: 'back', className: 'icon active',
            onclick: () => history.back(),
        }, img({ src:  BASE + '/images/back.png' }))

        this.fromEmailNode = input({ type: 'email', required: true, placeholder: 'your@email.com' })
        this.formSubmitNode = input({ type: 'submit', value: 'Get code' })
        this.formResetNode = input({ type: 'reset', value: 'Skip' })
        this.formNode = form({
            onsubmit: event => {
                event.preventDefault()
                const email = this.fromEmailNode.value
                const request = new XMLHttpRequest()
                request.onreadystatechange = event => {
                    if (request.readyState == XMLHttpRequest.DONE) {
                        if (request.status == 200) {
                            USER_DATA.code = JSON.parse(request.responseText)
                            history.replaceState(null, undefined, location.href)
                        } else {
                            alert('An unexpected error occurred. Please try again.')
                        }
                    }
                }
                request.open('POST', BASE + '/api/v1/code/')
                request.setRequestHeader('Content-Type', 'application/json')
                request.send(JSON.stringify({ email }))
            },
            onreset: event => {
                event.preventDefault()
                USER_DATA.skip = true
                history.replaceState(null, undefined, location.href)
            }
        }, [
            div(div(label('Email')), div(this.fromEmailNode)),
            div(div(), div(this.formSubmitNode, this.formResetNode))
        ])

        append(this.mainNode, [
            this.backNode,
            h1('PaintWall sign-in (1 / 2)'),
            div(this.formNode)
        ])
    }

    show() {
        super.show()

        this.fromEmailNode.value = null
    }
}