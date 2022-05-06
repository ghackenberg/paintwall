function element(tagname) {
    // Extract arguments
    const argOne = arguments.length > 1 ? arguments[1] : undefined
    const argTwo = arguments.length > 2 ? arguments[2] : undefined

    // Parse arguments
    const attributes = (typeof argOne == 'object' && !Array.isArray(argOne)) ? argOne : {}
    const children = Array.isArray(argOne) ? argOne : (Array.isArray(argTwo) ? argTwo : [])

    // Create element
    const result = document.createElement(tagname)

    // Set attributes
    for (const [name, value] of Object.entries(attributes)) {
        switch (name) {
            case 'style': {
                for (const [propName, propValue] of Object.entries(value)) {
                    result[name][propName] = propValue
                }
                break
            }
            default:
                result[name] = value
        }
    }

    // Append children
    for (const child of children) {
        switch (typeof child) {
            case 'string': {
                result.appendChild(document.createTextNode(child))
                break
            }
            case 'object': {
                result.appendChild(child)
                break
            }
        }
    }

    // Return element
    return result
}

function define(tagname) {
    return function() {
        return element.apply(null, [tagname, ...arguments])
    }
}

const header = define('header')
const main = define('main')
const footer = define('footer')
const div = define('div')
const span = define('span')
const a = define('a')
const img = define('img')
const canvas = define('canvas')
const input = define('input')
const button = define('button')