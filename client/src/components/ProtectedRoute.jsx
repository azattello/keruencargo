import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Компонент для защиты приватных маршрутов
const ProtectedRoute = ({ children }) => {
  const isAuth = useSelector(state => state.user.isAuth);

  // Если не авторизован, редирект на логин
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Если авторизован, показываем компонент
  return children;
};

export default ProtectedRoute;
