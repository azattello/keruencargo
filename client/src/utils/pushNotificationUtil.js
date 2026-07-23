// Утилита для Web Push уведомлений
import config from '../config';

export const pushNotificationUtil = {
  // Проверить поддержку Web Push
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  },

  // Запросить разрешение на уведомления
  async requestPermission() {
    if (!this.isSupported()) {
      console.warn('Push notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Push notifications denied by user');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  // Зарегистрировать Service Worker и подписать на push
  async registerServiceWorker() {
    if (!this.isSupported()) {
      console.warn('🚫 Service Workers not supported');
      return;
    }

    try {
      console.log('📝 Регистрация Service Worker...');
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      console.log('✅ Service Worker registered:', registration);

      // Получить подписку на push
      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        console.log('📌 Already subscribed to push');
        
        // Если уже подписан, но нет в localStorage, сохраняем
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (userId && token && !subscription.endpoint.includes('test')) {
          await this.savePushSubscription(userId, subscription);
        }
        return subscription;
      }

      // Если разрешение есть, подписываем пользователя
      if (Notification.permission === 'granted') {
        console.log('🔔 Creating new push subscription...');
        subscription = await this.subscribeToPush(registration);
        
        // Сохраняем подписку на сервер
        if (subscription) {
          const userId = localStorage.getItem('userId');
          const token = localStorage.getItem('token');
          if (userId && token) {
            await this.savePushSubscription(userId, subscription);
          } else {
            console.warn(`⚠️ Cannot save subscription: userId=${!!userId}, token=${!!token}`);
          }
        }
        
        return subscription;
      } else {
        console.log('⚠️ Notification permission not granted');
      }
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  },

  // Подписать пользователя на push
  async subscribeToPush(registration) {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(config.vapidPublicKey || '')
      });
      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      return null;
    }
  },

  // Отправить subscription на сервер для сохранения
  async savePushSubscription(userId, subscription) {
    try {
      const token = localStorage.getItem('token');
      console.log(`💾 Сохранение push подписки для userId: ${userId}, token: ${token ? 'OK' : 'MISSING'}`);
      
      const response = await fetch(`${config.apiUrl}/api/notification/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON()
        })
      });
      
      if (!response.ok) {
        console.error(`❌ Ошибка сохранения подписки: ${response.status} ${response.statusText}`);
        const error = await response.json();
        console.error('Детали ошибки:', error);
        return;
      }
      
      console.log('✅ Push subscription saved to server');
    } catch (error) {
      console.error('❌ Failed to save push subscription:', error);
    }
  },

  // Отписать пользователя от push
  async unsubscribeFromPush(userId) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        console.log('Unsubscribed from push');

        // Удалить с сервера
        await fetch(`${config.apiUrl}/api/notification/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userId })
        });
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push:', error);
    }
  },

  // Преобразовать VAPID ключ
  urlBase64ToUint8Array(base64String) {
    if (!base64String) return new Uint8Array();
    
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
};
