function element(tagname) {
    // Extract arguments
    const argOne = arguments.length > 1 ? arguments[1] : undefined
    const argTwo = arguments.length > 2 ? arguments[2] : undefined

    const hasMap = typeof argOne == 'object' && !(argOne instanceof Array) && !(argOne instanceof HTMLElement)
    const hasArray = (hasMap ? argTwo : argOne) instanceof Array

    // Parse arguments
    const attributes = hasMap ? argOne : {}
    const children = hasMap ? (hasArray ? argTwo : [...arguments].splice(2)) : (hasArray ? argOne : [...arguments].splice(1))

    // Create element
    const result = document.createElement(tagname)

    // Set attributes
    set(result, attributes)

    // Append children
    append(result, children)

    // Return element
    return result
}

function set(parent, attributes) {
    for (const [name, value] of Object.entries(attributes)) {
        switch (name) {
            case 'style': {
                for (const [propName, propValue] of Object.entries(value)) {
                    parent[name][propName] = propValue
                }
                break
            }
            default:
                parent[name] = value
        }
    }
}

function append(parent, children) {
    for (const child of children) {
        switch (typeof child) {
            case 'number': {
                parent.appendChild(document.createTextNode(child))
                break
            }
            case 'string': {
                parent.appendChild(document.createTextNode(child))
                break
            }
            case 'object': {
                parent.appendChild(child)
                break
            }
        }
    }
}

function clear(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
}

function define(tagname) {
    return function() {
        return element.apply(null, [tagname, ...arguments])
    }
}

const header = define('header')
const main = define('main')
const footer = define('footer')
const nav = define('nav')
const aside = define('aside')
const article = define('article')
const section = define('section')
const div = define('div')

const h1 = define('h1')
const h2 = define('h2')
const h3 = define('h3')
const h4 = define('h4')
const h5 = define('h5')
const h6 = define('h6')

const p = define('p')

const ol = define('ol')
const ul = define('ul')
const li = define('li')

const table = define('table')
const caption = define('caption')
const thead = define('thead')
const tbody = define('tbody')
const tfoot = define('tfoot')
const tr = define('tr')
const th = define('th')
const td = define('td')

const em = define('em')
const strong = define('strong')
const mark = define('mark')
const span = define('span')
const a = define('a')

const img = define('img')
const canvas = define('canvas')

const form = define('form')
const fieldset = define('fieldset')
const label = define('label')
const input = define('input')
const select = define('select')
const option = define('option')
const textarea = define('textarea')
const button = define('button')