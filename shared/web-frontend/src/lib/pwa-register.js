/**
 * HOPO SHOP INDIA — PWA Service Worker Registration & Lifecycle Controller
 */

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    const swUrl = `/sw.js?v=${Date.now()}`;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("[PWA] Service Worker registered with scope:", registration.scope);

        // Check for updates periodically
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) return;

          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log("[PWA] New content is available; please refresh.");
                window.dispatchEvent(
                  new CustomEvent("pwa-update-available", {
                    detail: { registration },
                  }),
                );
              } else {
                // Content cached for offline use
                console.log("[PWA] Content is cached for offline use.");
              }
            }
          });
        });
      })
      .catch((error) => {
        console.warn("[PWA] Service Worker registration failed:", error);
      });
  });
}

/**
 * Hook to request notification permissions
 */
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return { status: "unsupported" };
  }

  if (Notification.permission === "granted") {
    return { status: "granted" };
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return { status: permission };
  }

  return { status: "denied" };
}
