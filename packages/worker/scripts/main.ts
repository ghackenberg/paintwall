import { BASE } from 'paintwall-common'

// CONSTANTS

const version = '0.0.1'

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
    '/images/circle.png',
    '/images/square.png',
    '/images/line.png',
    '/images/share.png',
    '/images/close.png',
    '/styles/main.css',
    '/styles/screens/base.css',
    '/styles/screens/load.css',
    '/styles/screens/error.css',
    '/styles/screens/browse.css',
    '/styles/screens/paint.css',
    '/styles/screens/imprint.css',
    '/styles/screens/data.css',
    '/styles/screens/terms.css',
    '/scripts/main.js'
]

// FUNCTIONS

// Clean up

function cleanUp() {
    return caches.keys().then(deleteCaches)
}
function deleteCaches(keys: string[]) {
    return Promise.all(keys.map(deleteCache))
}
function deleteCache(key: string) {
    return caches.delete(key)
}

// Set up

function setUp() {
    return caches.open(version).then(cache => cache.addAll(files.map(file => BASE + file)))
}

// EXECUTIONS

// Event listeners

self.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(cleanUp().then(setUp))
})
self.addEventListener('fetch', (event: FetchEvent) => {
    if (event.request.url.startsWith('https')) {
        event.respondWith(fetch(event.request))
    } else if (event.request.url.includes(BASE + '/api/')) {
        event.respondWith(fetch(event.request))
    } else if (event.request.url.includes(BASE + '/.well-known/')) {
        event.respondWith(fetch(event.request))
    } else if (event.request.url.includes(BASE + '/images/')) {
        event.respondWith(caches.match(event.request))
    } else if (event.request.url.includes(BASE + '/styles/')) {
        event.respondWith(caches.match(event.request))
    } else if (event.request.url.includes(BASE + '/scripts/')) {
        event.respondWith(caches.match(event.request))
    } else if (event.request.url.includes(BASE + '/manifest.json')) {
        event.respondWith(caches.match(event.request))
    } else {
        event.respondWith(caches.match(BASE + '/'))
    }
})