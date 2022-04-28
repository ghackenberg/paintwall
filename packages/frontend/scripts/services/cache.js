// CONSTANTS

const version = '0.0.1'

const files = [
    '../../',
    '../../manifest.json',
    '../../images/icon.png',
    '../../images/icon-192.png',
    '../../images/icon-512.png',
    '../../styles/main.css',
    '../../styles/screens/base.css',
    '../../styles/screens/browse.css',
    '../../styles/screens/paint.css',
    '../../scripts/main.js',
    '../../scripts/dependencies/qrcode.js',
    '../../scripts/functions/draw.js',
    '../../scripts/models/canvas.js',
    '../../scripts/models/client.js',
    '../../scripts/models/line.js',
    '../../scripts/screens/base.js',
    '../../scripts/screens/browse.js',
    '../../scripts/screens/paint.js'
]

// FUNCTIONS

// Clean up

function cleanUp() {
    return caches.keys().then(deleteCaches)
}
function deleteCaches(keys) {
    return Promise.all(keys.map(deleteCache))
}
function deleteCache(key) {
    return caches.delete(key)
}

// Set up

function setUp() {
    return caches.open(version).then(cache => cache.addAll(files))
}

// EXECUTIONS

// Event listeners

self.addEventListener('install', (event) => {
    event.waitUntil(cleanUp().then(setUp))
})
self.addEventListener('fetch', function(event) {
    if (event.request.url.startsWith('https')) {
        event.respondWith(fetch(event.request))
    } else if (event.request.url.includes('/api/')) {
        event.respondWith(fetch(event.request))
    } else {
        event.respondWith(caches.match(event.request))
    }
})