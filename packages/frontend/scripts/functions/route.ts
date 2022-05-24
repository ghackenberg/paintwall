import { BASE } from 'paintwall-common'
import { USER_DATA } from '../constants/user'
import { BrowseScreen } from '../screens/browse'
import { CodeScreen } from '../screens/code'
import { DataScreen } from '../screens/data'
import { EmailScreen } from '../screens/email'
import { ErrorScreen } from '../screens/error'
import { ImprintScreen } from '../screens/imprint'
import { LoadScreen } from '../screens/load'
import { PaintScreen } from '../screens/paint'
import { ProfileScreen } from '../screens/profile'
import { TermsScreen } from '../screens/terms'

const loadScreen = new LoadScreen()
const errorScreen = new ErrorScreen()
const browseScreen = new BrowseScreen()
const paintScreen = new PaintScreen()
const emailScreen = new EmailScreen()
const codeScreen = new CodeScreen()
const profileScreen = new ProfileScreen()
const imprintScreen = new ImprintScreen()
const dataScreen = new DataScreen()
const termsScreen = new TermsScreen()

loadScreen.show()

export function route() {
    // Switch
    if (location.pathname.startsWith(BASE + '/canvas/')) {
        if (USER_DATA.token && USER_DATA.user && USER_DATA.user.name && USER_DATA.user.slogan) {
            paintScreen.show()
        } else if (USER_DATA.token) {
            profileScreen.show()
        } else if (USER_DATA.code) {
            codeScreen.show()
        } else {
            emailScreen.show()
        }
    } else if (location.pathname == BASE + '/imprint') {
        imprintScreen.show()
    } else if (location.pathname == BASE + '/data-protection') {
        dataScreen.show()
    } else if (location.pathname == BASE + '/terms-of-use') {
        termsScreen.show()
    } else if (location.pathname == BASE + '/') {
        browseScreen.show()
    } else {
        errorScreen.show()
    }
}