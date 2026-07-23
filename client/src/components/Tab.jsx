import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation  } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import config from '../config';
import './styles/tab.css';
import house from '../assets/icons/home-outline.svg';
import house2 from '../assets/icons/home.svg';

import box from '../assets/icons/layers-outline.svg';
import box2 from '../assets/icons/layers.svg';

import notifications from '../assets/icons/notifications-outline.svg';
import notifications2 from '../assets/icons/notifications.svg';

import user from '../assets/icons/person-circle-outline.svg';
import user2 from '../assets/icons/person-circle.svg';

import { useTranslation } from "react-i18next";
import i18n from '../i18n';

const Tab = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const role = localStorage.getItem('role');

    React.useEffect(() => {
        if (role === 'china') {
            i18n.changeLanguage('cn');
        } else {
            i18n.changeLanguage('ru');
        }
    }, [role]);
    const currentUser = useSelector(state => state.user.currentUser);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        if (!currentUser?.id) return;
        try {
            const res = await axios.get(
                `${config.apiUrl}/api/notification/${currentUser.id}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            setUnreadCount(res.data.unreadCount || 0);
        } catch (error) {
            console.error('Ошибка при получении количества уведомлений:', error);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        fetchUnreadCount();
        // Обновляем счетчик каждые 30 секунд
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    return (
      
        <div className="Tab">
            <Link to="/main" className="tabbutton">
                <img className="icons-svg" src={location.pathname === '/main' ? house2 : house} alt="" />
                <p style={location.pathname === '/main' ? { color: '#2D7020' } : { color: '#808080' } }>{t('home.title')}</p>
            </Link>
            
            <Link to="/parcels" className="tabbutton" >
                <img className="icons-svg" src={location.pathname === '/parcels' ? box2 : box}  alt="" />
                <p style={location.pathname === '/parcels' ? { color: '#2D7020' } : { color: '#808080' } }>{t('menu.parcels')}</p>
            </Link>

            <Link to="/notification" className="tabbutton notification-button" >
                <div className="notification-icon-wrapper">
                    <img className="icons-svg" src={location.pathname === '/notification' ? notifications2 : notifications}  alt="" />
                    {unreadCount > 0 && (
                        <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                </div>
                <p style={location.pathname === '/notification' ? { color: '#2D7020' } : { color: '#808080' } }>Уведомление</p>
            </Link>

            {/* <Link to="/notification" className="tabbutton" >
                <img src={location.pathname === '/notification' ? bell2 : bell} alt="" />
                <p>Уведомление</p>
            </Link> */}

            <Link to="/profile" className="tabbutton" >
                <img className="icons-svg" src={location.pathname === '/profile' ? user2 : user}  alt="" />
                <p style={location.pathname === '/profile' ? { color: '#2D7020' } : { color: '#808080' } }>{t('menu.profile')}</p>
            </Link>
            
        </div>

    )
}

export default Tab;