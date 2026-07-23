import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './components/styles/global.css';
import Home from "./components/Home";
import Registration from "./components/Registration";
import Login from "./components/Login";
import Main from "./components/Main";
import Parcels from "./components/Parcels";
import Notification from "./components/Notification";
import Profile from "./components/Profile";
import LostClient from "./components/LostClient";
import Dashboard from "./components/dashboard/Dashboard";
import ArchivePage from "./components/ArchivePage";
import { useDispatch } from "react-redux";
import { auth } from "./action/user";
import { useSelector } from 'react-redux';
import NotFound from "./components/NotFound";
import Referral from "./components/Referral";
import AdminRoute from "./components/AdminRoute";
import ClientRoute from "./components/ClientRoute";
import AnnouncementManager from "./components/AnnouncementManager";
// Pages
import Bonuses from './components/pages/Bonuses';
import Filials from './components/pages/Filials';
import Invoices from './components/pages/Invoices';
import Warehouse from './components/pages/Warehouse';
import QRPage from './components/pages/QRPage';
import Terms from './components/pages/Terms';
import Contacts from './components/pages/Contacts';
import Settings from './components/pages/Settings';
import Manager from './components/pages/Manager';

import './i18n'; // Подключение i18n для инициализации

// Global UI helpers
import Toast from './components/Toast';
import Confirm from './components/Confirm';

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем авторизацию при загрузке и ждём результата
    const checkAuth = async () => {
      await dispatch(auth());
      setIsLoading(false);
    };
    checkAuth();
  }, [dispatch]);

  const isAuth = useSelector(state => state.user.isAuth);

  // Во время загрузки показываем заглушку
  if (isLoading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
      <p>Загрузка...</p>
    </div>;
  }

  return (
    <Router>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={isAuth ? <Navigate to="/main" /> : <Login />} />
        <Route path="/registration" element={isAuth ? <Navigate to="/main" /> : <Registration />} />
        
        {/* Защищенные маршруты для обычных пользователей (клиентов) */}
        <Route path="/main" element={<ClientRoute><Main /></ClientRoute>} />
        <Route path="/parcels" element={<ClientRoute><Parcels /></ClientRoute>} />
        <Route path="/notification" element={<ClientRoute><Notification /></ClientRoute>} />
        <Route path="/profile" element={<ClientRoute><Profile /></ClientRoute>} />
        <Route path="/lost" element={<ClientRoute><LostClient /></ClientRoute>} />
        <Route path="/referral" element={<ClientRoute><Referral /></ClientRoute>} />
        <Route path="/archive" element={<ClientRoute><ArchivePage /></ClientRoute>} />

        {/* Pages для клиентов (защищенные) */}
        <Route path="/bonus" element={<ClientRoute><Bonuses /></ClientRoute>} />
        <Route path="/filials" element={<ClientRoute><Filials /></ClientRoute>} />
        <Route path="/invoices" element={<ClientRoute><Invoices /></ClientRoute>} />
        <Route path="/warehouse" element={<ClientRoute><Warehouse /></ClientRoute>} />
        <Route path="/qr" element={<ClientRoute><QRPage /></ClientRoute>} />
        <Route path="/terms" element={<ClientRoute><Terms /></ClientRoute>} />
        <Route path="/contacts" element={<ClientRoute><Contacts /></ClientRoute>} />
        <Route path="/settings" element={<ClientRoute><Settings /></ClientRoute>} />
        <Route path="/manager" element={<ClientRoute><Manager /></ClientRoute>} />
        
        {/* Защищенные маршруты для админов (админка) */}
        <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/announcements" element={<AdminRoute><AnnouncementManager /></AdminRoute>} />
        
        {/* Обработка всех остальных маршрутов */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Global overlays */}
      <Toast />
      <Confirm />
    </Router>
  );
}

export default App;
