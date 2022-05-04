// CONSTANTS

const version = '0.0.1'

const base = '/paintwall'

const files = [
    '/',
    '/manifest.json',
    '/images/icon-any-128.png',
    '/images/icon-any-192.png',
    '/images/icon-any-512.png',
    '/images/icon-mask-128.png',
    '/images/icon-mask-192.png',
    '/images/icon-mask-512.png',
    '/images/icon-mono-128.png',
    '/images/icon-mono-192.png',
    '/images/icon-mono-512.png',
    '/images/load.png',
    '/images/back.png',
    '/styles/main.css',
    '/styles/screens/base.css',
    '/styles/screens/load.css',
    '/styles/screens/error.css',
    '/styles/screens/browse.css',
    '/styles/screens/paint.css',
    '/scripts/main.js',
    '/scripts/dependencies/auth0.js',
    '/scripts/dependencies/qrcode.js',
    '/scripts/functions/route.js',
    '/scripts/functions/history.js',
    '/scripts/functions/socket.js',
    '/scripts/functions/draw.js',
    '/scripts/models/canvas.js',
    '/scripts/models/client.js',
    '/scripts/models/line.js',
    '/scripts/screens/base.js',
    '/scripts/screens/load.js',
    '/scripts/screens/error.js',
    '/scripts/screens/browse.js',
    '/scripts/screens/paint.js'
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
    return caches.open(version).then(cache => cache.addAll(files.map(file => base + file)))
}

// EXECUTIONS

// Event listeners

self.addEventListener('install', (event) => {
    event.waitUntil(cleanUp().then(setUp))
})
self.addEventListener('fetch', function(event) {
    if (event.request.url.startsWith('https')) {
        event.respondWith(fetch(event.request))
    } else if (event.request.url.includes(base + '/api/')) {
        event.respondWith(fetch(event.request))
    } else if (event.request.url.includes(base + '/images/')) {
        event.respondWith(caches.match(event.request))
    } else if (event.request.url.includes(base + '/styles/')) {
        event.respondWith(caches.match(event.request))
    } else if (event.request.url.includes(base + '/scripts/')) {
        event.respondWith(caches.match(event.request))
    } else if (event.request.url.includes(base + '/manifest.json')) {
        event.respondWith(caches.match(event.request))
    } else {
        event.respondWith(caches.match(base + '/'))
    }
})