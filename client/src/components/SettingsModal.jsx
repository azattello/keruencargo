// src/components/SettingsModal.jsx
import React, { useState } from "react";

import './styles/settingsModal.css';
import config from "../config";
import { useTranslation } from "react-i18next";

const SettingsModal = ({ isOpen, onClose }) => {

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const {t} = useTranslation();
    // const [language, setLanguage] = useState('ru'); // По умолчанию русский

    if (!isOpen) return null; // Don't render anything if modal is closed

    
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
    
        // Проверка на наличие токена
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Токен отсутствует. Пожалуйста, войдите в систему снова.');
            return;
        }
    
        // Отправка запроса на смену пароля
        try {
            const response = await fetch(`${config.apiUrl}/api/auth/update-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
    
            if (response.ok) {
                setSuccess('Пароль успешно обновлен.');
                setCurrentPassword('');
                setNewPassword('');
                onClose(); // Закрываем модальное окно при успешном обновлении
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Ошибка при смене пароля.');
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            setError('Ошибка при отправке запроса.');
        }
    };
    
    // const handleLanguageChange = (lang) => {
    //     setLanguage(lang);
    //     // Здесь можно добавить код для сохранения выбранного языка (если нужно)
    // };
    
    return (
        <div className="modal-overlay">
            <div className="modal-content-settings">
                <header className='modal-settings-header'>
                    <h2>{t('menu.settings')}</h2>
                    <button className="close-modal" onClick={onClose}>✖</button>
                </header>
                <div className="change-password-container">
            <form onSubmit={handleChangePassword}>
                <div className="form-group">
                    <label className="newPassLabel" htmlFor="currentPassword">{t('menu.currentPassword')}:</label>
                    <input
                    className="newPass"
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="newPassLabel" htmlFor="newPassword">{t('menu.newPassword')}:</label>
                    <input
                    className="newPass"
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <button type="submit" className="submit-button">{t('menu.changePassword')}</button>
            </form>

            {/* <div className="language-switcher">
                    <button 
                        className={`lang-button ${language === 'ru' ? 'active' : ''}`}
                        onClick={() => handleLanguageChange('ru')}
                    >
                        Русский
                    </button>
                    <button 
                        className={`lang-button ${language === 'kz' ? 'active' : ''}`}
                        onClick={() => handleLanguageChange('kz')}
                    >
                        Қазақша
                    </button>
                </div> */}
                
            <button className="close-button" onClick={onClose}>{t('menu.close')}</button>
            
        </div>

            </div>
        </div>
    );
};

export default SettingsModal;
