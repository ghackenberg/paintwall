import { BASE } from 'paintwall-common'
import { USER_DATA } from '../constants/user'
import { append, div, form, h1, img, input } from '../functions/html'
import { BaseScreen } from './base'

export class CodeScreen extends BaseScreen {
    backNode: HTMLDivElement

    fromCodeNode: HTMLInputElement
    formSubmitNode: HTMLInputElement
    formNode: HTMLFormElement

    constructor() {
        super('code', 'document')

        this.backNode = div({ id: 'back', className: 'icon active',
            onclick: () => history.back(),
        }, img({ src:  BASE + '/images/back.png' }))

        this.fromCodeNode = input({ type: 'text', placeholder: 'Your code' })
        this.formSubmitNode = input({ type: 'submit', value: 'Get code' })
        this.formNode = form({
            onsubmit: event => {
                event.preventDefault()
                const code = this.fromCodeNode.value
                const request = new XMLHttpRequest()
                request.onreadystatechange = event => {
                    if (request.readyState == XMLHttpRequest.DONE) {
                        if (request.status == 200) {
                            const response = JSON.parse(request.responseText)
                            USER_DATA.jwtToken = response.jwtToken
                            USER_DATA.userId = response.userId
                            USER_DATA.userObject = response.userObject
                            localStorage.setItem('jwtToken', USER_DATA.jwtToken)
                            localStorage.setItem('userId', USER_DATA.userId)
                            localStorage.setItem('userObject', JSON.stringify(USER_DATA.userObject))
                            history.back()
                        } else {
                            alert('An unexpected error occurred. Please try again.')
                        }
                    }
                }
                request.open('DELETE', BASE + '/api/v1/token/' + USER_DATA.mailToken.tokenId + '?code=' + code)
                request.send()
            }
        }, this.fromCodeNode, this.formSubmitNode)

        append(this.mainNode, [
            this.backNode,
            h1('Authentication required'),
            div(this.formNode)
        ])
    }
}