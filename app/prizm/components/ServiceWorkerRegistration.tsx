'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/prizm/sw.js')
          .then((registration) => {
            console.log('[SW] Registration successful:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content available
                    console.log('[SW] New content available, refresh to update');
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.log('[SW] Registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
