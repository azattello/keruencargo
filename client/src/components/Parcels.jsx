import React, { useState } from 'react';
import './styles/main2.css';
import './styles/MainBookmarks.css';
import Tab from './Tab';
import config from '../config';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import MainBookmarks from './MainBookmarks';
import { showToast } from './Toast';

const Parcels = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [newParcel, setNewParcel] = useState({ code: "", name: "" });
    const [searchParams] = useSearchParams();
    const [trackError, setTrackError] = useState(""); // Состояние для ошибки трек номера

    const currentUser = useSelector(state => state.user.currentUser);
    const userId = currentUser?.id;

    // Получаем параметр tab из query string
    const initialTab = searchParams.get('tab');

    // Валидация трек номера: без пробелов и только латинские буквы/цифры
    const validateTrackNumber = (trackNumber) => {
        // Проверка на пробелы
        if (/\s/.test(trackNumber)) {
            return { valid: false, error: "Трек номер не должен содержать пробелы" };
        }
        
        // Проверка на кирилицу (кириллические символы)
        if (/[а-яёА-ЯЁ]/.test(trackNumber)) {
            return { valid: false, error: "Трек номер должен содержать только латинские буквы и цифры" };
        }
        
        return { valid: true, error: "" };
    };

    const handleTrackCodeChange = (event) => {
        const value = event.target.value;
        setNewParcel({ ...newParcel, code: value });
        
        // Проверяем валидность при вводе
        if (value) {
            const validation = validateTrackNumber(value);
            setTrackError(validation.error);
        } else {
            setTrackError("");
        }
    };

    const handleModalOpen = () => {
        setIsOpen(true);
        setTrackError("");
    };

    const handleModalClose = () => {
        setIsOpen(false);
        setNewParcel({ code: "", name: "" });
        setTrackError("");
    };

    const handleSave = async () => {
        if (!newParcel.code || !newParcel.name) return showToast('Заполните все поля', 'error');

        // Проверяем валидность трек номера
        const validation = validateTrackNumber(newParcel.code);
        if (!validation.valid) {
            setTrackError(validation.error);
            return;
        }

        try {
            if (!userId) {
                showToast('Пользователь не авторизован', 'error');
                return;
            }

            await fetch(`${config.apiUrl}/api/bookmark/${userId}/bookmarks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: newParcel.name, trackNumber: newParcel.code })
            });

            // оповестим другие компоненты чтобы перезагрузили данные
            window.dispatchEvent(new CustomEvent('bookmarksUpdated'));

            setNewParcel({ code: "", name: "" });
            setIsOpen(false);
            setTrackError("");
            showToast('Закладка добавлена', 'success');
        } catch (error) {
            console.error('Ошибка при добавлении посылки:', error);
            showToast('Ошибка при добавлении посылки', 'error');
        }
    };

    return (
        <div className="main">
            
            <header className='header-main'>
                <h1 className='text-header'>Мои посылки</h1>
            </header>   

            <button className="fab-add-parcel" onClick={handleModalOpen}>
            +
            </button>



            <MainBookmarks initialTab={initialTab} />

            <div className="area"></div>
            <Tab className="TabMain" />



            {isOpen && (
            <div className="modal-overlay">
                <div className="modal-container">
                <h2 className="modal-title">Добавить посылку</h2>

                <div className="modal-fields">
                    <div>
                        <input
                        type="text"
                        placeholder="Введите трек номер"
                        value={newParcel.code}
                        onChange={handleTrackCodeChange}
                        />
                        {trackError && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{trackError}</p>}
                    </div>
                    <input
                    type="text"
                    placeholder="Описание (например: Куртка Zara)"
                    value={newParcel.name}
                    onChange={(e) => setNewParcel({ ...newParcel, name: e.target.value })}
                    />
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={handleModalClose}>
                    Отмена
                    </button>
                    <button className="btn-save" onClick={handleSave}>
                    Сохранить
                    </button>
                </div>
                </div>
            </div>
            )}


            
        </div>
    );
};

export default Parcels;
