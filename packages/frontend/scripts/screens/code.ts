import { BASE } from 'paintwall-common'
import { USER_DATA } from '../constants/user'
import { append, div, form, h1, img, input } from '../functions/html'
import { BaseScreen } from './base'

export class CodeScreen extends BaseScreen {
    backNode: HTMLDivElement

    fromSecretNode: HTMLInputElement
    formSubmitNode: HTMLInputElement
    formNode: HTMLFormElement

    constructor() {
        super('code', 'document')

        this.backNode = div({ id: 'back', className: 'icon active',
            onclick: () => history.back(),
        }, img({ src:  BASE + '/images/back.png' }))

        this.fromSecretNode = input({ type: 'text', placeholder: 'Your code' })
        this.formSubmitNode = input({ type: 'submit', value: 'Get code' })
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
            }
        }, this.fromSecretNode, this.formSubmitNode)

        append(this.mainNode, [
            this.backNode,
            h1('Authentication required (2 / 2)'),
            div(this.formNode)
        ])
    }

    hide() {
        USER_DATA.code = null
    }
}