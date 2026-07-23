import React, { useState } from "react";
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import i18n from '../../i18n';

import Sidebar from "./Sidebar";
import AddTrack from "./AddTrack";
import TrackList from "./TrackList";
import AllUsers from "./AllUsers";
import Statistics from "./Statistics";
import MyCargo from "./MyCargo";
import Lost from "./Lost";
import PartnerProgramAdmin from "./PartnerProgramAdmin";
import FooterMbl from "./FooterMbl";
import AnnouncementManager from "../AnnouncementManager";
import GlobalIdCounterStatus from "./GlobalIdCounterStatus";
import AddTrackToClient from "./AddTrackToClient";
import SendInvoice from "./SendInvoice";
import TrackSearch from "./TrackSearch";
import AdminsList from "./AdminsList";

const Dashboard = () => {
  const [selectedNavItem, setSelectedNavItem] = useState(sessionStorage.getItem('selectedNavItem') || "addTrack");

  const handleNavItemClick = (navItem) => {
    setSelectedNavItem(navItem);
    sessionStorage.setItem('selectedNavItem', navItem);
  };

  
  
    const role = useSelector(state => state.user.currentUser.role);
    console.log(role)

    // Если пользователь не является администратором/филиалом/китайским оператором, перенаправляем на /main
    if (role !== 'admin' && role !== 'filial' && role !== 'china') {
      return <Navigate to="/main" />;
    }

    // Роль в localStorage нужна для Sidebar
    localStorage.setItem("role", role);

    // Устанавливаем язык: для china - китайский, для всех остальных - русский
    if (role === 'china') {
      i18n.changeLanguage('cn');
    } else {
      i18n.changeLanguage('ru');
    }

    return (
      <>
      <div className="footer__menu">
        <FooterMbl onNavItemClick={handleNavItemClick} />
        </div>  
        <div className="dashboard">
          <Sidebar onNavItemClick={handleNavItemClick} />
          {selectedNavItem === "addTrack" && <AddTrack />}
          {selectedNavItem === "addTrackToUser" && <AddTrackToClient />}
          {selectedNavItem === "trackList" && <TrackList />}
          {selectedNavItem === "trackSearch" && <TrackSearch />}
          {selectedNavItem === "Lost" && <Lost />}
          {selectedNavItem === "allUsers" && <AllUsers />}
          {selectedNavItem === "statistics" && <Statistics />}
          {selectedNavItem === "myCargo" && <MyCargo />}
          {selectedNavItem === "mailing" && <PartnerProgramAdmin />}
          {selectedNavItem === "Announcements" && <AnnouncementManager />}
          {selectedNavItem === "globalIdCounter" && <GlobalIdCounterStatus />}
          {selectedNavItem === "sendInvoice" && <SendInvoice />}
          {selectedNavItem === "admins" && <AdminsList />}
          
        </div>
        
      </>

    )
}

export default Dashboard;