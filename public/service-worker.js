/**
 * @file public/service-worker.js
 * @description Service Worker minimal pour la PWA
 */

// Nom du cache
const CACHE_NAME = "mathmemo-cache-v1";

// Liste des ressources à mettre en cache immédiatement
const PRECACHE_RESOURCES = [
    "/",
    "/index.html",
    "/manifest.json",
    "/assets/sounds/success.mp3",
    "/assets/sounds/error.mp3",
];

// Installation du service worker
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => {
                console.log(
                    "Service Worker: Mise en cache des ressources essentielles"
                );
                return cache.addAll(PRECACHE_RESOURCES);
            })
            .then(() => self.skipWaiting()) // Force l'activation immédiate
    );
});

// Activation du service worker
self.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];

    // Nettoyage des anciens caches
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (!cacheWhitelist.includes(cacheName)) {
                            console.log(
                                "Service Worker: Suppression de l'ancien cache",
                                cacheName
                            );
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim()) // Prendre le contrôle immédiatement
    );
});

// Intercepte les requêtes réseau
self.addEventListener("fetch", (event) => {
    // Stratégie de cache : Stale-While-Revalidate
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Récupération depuis le cache si disponible
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    // Mise à jour du cache avec la nouvelle réponse
                    if (
                        networkResponse &&
                        networkResponse.status === 200 &&
                        networkResponse.type === "basic"
                    ) {
                        const clonedResponse = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clonedResponse);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // En cas d'échec réseau, essayer de servir du cache
                    console.log(
                        "Service Worker: Réseau indisponible, utilisation du cache"
                    );
                    return cachedResponse;
                });

            return cachedResponse || fetchPromise;
        })
    );
});

// Gestion des notifications push (à implémenter si nécessaire)
self.addEventListener("push", (event) => {
    if (event.data) {
        const data = event.data.json();

        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: "/icons/icon-192x192.png",
                badge: "/icons/badge-96x96.png",
                data: data.data,
            })
        );
    }
});

// Gestion du clic sur les notifications
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.notification.data && event.notification.data.url) {
        // eslint-disable-next-line no-undef
        event.waitUntil(clients.openWindow(event.notification.data.url));
    }
});
