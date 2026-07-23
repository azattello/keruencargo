import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import config from '../config';
import { showToast } from './Toast';
import Tab from './Tab';
import './styles/notification.css';

const Notification = () => {
  const currentUser = useSelector(state => state.user.currentUser);
  const userId = currentUser?.id;

  const [activeTab, setActiveTab] = useState('parcels');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const markAllAsRead = useCallback(async () => {
    if (!userId || unreadCount === 0) return;
    try {
      await axios.patch(
        `${config.apiUrl}/api/notification/${userId}/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Ошибка при отметке всех как прочитанные:', error);
    }
  }, [userId, unreadCount]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${config.apiUrl}/api/notification/${userId}?type=${activeTab}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Ошибка при получении уведомлений:', error);
      showToast('Ошибка при получении уведомлений', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab]);

  useEffect(() => {
    fetchNotifications();
  }, [userId, activeTab, fetchNotifications]);

  // Отмечаем все как прочитанные когда пользователь на странице уведомлений
  useEffect(() => {
    if (userId && notifications.length > 0) {
      const timer = setTimeout(() => {
        markAllAsRead();
      }, 500); // Небольшая задержка чтобы уведомления успели отобразиться
      return () => clearTimeout(timer);
    }
  }, [userId, notifications, markAllAsRead]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${config.apiUrl}/api/notification/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Ошибка при отметке как прочитанное:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `${config.apiUrl}/api/notification/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      showToast('Уведомление удалено', 'success');
    } catch (error) {
      console.error('Ошибка при удалении уведомления:', error);
      showToast('Ошибка при удалении', 'error');
    }
  };

  const getTabLabel = (tab) => {
    const labels = {
      parcels: 'Посылки',
      invoices: 'Счета',
      announcements: 'Объявления'
    };
    return labels[tab] || tab;
  };

  const getTabIcon = (tab) => {
    const icons = {
      parcels: '📦',
      invoices: '📄',
      announcements: '📢'
    };
    return icons[tab] || '📌';
  };

  return (
    <div className="main">
      <header className="header-main">
        <h1 className="text-header">Уведомления</h1>
      </header>

      {/* Табы */}
      <div className="notification-tabs">
        {['parcels', 'invoices', 'announcements'].map(tab => (
          <button
            key={tab}
            className={`notification-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {getTabIcon(tab)} {getTabLabel(tab)}
          </button>
        ))}
      </div>

      {/* Содержимое */}
      <div className="notification-content">
        {loading && <div className="loading">Загрузка уведомлений...</div>}

        {!loading && notifications.length === 0 && (
          <div className="empty-notifications">
            <p>Нет уведомлений</p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="notifications-list">
            {notifications.map(notification => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                <div className="notification-body">
                  {notification.title && (
                    <h3 className="notification-title">{notification.title}</h3>
                  )}
                  <p className="notification-message">{notification.message}</p>

                  {/* Данные для посылок */}
                  {activeTab === 'parcels' && notification.data?.trackNumber && (
                    <div className="notification-data">
                      <span className="track-number">
                        Трек: {notification.data.trackNumber}
                      </span>
                      {notification.data.status && (
                        <span className="status-badge">{notification.data.status}</span>
                      )}
                    </div>
                  )}

                  {/* Данные для счетов */}
                  {activeTab === 'invoices' && (
                    <div className="notification-data">
                      {notification.data?.amount && (
                        <span className="amount">
                          Сумма: {notification.data.amount} ₸
                        </span>
                      )}
                      {notification.data?.weight && (
                        <span className="weight">
                          Вес: {notification.data.weight} кг
                        </span>
                      )}
                    </div>
                  )}

                  {/* Данные для объявлений */}
                  {activeTab === 'announcements' && notification.data?.image && (
                    <div className="notification-image">
                      <img src={notification.data.image} alt="Объявление" />
                    </div>
                  )}
                </div>

                <div className="notification-footer">
                  <span className="notification-date">
                    {new Date(notification.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                  <span className={`read-indicator ${notification.isRead ? 'read' : 'unread'}`}>
                    {notification.isRead ? '✓ Прочитано' : '● Новое'}
                  </span>
                  <button
                    className="btn-delete-notification"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="area"></div>
      <Tab className="TabMain" notificationCount={unreadCount} />
    </div>
  );
};

export default Notification;