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
canvasNode.addEventListener('mousedown', handleMouseDown)
canvasNode.addEventListener('mousemove', handleMouseMove)
canvasNode.addEventListener('mouseover', handleMouseOver)
canvasNode.addEventListener('mouseout', handleMouseOut)
canvasNode.addEventListener('touchstart', handleTouchStart)
canvasNode.addEventListener('touchmove', handleTouchMove)
canvasNode.addEventListener('touchend', handleTouchEnd)

// Input event listeners
colorNode.addEventListener('change', handleChange)