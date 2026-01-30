// ============================================
// ALCOHOL TRACKER - SERVICE WORKER
// ============================================

const CACHE_NAME = 'alcohol-tracker-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/stats.html',
    '/settings.html',
    '/styles.css',
    '/app.js',
    '/stats.js',
    '/settings-page.js',
    '/config.js',
    '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Push notification event (for daily reminders)
self.addEventListener('push', event => {
    const options = {
        body: 'How many drinks did you have yesterday?',
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/'
        },
        actions: [
            { action: 'open', title: 'Log Drinks' },
            { action: 'close', title: 'Later' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Alcohol Tracker', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});
