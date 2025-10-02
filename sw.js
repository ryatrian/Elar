// Import IndexedDB helper functions
self.importScripts('/utils/db.js');

// Define a cache name
const CACHE_NAME = 'random-text-picker-v2';

// List of files to cache
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/components/ActionButton.tsx',
  '/components/ConfirmResetModal.tsx',
  '/components/FileInput.tsx',
  '/components/Icons.tsx',
  '/components/AutoSendModal.tsx',
  '/components/Switch.tsx',
  '/utils/db.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700&display=swap'
];

// Install event: opens a cache and adds the files to it
self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Fetch event: serves assets from cache if available, otherwise fetches from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request).catch(() => {
            // Offline fallback can be added here if needed
        });
      }
    )
  );
});

// Activate event: cleans up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients immediately
  );
});

// Listen for messages from the main app to show a notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { text, scheduleId } = event.data.payload;
    const options = {
      body: text,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      actions: [
        { action: 'send', title: 'ارسال در واتساپ' }
      ],
      data: {
        text: text,
        scheduleId: scheduleId
      },
      tag: `schedule-${scheduleId}`
    };
    event.waitUntil(
      self.registration.showNotification('زمان ارسال پیام!', options)
    );
  }
});


// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  const { notification } = event;
  const { text, scheduleId } = notification.data;
  
  notification.close();

  if (event.action === 'send') {
    event.waitUntil(
      Promise.all([
        // 1. Open WhatsApp window
        clients.openWindow(`https://wa.me/?text=${encodeURIComponent(text)}`),
        
        // 2. Update the state in IndexedDB
        self.DB.getAppState().then(state => {
          if (state) {
            // Remove the sent text from availableTexts
            const newAvailableTexts = state.availableTexts.filter(t => t !== text);
            // If the currentText was the one sent, clear it
            const newCurrentText = state.currentText === text ? null : state.currentText;

            const newState = {
              ...state,
              availableTexts: newAvailableTexts,
              currentText: newCurrentText
            };
            return self.DB.saveAppState(newState);
          }
        }),

        // 3. Delete the schedule from IndexedDB
        self.DB.deleteSchedule(scheduleId)
      ]).catch(err => {
        console.error('Error handling notification click:', err);
      })
    );
  }
});
