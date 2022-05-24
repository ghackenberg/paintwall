import { BASE } from 'paintwall-common'
import { USER_DATA } from '../constants/user'
import { append, div, form, h1, img, input } from '../functions/html'
import { BaseScreen } from './base'

export class ProfileScreen extends BaseScreen {
    backNode: HTMLDivElement

    fromNameNode: HTMLInputElement
    fromSloganNode: HTMLInputElement
    formSubmitNode: HTMLInputElement
    formNode: HTMLFormElement

    constructor() {
        super('profile', 'document')

        this.backNode = div({ id: 'back', className: 'icon active',
            onclick: () => history.back(),
        }, img({ src:  BASE + '/images/back.png' }))

        this.fromNameNode = input({ type: 'text', placeholder: 'Your name' })
        this.fromSloganNode = input({ type: 'text', placeholder: 'Your slogan' })
        this.formSubmitNode = input({ type: 'submit', value: 'Save profile' })
        this.formNode = form({
            onsubmit: event => {
                event.preventDefault()
                const name = this.fromNameNode.value
                const slogan = this.fromSloganNode.value
                const request = new XMLHttpRequest()
                request.onreadystatechange = event => {
                    if (request.readyState == XMLHttpRequest.DONE) {
                        if (request.status == 200) {
                            const response = JSON.parse(request.responseText)
                            USER_DATA.user = response
                            localStorage.setItem('user', JSON.stringify(USER_DATA.user))
                            history.replaceState(null, undefined, location.href)
                        } else {
                            alert('An unexpected error occurred. Please try again.')
                        }
                    }
                }
                request.open('PUT', BASE + '/api/v1/user/' + USER_DATA.user.userId)
                request.setRequestHeader('Authorization', 'Bearer ' + USER_DATA.token)
                request.setRequestHeader('Content-Type', 'application/json')
                request.send(JSON.stringify({ ...USER_DATA.user, name, slogan }))
            }
        }, this.fromNameNode, this.fromSloganNode, this.formSubmitNode)

        append(this.mainNode, [
            this.backNode,
            h1('Profile required'),
            div(this.formNode)
        ])
    }
}