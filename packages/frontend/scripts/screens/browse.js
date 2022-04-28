// CLASSES

class BrowseScreen extends BaseScreen {
    constructor() {
        super('browse')
        // Button
        this.buttonNode = document.createElement('button')
        this.buttonNode.textContent = 'New painting'
        this.buttonNode.onclick = function() {
            location.hash = '#paint/' + Math.random().toString(16).substring(2)
        }
        // Main
        this.mainNode.appendChild(this.buttonNode)
    }
    show() {
        super.show()
    }
    hide() {
        super.hide()
    }
}