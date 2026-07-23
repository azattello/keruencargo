// Service Worker для web push уведомлений
self.addEventListener('push', event => {
  console.log('🔔 Push notification received:', event);
  
  let title = '291cargo';
  let body = 'Новое уведомление';
  let icon = '/icons/notification-icon.png';
  let badge = '/icons/notification-badge.png';
  let notificationData = {};
  let requireInteraction = false;

  // Если data содержит JSON
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('📦 Parsed push data:', data);
      
      title = data.title || '291cargo';
      body = data.body || data.message || 'Новое уведомление';
      icon = data.image || data.icon || '/icons/notification-icon.png';
      badge = data.badge || '/icons/notification-badge.png';
      requireInteraction = data.requireInteraction || (data.data?.priority === 'high');
      notificationData = data.data || data;
    } catch (e) {
      console.log('⚠️ Could not parse push data as JSON, using text');
      try {
        body = event.data.text();
      } catch (e2) {
        console.log('⚠️ Could not get push data text');
      }
    }
  }

  const options = {
    body,
    icon,
    badge,
    tag: 'notification',
    requireInteraction,
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      ...notificationData
    }
  };

  console.log('📣 Showing notification:', { title, options });
  
  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      console.log('✅ Notification shown successfully');
    }).catch(err => {
      console.error('❌ Failed to show notification:', err);
    })
  );
});

self.addEventListener('notificationclick', event => {
  console.log('👆 Notification clicked:', event);
  event.notification.close();

  // Открываем приложение или переходим на нужную страницу
  const urlToOpen = event.notification.data?.type === 'invoice' 
    ? '/notification?tab=invoices' 
    : '/notification';

  console.log('🔗 Opening URL:', urlToOpen);

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      console.log(`📊 Found ${clientList.length} client windows`);
      
      // Проверяем, открыто ли уже окно с нашим приложением
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        console.log(`  Client ${i}: ${client.url}`);
        
        if (client.url.includes(urlToOpen) || client.url.includes('/notification')) {
          console.log(`  → Focusing existing client`);
          return client.focus();
        }
      }
      
      // Если не открыто, открываем новое окно
      console.log(`  → No matching client, opening new window`);
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', event => {
  console.log('❌ Notification closed by user:', event);
});
