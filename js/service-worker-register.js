/**
 * Service Worker Registration and Management
 * Enables offline support and background caching
 */

const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('[ServiceWorker] Not supported in this browser');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[ServiceWorker] Registration successful:', registration);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute

    // Handle new service worker
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[ServiceWorker] New version available');
          // Notify user about update
          showUpdateNotification();
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('[ServiceWorker] Registration failed:', error);
  }
};

const showUpdateNotification = () => {
  // Create a simple notification that app has updates
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #0066cc;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-size: 14px;
    display: flex;
    gap: 12px;
    align-items: center;
  `;
  notification.innerHTML = `
    <span>Atualização disponível</span>
    <button onclick="location.reload()" style="
      background: white;
      color: #0066cc;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
    ">Recarregar</button>
  `;
  document.body.appendChild(notification);

  // Auto-remove after 10 seconds
  setTimeout(() => notification.remove(), 10000);
};

// Unregister old service workers
const cleanupOldWorkers = async () => {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    registrations.forEach(reg => {
      reg.unregister();
    });
  } catch (error) {
    console.error('[ServiceWorker] Cleanup error:', error);
  }
};

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', registerServiceWorker);
} else {
  registerServiceWorker();
}

// Message communication with service worker
const sendMessageToServiceWorker = (message) => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
};

window.serviceWorkerReady = registerServiceWorker();
