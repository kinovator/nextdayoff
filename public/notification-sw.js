/**
 * Extra service-worker code injected into the generated Workbox worker via
 * `workbox.importScripts` in vite.config.js.
 *
 * Handles taps on holiday reminder notifications: bring an existing app window
 * back to the front when one is open, otherwise open a new one.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      const appClient = clientList.find(
        (client) => client.url && client.url.startsWith(self.location.origin)
      );

      if (appClient && 'focus' in appClient) {
        await appClient.focus();
        return;
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});
