import { BASE } from 'paintwall-common'
import { BrowseScreen } from '../screens/browse'
import { DataScreen } from '../screens/data'
import { ErrorScreen } from '../screens/error'
import { ImprintScreen } from '../screens/imprint'
import { LoadScreen } from '../screens/load'
import { PaintScreen } from '../screens/paint'
import { TermsScreen } from '../screens/terms'

const loadScreen = new LoadScreen()
const errorScreen = new ErrorScreen()
const browseScreen = new BrowseScreen()
const paintScreen = new PaintScreen()
const imprintScreen = new ImprintScreen()
const dataScreen = new DataScreen()
const termsScreen = new TermsScreen()

loadScreen.show()

export function route() {
    // Switch
    if (location.pathname.startsWith(BASE + '/canvas/')) {
        paintScreen.show()
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