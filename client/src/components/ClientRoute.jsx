import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Компонент для защиты клиентских маршрутов
 * Доступен только для обычных пользователей (не админов и не филиалов)
 * Админы перенаправляются на админку
 */
const ClientRoute = ({ children }) => {
  const isAuth = useSelector(state => state.user.isAuth);

  // Если не авторизован, редирект на логин
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Админы и филиалы могут использовать клиентские страницы вместе с админкой
  return children;
};

export default ClientRoute;
