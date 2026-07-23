import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Компонент для защиты админских маршрутов
 * Доступен только для админов и филиалов
 */
const AdminRoute = ({ children }) => {
  const isAuth = useSelector(state => state.user.isAuth);
  const role = useSelector(state => state.user.currentUser?.role);

  // Если не авторизован, редирект на логин
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Если не админ, не филиал и не china, редирект на главную покупателей
  if (role !== 'admin' && role !== 'filial' && role !== 'china') {
    return <Navigate to="/main" replace />;
  }

  // Если админ/филиал/china, показываем компонент
  return children;
};

export default AdminRoute;
