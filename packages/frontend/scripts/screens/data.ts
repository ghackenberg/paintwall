import { BASE } from 'paintwall-common'
import { a, append, div, em, h1, h2, h3, img, li, p, ul } from '../functions/html'
import { BaseScreen } from './base'

export class DataScreen extends BaseScreen {
    backNode: HTMLDivElement

    constructor() {
        super('data', 'document')

        this.backNode = div({ id: 'back', className: 'icon active',
            onclick: () => history.back(),
        }, img({ src:  BASE + '/images/back.png' }))

        append(this.mainNode, [
            this.backNode,
            h1('PaintWall - Data protection'),
            div(
                p(em('Last updated: May 12, 2022')),

                h2('Cookies Policy'),
                p(
                    'This Cookies Policy explains what Cookies are and how We use them. You should read this policy so You can understand what type of cookies We use, or the information We collect using Cookies and how that information is used. This Cookies Policy has been created with the help of ',
                    a({ href: 'https://www.privacypolicies.com/cookies-policy-generator/' }, 'https://www.privacypolicies.com/cookies-policy-generator/')
                ),
                p('Cookies do not typically contain any information that personally identifies a user, but personal information that we store about You may be linked to the information stored in and obtained from Cookies. For further information on how We use, store and keep your personal data secure, see our Privacy Policy.'),
                p('We do not store sensitive personal information, such as mailing addresses, account passwords, etc. in the Cookies We use.'),

                h2('Interpretation and Definitions'),

                h3('Interpretation'),
                p('The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.'),

                h3('Definitions'),
                p('For the purposes of this Cookies Policy:'),
                ul(
                    li(
                        p('Company referred to as either "the Company", "We", "Us" or "Our" in this Cookies Policy) refers to Paintwall.')
                    ),
                    li(
                        p('Cookies means small files that are placed on Your computer, mobile device or any other device by a website, containing details of your browsing history on that website among its many uses.')
                    ),
                    li(
                        p('Website refers to Paintwall, accessible from Paintwall.at')
                    ),
                    li(
                        p('You means the individual accessing or using the Website, or a company, or any legal entity on behalf of which such individual is accessing or using the Website, as applicable.')
                    ),
                ),

                h2('The use of the Cookies'),

                h3('Type of Cookies We Use'),
                p('Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close your web browser.'),
                p('We use both session and persistent Cookies for the purposes set out below:'),
                ul(
                    li(
                        p('Necessary / Essential Cookie:'),
                        p('Type: Session Cookies'),
                        p('Administered by: Us'),
                        p('Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.')
                    ),
                    li(
                        p('Functionality Cookies:'),
                        p('Type: Persistent Cookies'),
                        p('Administered by: Us'),
                        p('Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter your preferences every time You use the Website.'),
                    )
                ),

                h3('Your Choices Regarding Cookies'),
                p('If You prefer to avoid the use of Cookies on the Website, first You must disable the use of Cookies in your browser and then delete the Cookies saved in your browser associated with this website. You may use this option for preventing the use of Cookies at any time.'),
                p('If You do not accept Our Cookies, You may experience some inconvenience in your use of the Website and some features may not function properly.'),
                p('If You like to delete Cookies or instruct your web browser to delete or refuse Cookies, please visit the help pages of your web browser.'),
                ul(
                    li(
                        p(
                            'For the Chrome web browser, please visit this page from Google: ',
                            a({ href: 'https://support.google.com/accounts/answer/32050' }, 'https://support.google.com/accounts/answer/32050')
                        )
                    ),
                    li(
                        p(
                            'For the Internet Explorer web browser, please visit this page from Microsoft: ',
                            a({ href: 'http://support.microsoft.com/kb/278835' }, 'http://support.microsoft.com/kb/278835')
                        )
                    ),
                    li(
                        p(
                            'For the Firefox web browser, please visit this page from Mozilla: ',
                            a({ href: 'https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored' }, 'https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored')
                        )
                    ),
                    li(
                        p(
                            'For the Safari web browser, please visit this page from Apple: ',
                            a({ href: 'https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac' }, 'https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac')
                        )
                    )
                ),
                p('For any other web browser, please visit your web browsers official web pages.'),

                h3('More Information about Cookies'),
                p(
                    'You can learn more about cookies: ',
                    a({ href: 'https://www.privacypolicies.com/blog/cookies/' }, 'https://www.privacypolicies.com/blog/cookies/')
                ),

                h3('Contact Us'),
                p('If you have any questions about this Cookies Policy, You can contact us:'),
                ul(
                    li(
                        p(
                            'By email: ',
                            a({ href: 'mailto:georg.hackenberg@fh-wels.at' }, 'georg.hackenberg@fh-wels.at')
                        )
                    )
                )
            )
        ])
    }
}