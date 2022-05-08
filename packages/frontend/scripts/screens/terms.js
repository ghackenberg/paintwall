class TermsScreen extends BaseScreen {  
    constructor() { 
        super('terms', 'document')

        // Back node
        this.backNode = img({ id: 'back', className: 'back', src: base + '/images/back.png',
            onclick: () => history.back()
        })

        // Main node
        append(this.mainNode, [
            this.backNode, h1('PaintWall - Terms of use'),
            div(
                p("Last updated: Mai 7, 2022"),
                h1('Welcome to Paintwall!'),
                h2('Introduction'),
                p('Thank you for using the our platform and the products, services and features we make available to you as part of the platform (collectively, the “Service”).'),
                h2('Our Service'),
                p('The Service allows you to discover, watch and share pictures.'),
                h2('Your Service Provider'),
                p('The entity providing the Service in Austria is FH-Wels, located at Stelzhamerstraße 23, 4600 Wels.'),
                h1('Who may use the Service?'),
                h2('Businesses'),
                p('If you are using the Service on behalf of a company or organisation, you confirm to us that you have authority to act on behalf of that entity, and that entity accepts this Agreement.'),
                h1('Your Use of the Service'),
                h2('Content on the Service'),
                p('The content on the Service includes  graphics, photos and text.'),
                h2('Permissions and Restrictions'),
                p('You may access and use the Service as made available to you, as long as you comply with this Agreement and the law. You may view or listen to Content for your personal, non-commercial use.'),
                p('The following restrictions apply to your use of the Service. You are not allowed to:'),
                ul(
                    li('access, reproduce, download, distribute, transmit, broadcast, display, sell, license, alter, modify or otherwise use any part of the Service or any Content except: (a) as specifically permitted by the Service; (b) with prior written permission from us and, if applicable, the respective rights holders; or (c) as permitted by applicable law;'),
                    li('circumvent, disable, fraudulently engage, or otherwise interfere with the Service (or attempt to do any of these things), including security-related features or features that: (a) prevent or restrict the copying or other use of Content; or (b) limit the use of the Service or Content;'),
                    li('access the Service using any automated means (such as robots, botnets or scrapers) '),
                    li('collect or use any information that might identify a person (for example, harvesting usernames or faces), unless permitted by that person or allowed under section 3 above;'),
                    li('use the Service to distribute unsolicited promotional or commercial content or other unwanted or mass solicitations (spam);'),
                    li('cause or encourage any inaccurate measurements of genuine user engagement with the Service.'),
                    li('misuse any reporting, flagging, complaint, dispute, or appeals process, including by making groundless, vexatious, or frivolous submissions;'),
                    li('run contests on or through the Service'),
                    li('use the Service to view or listen to Content other than for personal, non-commercial use (for example, you may not publicly screen videos or stream music from the Service);'),
                    li('use the Service to: (a) sell any advertising, sponsorships, or promotions placed on, around, or within the Service or Content.')
                ),
                h2('Reservation'),
                p('Any right not expressly granted to you in this Agreement remains the right of Paintwall or the respective rights holders. This means, for example, that using the Service does not give you ownership of any intellectual property rights in the Content you access (including any branding used on or displayed in the Service).'),
                h2('Develop, Improve and Update the Service'),
                p('Paintwall is constantly changing and improving the Service. As part of this continual evolution, we may make modifications or changes (to all or part of the Service) such as adding or removing features and functionalities, offering new digital content or services or discontinuing old ones.'),
                h2('Uploading Content'),
                p('If you have a Paintwall channel, you may be able to upload Content to the Service. You may use your Content to promote your business or artistic enterprise. If you choose to upload Content, you must not submit to the Service any Content that does not comply with this Agreement or the law. For example, the Content you submit must not include third-party intellectual property (such as copyrighted material) unless you have permission from that party or are otherwise legally entitled to do so. You are legally responsible for the Content you submit to the Service. We may use automated systems that analyze your Content to help detect infringement and abuse, such as spam, malware, and illegal content.'),
                h2('Rights you Grant'),
                p('You retain all of your ownership rights for your Content. In short, what belongs to you stays yours. However, we do require you to grant certain rights to Paintwall and other users of the Service, as described below.'),
                h2('Licence to Other Users'),
                p('You also grant each other user of the Service a worldwide, non-exclusive, royalty-free licence to access your Content through the Service, and to use that Content (including to reproduce, distribute, modify, display, and perform it) only as enabled by a feature of the Service.'),
                h2('Removing your Content'),
                p('You have to get in contact with with our service team.'),
                h2('Removal of Content By Paintwall'),
                p('If we reasonably believe that any of your Content (1) is in breach of this Agreement or (2) may cause harm to Paintwall, our users, or third parties, we reserve the right to remove or take down some or all of such Content. We will notify you with the reason for our action unless we reasonably believe that to do so: (a) would violate the law or the direction of a legal enforcement authority, or would otherwise risk legal liability for Paintwall or our Affiliates; (b) would compromise an investigation or the integrity or operation of the Service; or (c) would cause harm to any user, other third party, Paintwall or our Affiliates.'),
                h1('Community Guidelines Strikes'),
                p('Paintwall operates a system of “strikes” in respect of Content that violates the Community Guideline. Each strike comes with varying restrictions and may result in the permanent removal of your content.'),
                h2('Copyright Protection'),
                p('If you believe your copyright has been infringed on the Service, please get in contact with our service team.'),
                h1('Account Suspension and Termination'),
                h2('Terminations by You'),
                p('You can stop using the Service at any time.'),
                h2('Effect of Account Suspension or Termination'),
                p('If your account is terminated or your access to the Service is restricted, you may continue using certain aspects of the Service (such as viewing only) without an account, and this Agreement will continue to apply to such use.'),
                h1('About Software in our Service'),
                h1('Other Legal Terms'),
                h2('Warranty'),
                p('We provide the Service with reasonable care and skill.'),
                h2('Disclaimer'),
                p('By law, consumers have certain rights that cannot be excluded or altered by a contract. Nothing in this Agreement affects those rights you may have as a consumer. Other than as expressly stated in this Agreement or as required by law, Paintwall does not make any specific promises about the Service. For example, we don’t make any promises about: the Content provided through the Service, the specific features of the Service, or its accuracy, reliability, availability, or ability to meet your needs; or that any Content you submit will be accessible or stored on the Service.'),
                h2('Limitation of Liability'),
                p('All users: Nothing in this Agreement is intended to exclude or limit any party’s liability for: death or personal injury; fraud; fraudulent misrepresentation; or any liability that cannot be excluded or limited by law.'),
                p('To the extent permitted by applicable law, Paintwall and its Affiliates will not be responsible for:'),
                ul(
                    li('losses that were not caused by Paintwall or its Affiliates’ breach of this Agreement;'),
                    li('any loss or damage that was not, at the time that this Agreement was formed between you and Paintwall, a reasonably foreseeable consequence of Paintwall or its Affiliates breaching this Agreement; or'),
                    li('the Content submitted by any user, or for the defamatory, offensive, or illegal conduct of any user.'), 
                ),
                p('Business Users only: If you are using the Service for the purpose of your trade, business, craft or profession, (a “Business User”), to the extent permitted by applicable law, the following limitations of liability will also apply:'),
                ul(
                    li('Paintwall and its Affiliates will not be responsible for lost profits, revenues, or data; loss of opportunity or anticipated savings; indirect or consequential losses, or punitive damages (in all cases whether such losses were foreseeable or not); and'),
                    li('Paintwall and its Affiliates total liability for any claims arising from or relating to the Service is limited to the greater of: (a) the amount of revenue that Paintwall has paid to you from your use of the Service in the 12 months before the date of your notice, in writing to Paintwall, of the claim and (b) £500, whichever is higher.'),
                ),
                h2('Third-Party Links'),
                p('The Service may contain links to third-party websites and online services that are not owned or controlled by Paintwall. Paintwall has no control over, and assumes no responsibility for, such websites and online services. Be aware when you leave the Service; we suggest you read the terms and privacy policy of each third-party website and online service that you visit.'),
                h1('About this Agreement'),
                h2('Changing this Agreement'),
                p('We may change this Agreement, for example, to reflect changes to our Service or how we do business - for example, when we add new products or features or remove old ones, (2) for legal, regulatory, or security reasons or (3) to prevent abuse or harm.'),
                p('If we materially change this Agreement, we’ll provide you with reasonable advance notice and the opportunity to review the changes, except (1) when we launch a new product or feature, or (2) in urgent situations, such as preventing ongoing abuse or responding to legal requirements. If you don’t agree to the new terms, you should remove any Content you uploaded and stop using the Service.'),
                h2('Continuation of this Agreement'),
                p('If your use of the Service ends, the following terms of this Agreement will continue to apply to you: “Other Legal Terms”, “About This Agreement”, and the licenses granted by you will continue in limited cases as described under “Duration of License”.'),
                h2('Severance'),
                p('If it turns out that a particular term of this Agreement is not enforceable for any reason, this will not affect any other terms.'),
                h2('Assignment'),
                p('Paintwall may transfer all or part of this Agreement to an Affiliate or, if Paintwall is sold, to a third party.'),
                h2('No Waiver'),
                p('If you do not comply with this Agreement and we do not take action immediately, this doesn’t mean that we are giving up any rights that we may have (such as the right to take action in the future).')
            )
        ])
    }
}