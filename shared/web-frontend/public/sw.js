/**
 * HOPO SHOP INDIA — Progressive Web App Service Worker
 * Provides offline navigation, asset caching, stale-while-revalidate strategy, and push notification hooks.
 */

const CACHE_VERSION = "hopo-shop-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.png",
  "/logo.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// 1. Install Event: Pre-cache App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("[SW] Pre-cache error:", err);
      }),
  );
});

// 2. Activate Event: Clean up outdated caches
self.addEventListener("activate", (event) => {
  const currentCaches = [STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log("[SW] Removing old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// 3. Fetch Event: Intelligent multi-tier caching
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET and chrome-extension requests
  if (request.method !== "GET" || url.protocol.startsWith("chrome-extension")) {
    return;
  }

  // A. API Requests: Network-first, do not aggressively cache dynamic customer data
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: "You are currently offline. Please check your internet connection.",
            offline: true,
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 503,
          },
        );
      }),
    );
    return;
  }

  // B. Images: Cache-first with network fallback
  if (
    request.destination === "image" ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/i)
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Optional background refresh
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                  cache.put(request, networkResponse.clone());
                }
              })
              .catch(() => {});
            return cachedResponse;
          }

          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Return fallback image if needed
              return (
                caches.match("/icons/icon-192x192.png") ||
                new Response("", { status: 404, statusText: "Offline Image Not Found" })
              );
            });
        }),
      ),
    );
    return;
  }

  // C. HTML Navigation Requests (SPA Route support)
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match("/index.html") || caches.match("/");
          });
        }),
    );
    return;
  }

  // D. Static Assets (JS, CSS, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) =>
      cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      }),
    ),
  );
});

// 4. Message Listener: Support instant update trigger from UI
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// 5. Push Notification Handler
self.addEventListener("push", (event) => {
  let data = {
    title: "HOPO SHOP INDIA",
    body: "Exclusive bridal collections & offers are now live!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    url: "/home",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/home",
    },
    actions: [
      { action: "explore", title: "View Collection" },
      { action: "close", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 6. Notification Click Action
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/home";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});
