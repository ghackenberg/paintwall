import { BASE } from 'paintwall-common'
import { USER_DATA } from '../constants/user'
import { append, div, form, h1, img, input, label } from '../functions/html'
import { BaseScreen } from './base'

export class ProfileScreen extends BaseScreen {
    backNode: HTMLDivElement

    formEmailNode: HTMLInputElement
    formNameNode: HTMLInputElement
    formSloganNode: HTMLInputElement
    formSubmitNode: HTMLInputElement
    formResetNode: HTMLInputElement
    formNode: HTMLFormElement

    constructor() {
        super('profile', 'document')

        this.backNode = div({ id: 'back', className: 'icon active',
            onclick: () => history.back(),
        }, img({ src:  BASE + '/images/back.png' }))

        this.formEmailNode = input({ type: 'text', required: true, placeholder: 'Your email', readOnly: true, disabled: true })
        this.formNameNode = input({ type: 'text', required: true, placeholder: 'Your name' })
        this.formSloganNode = input({ type: 'text', required: true, placeholder: 'Your slogan' })
        this.formSubmitNode = input({ type: 'submit', value: 'Save' })
        this.formResetNode = input({ type: 'reset', value: 'Sign out' })

        this.formNode = form({
            onsubmit: event => {
                event.preventDefault()
                const name = this.formNameNode.value
                const slogan = this.formSloganNode.value
                const request = new XMLHttpRequest()
                request.onreadystatechange = event => {
                    if (request.readyState == XMLHttpRequest.DONE) {
                        if (request.status == 200) {
                            const response = JSON.parse(request.responseText)
                            USER_DATA.user = response
                            localStorage.setItem('user', JSON.stringify(USER_DATA.user))
                            if (location.pathname == BASE + '/profile') {
                                history.back()
                            } else {
                                history.replaceState(null, undefined, location.href)
                            }
                        } else {
                            alert('An unexpected error occurred. Please try again.')
                        }
                    }
                }
                request.open('PUT', BASE + '/api/v1/user/' + USER_DATA.user.userId)
                request.setRequestHeader('Authorization', 'Bearer ' + USER_DATA.token)
                request.setRequestHeader('Content-Type', 'application/json')
                request.send(JSON.stringify({ ...USER_DATA.user, name, slogan }))
            },
            onreset: event => {
                event.preventDefault()
                
                USER_DATA.token = null
                USER_DATA.user = null
                
                localStorage.removeItem('token')
                localStorage.removeItem('user')

                if (location.pathname == BASE + '/profile') {
                    history.back()
                } else {
                    history.replaceState(null, undefined, location.href)
                }
            }
        }, [
            div(div(label('Email')), div(this.formEmailNode)),
            div(div(label('Name')), div(this.formNameNode)),
            div(div(label('Slogan')), div(this.formSloganNode)),
            div(div(), div(this.formSubmitNode, this.formResetNode))
        ])

        append(this.mainNode, [
            this.backNode,
            h1('Your profile'),
            div(this.formNode)
        ])
    }

    show() {
        super.show()

        if (USER_DATA.user) {
            this.formEmailNode.value = USER_DATA.user.email
            this.formNameNode.value = USER_DATA.user.name
            this.formSloganNode.value = USER_DATA.user.slogan
        } else {
            this.formEmailNode.value = null
            this.formNameNode.value = null
            this.formSloganNode.value = null
        }
    }
}