const version = '0.0.1'

const files = [
    '../index.html',
    '../manifest.json',
    '../images/icon.png',
    '../styles/main.css',
    '../scripts/functions/data.js',
    '../scripts/functions/draw.js',
    '../scripts/functions/event.js',
    '../scripts/functions/socket.js',
    '../scripts/constants.js',
    '../scripts/variables.js',
    '../scripts/calls.js'
]

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(version).then(cache => cache.addAll(files)))
})