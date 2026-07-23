import React from 'react';
import { useSelector } from 'react-redux';
import './styles/manager-card.css';

export default function ManagerCard() {
  const user = useSelector(state => state.user.currentUser);

  const managerInfo = {
    name: 'Арман Жалпоков',
    title: 'Senior Logistics Manager',
    phone: '+7 702 778 17 34',
    email: 'Araika_ukg90@mail.ru',
    whatsapp: '+7 702 778 17 34',
    availability: 'Доступен 09:00 - 18:00 (МСК)',
    avatar: '👤',
  };

  const accountInfo = [
    {
      label: 'Статус клиента',
      value: user?.level || 'Bronze',
      icon: '⭐'
    },
    {
      label: 'Бонусные баллы',
      value: user?.bonuses || 0,
      icon: '🎁'
    },
    {
      label: 'Общие затраты',
      value: `$${user?.totalEarned ? (user.totalEarned * 0.2).toFixed(2) : '0.00'}`,
      icon: '💰'
    },
    {
      label: 'Рефералы',
      value: user?.referredUsers || 0,
      icon: '👥'
    },
  ];

  return (
    <div className="manager-info-block">
      {/* Manager Card */}
      <div className="manager-card-container">
        <div className="manager-card">
          <div className="manager-card-header">
            <div className="manager-avatar-circle">{managerInfo.avatar}</div>
            <div className="manager-info">
              <h3 className="manager-name">{managerInfo.name}</h3>
              <p className="manager-title">{managerInfo.title}</p>
              <p className="manager-availability">🟢 {managerInfo.availability}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="account-info-container">
        <h4>Информация аккаунта</h4>
        <div className="account-info-grid">
          {accountInfo.map((item, idx) => (
            <div key={idx} className="account-info-item">
              <div className="info-label">{item.label}</div>
              <div className="info-value">{item.icon} {item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
