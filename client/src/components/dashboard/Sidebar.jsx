import React, { useState } from "react";
import './css/Sidebar.css';
import { useTranslation } from 'react-i18next';

import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../action/user";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ onNavItemClick }) => {
  const [selectedNavItem, setSelectedNavItem] = useState(sessionStorage.getItem('selectedNavItem') || "addTrack");
  const role = localStorage.getItem('role');
  const name = useSelector(state => state.user.currentUser.name);
  const surname = useSelector(state => state.user.currentUser.surname);
  const phone = useSelector(state => state.user.currentUser.phone);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isChina = role === 'china';
  const navigate = useNavigate();

  const handleNavItemClick = (navItem) => {
    setSelectedNavItem(navItem);
    onNavItemClick(navItem);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div id="sidebar" className='sidebar'>
      <div className="navigation-admin">
        {isChina ? (
          <div className="nav-section">
            <h4 className="nav-section-title">📦 {t('warehouse.title')}</h4>
            <div className={`nav-link ${selectedNavItem === "addTrack" && "nav-active"}`} onClick={() => handleNavItemClick("addTrack")}>
              <h5 className="nav-title">{t('warehouse.trackerTitle')}</h5>
            </div>
          </div>
        ) : (
          <>
            <div className="nav-section">
              <h4 className="nav-section-title">📦 ТРЕКИНГ</h4>
              <div className={`nav-link ${selectedNavItem === "addTrack" && "nav-active"}`} onClick={() => handleNavItemClick("addTrack")}> 
                <h5 className="nav-title">{t('menu.addTrack') || 'Склад'}</h5>
              </div>
              <div className={`nav-link ${selectedNavItem === "trackList" && "nav-active"}`} onClick={() => handleNavItemClick("trackList")}>
                <h5 className="nav-title">Поиск по трекам</h5>
              </div>
              <div className={`nav-link ${selectedNavItem === "trackSearch" && "nav-active"}`} onClick={() => handleNavItemClick("trackSearch")}>
                <h5 className="nav-title">Точечный поиск трека</h5>
              </div>
              <div className={`nav-link ${selectedNavItem === "addTrackToUser" && "nav-active"}`} onClick={() => handleNavItemClick("addTrackToUser")}> 
                <h5 className="nav-title">Добавить трек клиенту</h5>
              </div>
            </div>

            <div className="nav-section">
              <h4 className="nav-section-title">👥 ПОЛЬЗОВАТЕЛИ</h4>
              <div className={`nav-link ${selectedNavItem === "allUsers" && "nav-active"}`} onClick={() => handleNavItemClick("allUsers")}> 
                <h5 className="nav-title">Поиск по клиентам</h5>
              </div>
              <div className={`nav-link ${selectedNavItem === "sendInvoice" && "nav-active"}`} onClick={() => handleNavItemClick("sendInvoice")}> 
                <h5 className="nav-title">Отправить счет</h5>
              </div>
            </div>

            <div className="nav-section">
              <h4 className="nav-section-title">⚙️ СИСТЕМА</h4>
              {role !== 'filial' && (
                <div className={`nav-link ${selectedNavItem === "Announcements" && "nav-active"}`} onClick={() => handleNavItemClick("Announcements")}>
                  <h5 className="nav-title">Объявления</h5>
                </div>
              )}
              <div className={`nav-link ${selectedNavItem === "myCargo" && "nav-active"}`} onClick={() => handleNavItemClick("myCargo")}>
                <h5 className="nav-title">Мой карго</h5>
              </div>
            </div>
          </>
        )}

        <div className="admin-profile">
          <div className="profile-info">
            <p className="profile-name">{name} {surname}</p>
            <p className="profile-phone">{phone}</p>
            <button className="logout-btn" onClick={handleLogout}>{t('menu.logout') || 'Выйти'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
