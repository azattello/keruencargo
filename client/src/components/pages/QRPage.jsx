import React from 'react';
import BasePage from './BasePage';
import { useSelector } from 'react-redux';
import UserQRCode from '../UserQRCode';

export default function QRPage() {
  const user = useSelector(s => s.user.currentUser);

  return (
    <BasePage title="QR">
      {/* Только показ QR кода для клиента */}
      {user && <UserQRCode />}

      {!user && (
        <div style={{ padding: '20px', textAlign: 'center', background: '#fff', borderRadius: '8px' }}>
          <p>Требуется авторизация для доступа к QR функциям</p>
        </div>
      )}
    </BasePage>
  );
}

