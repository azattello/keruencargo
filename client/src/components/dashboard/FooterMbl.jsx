import React, { useState } from "react";
import './css/Sidebar.css';
import './css/sidebarmobile.css';
import track from '../../assets/img/track2.png';
import list from '../../assets/img/list.png';
import users from '../../assets/img/users.png';
import truck from '../../assets/img/truck.png';
import lost from '../../assets/img/lost.png'
import apps from '../../assets/img/apps.png'

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../action/user";

const FooterMbl = ({ onNavItemClick }) => {
    const [selectedNavItem, setSelectedNavItem] = useState(sessionStorage.getItem('selectedNavItem') || "addTrack");
    const [mobileMenu, setMobileMenu] = useState(false);
    
    const role = localStorage.getItem('role')
    const name = useSelector(state => state.user.currentUser?.name);
    const phone = useSelector(state => state.user.currentUser?.phone);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const toggleSidebar = () => setMobileMenu(!mobileMenu);

    const handleNavItemClick = (navItem) => {
        setSelectedNavItem(navItem);
        onNavItemClick(navItem);
        setMobileMenu(!mobileMenu)
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
        setMobileMenu(false);
    };

    return (
        <div className="mainSidebar_mobile">
            <div id="sidebar" className={`sidebar-mobile ${mobileMenu ? 'open' : ''}`}>
                
                    {/* Мобильная карточка профиля скрывается (по задаче) */}
                <div className="navigation-admin">
                    
                    {/* СЕКЦИЯ: ТРАКИНГ */}
                    <div className="nav-section">
                        <h4 className="nav-section-title">📦 ТРЕКИНГ</h4>
                        <div className={`nav-link ${selectedNavItem === "addTrack" && "nav-active"}`} onClick={() => handleNavItemClick("addTrack")}>
                            <img src={track} alt="" className="nav-icon" />
                            <h5 className="nav-title">Добавить трек</h5>
                        </div>
                        <div className={`nav-link ${selectedNavItem === "addTrackToUser" && "nav-active"}`} onClick={() => handleNavItemClick("addTrackToUser")}>
                            <img src={track} alt="" className="nav-icon" />
                            <h5 className="nav-title">Добавить треку клиента</h5>
                        </div>
                        <div className={`nav-link ${selectedNavItem === "trackList" && "nav-active"}`} onClick={() => handleNavItemClick("trackList")}>
                            <img src={list} alt="" className="nav-icon" />
                            <h5 className="nav-title">Поиск по трекам</h5>
                        </div>
                        {/* <div className={`nav-link ${selectedNavItem === "Lost" && "nav-active"}`} onClick={() => handleNavItemClick("Lost")}>
                            <img src={lost} alt="" className="nav-icon" />
                            <h5 className="nav-title">Потеряшки</h5>
                        </div> */}
                    </div>

                    {/* СЕКЦИЯ: ПОЛЬЗОВАТЕЛИ */}
                    <div className="nav-section">
                        <h4 className="nav-section-title">👥 ПОЛЬЗОВАТЕЛИ</h4>
                        <div className={`nav-link ${selectedNavItem === "allUsers" && "nav-active"}`} onClick={() => handleNavItemClick("allUsers")}>
                            <img src={users} alt="" className="nav-icon" />
                            <h5 className="nav-title">Поиск по клиентам</h5>
                        </div>
                        <div className={`nav-link ${selectedNavItem === "sendInvoice" && "nav-active"}`} onClick={() => handleNavItemClick("sendInvoice")}>
                            <img src={apps} alt="" className="nav-icon" />
                            <h5 className="nav-title">Отправить счет</h5>
                        </div>
                        {/* {role === 'admin' && (
                            <div className={`nav-link ${selectedNavItem === "admins" && "nav-active"}`} onClick={() => handleNavItemClick("admins")}>
                                <img src={users} alt="" className="nav-icon" />
                                <h5 className="nav-title">Админы</h5>
                            </div>
                        )} */}
                    </div>

                    {/* СЕКЦИЯ: СИСТЕМА */}
                    <div className="nav-section">
                        <h4 className="nav-section-title">⚙️ СИСТЕМА</h4>
                        {role !== 'filial' && (
                            <div className={`nav-link ${selectedNavItem === "Announcements" && "nav-active"}`} onClick={() => handleNavItemClick("Announcements")}>
                                <img src={lost} alt="" className="nav-icon" />
                                <h5 className="nav-title">Объявления</h5>
                            </div>
                        )}
                        <div className={`nav-link ${selectedNavItem === "CourseManager" && "nav-active"}`} onClick={() => handleNavItemClick("CourseManager")}>
                            <img src={apps} alt="" className="nav-icon" />
                            <h5 className="nav-title">Курсы</h5>
                        </div>
                        <div className={`nav-link ${selectedNavItem === "sendings" && "nav-active"}`} onClick={() => handleNavItemClick("sendings")}>
                            <img src={apps} alt="" className="nav-icon" />
                            <h5 className="nav-title">Отправка</h5>
                        </div>
                        {/* глобальный счётчик ID убран из мобильного меню */}
                        <div className={`nav-link ${selectedNavItem === "myCargo" && "nav-active"}`} onClick={() => handleNavItemClick("myCargo")}>
                            <img src={truck} alt="" className="nav-icon" />
                            <h5 className="nav-title">Мой карго</h5>
                        </div>
                    </div>
                </div>

                {/* Кнопка выхода */}
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        🚪 Выйти из аккаунта
                    </button>
                </div>
            </div>

            <div className="footer-admin">
                <p>{name + '  ' + phone}</p>
                <div className="linkToSite" onClick={toggleSidebar}>меню</div>
            </div>
        </div>
    )
}

export default FooterMbl;