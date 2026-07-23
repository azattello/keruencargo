import React from "react";
import './css/admin.css';
import Title from "./title";

const MainAdmin = ({ onNavItemClick }) => {
  
    const handleNavItemClick = (navItem) => {
        // Вызов функции с аргументом, если нужно
        onNavItemClick(navItem);
    };

    
  return (
    <div className="mainAdmin">
      <Title text="Админ панель"/>
      <div className="nav-blocks">
        {/* Добавляем обработчики событий для элементов навигации */}
        <div className="nav-block" onClick={() => handleNavItemClick("addTrack")}>Добавить трек номер</div>
        <div className="nav-block" onClick={() => handleNavItemClick("trackList")}>Список треков</div>
        <div className="nav-block" onClick={() => handleNavItemClick("Lost")}>Потеряшки</div>
        <div className="nav-block" onClick={() => handleNavItemClick("allUsers")}>Все пользователи</div>
        <div className="nav-block" onClick={() => handleNavItemClick("myCargo")}>Мой карго</div>
        <div className="nav-block" onClick={() => handleNavItemClick("statistics")}>Статистика</div>
        <div className="nav-block" onClick={() => handleNavItemClick("mailing")}>Рассылка</div>
      </div>
    </div>
  );
}

export default MainAdmin;
