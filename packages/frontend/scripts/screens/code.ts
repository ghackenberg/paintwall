import { BASE } from 'paintwall-common'
import { USER_DATA } from '../constants/user'
import { append, div, form, h1, img, input, label, p } from '../functions/html'
import { BaseScreen } from './base'

export class CodeScreen extends BaseScreen {
    backNode: HTMLDivElement

    formEmailNode: HTMLInputElement
    fromSecretNode: HTMLInputElement
    formSubmitNode: HTMLInputElement
    formResetNode: HTMLInputElement
    formNode: HTMLFormElement

    constructor() {
        super('code', 'document')

        this.backNode = div({ id: 'back', className: 'icon active',
            onclick: () => history.back(),
        }, img({ src:  BASE + '/images/back.png' }))

        this.formEmailNode = input({ type: 'text', required: true, placeholder: 'Your email', readOnly: true, disabled: true })
        this.fromSecretNode = input({ type: 'text', required: true, placeholder: 'Your code' })
        this.formSubmitNode = input({ type: 'submit', value: 'Sign in' })
        this.formResetNode = input({ type: 'reset', value: 'Skip' })
        this.formNode = form({
            onsubmit: event => {
                event.preventDefault()
                const secret = this.fromSecretNode.value
                const request = new XMLHttpRequest()
                request.onreadystatechange = event => {
                    if (request.readyState == XMLHttpRequest.DONE) {
                        if (request.status == 200) {
                            const response = JSON.parse(request.responseText)
                            USER_DATA.code = null
                            USER_DATA.token = response.token
                            USER_DATA.user = response.user
                            localStorage.setItem('token', USER_DATA.token)
                            localStorage.setItem('user', JSON.stringify(USER_DATA.user))
                            history.replaceState(null, undefined, location.href)
                        } else {
                            alert('An unexpected error occurred. Please try again.')
                        }
                    }
                }
                request.open('DELETE', BASE + '/api/v1/code/' + USER_DATA.code.codeId + '?secret=' + secret)
                request.send()
            },
            onreset: event => {
                event.preventDefault()
                USER_DATA.skip = true
                history.replaceState(null, undefined, location.href)
            }
        }, [
            div(div(label('Email')), div(this.formEmailNode)),
            div(div(label('Code')), div(this.fromSecretNode)),
            div(div(), div(this.formSubmitNode, this.formResetNode))
        ])

        append(this.mainNode, [
            this.backNode,
            h1('PaintWall sign-in (2 / 2)'),
            div(this.formNode)
        ])
    }

    show() {
        super.show()

        this.formEmailNode.value = USER_DATA.code.email
        this.fromSecretNode.value = null
    }

    hide() {
        super.hide()

        USER_DATA.code = null
    }
}