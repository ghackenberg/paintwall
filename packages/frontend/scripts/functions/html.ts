function set<T extends HTMLElement, S>(parent: T, attributes: Partial<T>) {
    for (const [name, value] of Object.entries(attributes)) {
        switch (name) {
            case 'style': {
                for (const [propName, propValue] of Object.entries(value)) {
                    (<any> parent)[name][propName] = propValue
                }
                break
            }
            default:
                (<any> parent)[name] = value
        }
    }
}

export function prepend<T extends HTMLElement>(parent: T, children: (string | number | Node)[]) {
    for (const child of children) {
        if (parent.firstChild) {
            parent.insertBefore(convert(child), parent.firstChild)
        } else {
            parent.appendChild(convert(child))
        }
    }
}

export function append<T extends HTMLElement>(parent: T, children: (string | number | Node)[]) {
    for (const child of children) {
        parent.appendChild(convert(child))
    }
}

function convert(data: string | number | Node) {
    switch (typeof data) {
        case 'number': {
            return document.createTextNode(`${data}`)
        }
        case 'string': {
            return document.createTextNode(data)
        }
        case 'object': {
            return data
        }
    }
}

export function remove(parent: Node, children: Node[]) {
    for (const child of children) {
        parent.removeChild(child)
    }
}

export function clear(parent: Node) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
}

function define<T>(tagname: string) {

    function element(): T
    function element(attributes: Partial<T>): T
    function element(children: (string | number | Node)[]): T
    function element(...children: (string | number | Node)[]): T
    function element(attributes: Partial<T>, children: (string | number | Node)[]): T
    function element(attributes: Partial<T>, ...children: (string | number | Node)[]): T

    function element() {
        // Convert arguments
        const array = []
        for (var index = 0; index < arguments.length; index++) {
            array[index] = arguments[index]
        }

        // Extract arguments
        const argOne = arguments.length > 0 ? arguments[0] : undefined
        const argTwo = arguments.length > 1 ? arguments[1] : undefined

        const hasMap = typeof argOne == 'object' && !(argOne instanceof Array) && !(argOne instanceof HTMLElement)
        const hasArray = (hasMap ? argTwo : argOne) instanceof Array

        // Parse arguments
        const attributes = hasMap ? argOne : {}
        const children = hasMap ? (hasArray ? argTwo : array.splice(1)) : (hasArray ? argOne : array.splice(0))

        // Create element
        const result = document.createElement(tagname)

        // Set attributes
        set(result, attributes)

        // Append children
        append(result, children)

        // Return element
        return <T> (<any> result)
    }

    return element

}

export const header = define<HTMLElement>('header')
export const main = define<HTMLElement>('main')
export const footer = define<HTMLElement>('footer')
export const nav = define<HTMLElement>('nav')
export const aside = define<HTMLElement>('aside')
export const article = define<HTMLElement>('article')
export const section = define<HTMLElement>('section')
export const div = define<HTMLDivElement>('div')

export const h1 = define<HTMLHeadingElement>('h1')
export const h2 = define<HTMLHeadingElement>('h2')
export const h3 = define<HTMLHeadingElement>('h3')
export const h4 = define<HTMLHeadingElement>('h4')
export const h5 = define<HTMLHeadingElement>('h5')
export const h6 = define<HTMLHeadingElement>('h6')

export const p = define<HTMLParagraphElement>('p')

export const ol = define<HTMLOListElement>('ol')
export const ul = define<HTMLUListElement>('ul')
export const li = define<HTMLLIElement>('li')

export const table = define<HTMLTableElement>('table')
export const caption = define<HTMLTableCaptionElement>('caption')
export const thead = define<HTMLTableSectionElement>('thead')
export const tbody = define<HTMLTableSectionElement>('tbody')
export const tfoot = define<HTMLTableSectionElement>('tfoot')
export const tr = define<HTMLTableRowElement>('tr')
export const th = define<HTMLTableCellElement>('th')
export const td = define<HTMLTableCellElement>('td')

export const em = define<HTMLSpanElement>('em')
export const strong = define<HTMLSpanElement>('strong')
export const mark = define<HTMLSpanElement>('mark')
export const span = define<HTMLSpanElement>('span')
export const a = define<HTMLAnchorElement>('a')

export const img = define<HTMLImageElement>('img')
export const canvas = define<HTMLCanvasElement>('canvas')

export const form = define<HTMLFormElement>('form')
export const fieldset = define<HTMLFieldSetElement>('fieldset')
export const label = define<HTMLLabelElement>('label')
export const input = define<HTMLInputElement>('input')
export const select = define<HTMLSelectElement>('select')
export const option = define<HTMLOptionElement>('option')
export const textarea = define<HTMLTextAreaElement>('textarea')
export const button = define<HTMLButtonElement>('button')