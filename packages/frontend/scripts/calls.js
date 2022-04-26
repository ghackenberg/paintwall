// GLOBAL CALLS

// Service workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./scripts/services.js', { scope: './' })
}

// Window event listeners
window.addEventListener('load', handleLoad)
window.addEventListener('resize', handleResize)
window.addEventListener('hashchange', handleHashChange)

// Canvas event listeners
canvas.addEventListener('mousedown', handleMouseDown)
canvas.addEventListener('mousemove', handleMouseMove)
canvas.addEventListener('mouseover', handleMouseOver)
canvas.addEventListener('mouseout', handleMouseOut)
canvas.addEventListener('touchstart', handleTouchStart)
canvas.addEventListener('touchmove', handleTouchMove)
canvas.addEventListener('touchend', handleTouchEnd)

// Input event listeners
input.addEventListener('change', handleChange)