import { div } from "./html"

// Create unit
export const UNIT = div({ className: 'unit' })

export function trackUnit() {
    // Append unit
    document.body.appendChild(UNIT)
}