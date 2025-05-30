// Service Worker for Push Notifications and Offline Support

const CACHE_NAME = "fitstep-v1"
const urlsToCache = [
  "/",
  "/competition",
  "/leaderboard",
  "/profile",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Push event - show notifications
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New notification from FitStep",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View",
        icon: "/icon-192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icon-192.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("FitStep", options))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    // Open the app
    event.waitUntil(clients.openWindow("/"))
  }
})

// Background sync for offline data
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Sync offline data when connection is restored
  try {
    const cache = await caches.open("offline-data")
    const requests = await cache.keys()

    for (const request of requests) {
      const response = await cache.match(request)
      if (response) {
        const data = await response.json()
        // Send data to server
        await fetch("/api/sync/offline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
        // Remove from cache after successful sync
        await cache.delete(request)
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error)
  }
}
