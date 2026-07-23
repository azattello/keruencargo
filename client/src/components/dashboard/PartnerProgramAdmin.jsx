import React, { useState, useEffect } from "react";
import axios from "axios";
import './css/admin.css';
import Title from "./title";
import config from "../../config"; // Использование config для API URL

const PartnerProgramAdmin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [bonuses, setBonuses] = useState(0);
    const [percent, setPercent] = useState(0);
    const [editingUserId, setEditingUserId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [search, setSearch] = useState(''); // Состояние для поиска

    // Функция для получения всех пользователей с бонусами
    const fetchUsers = async (searchQuery = '') => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/referral/partners`, {
                params: { search: searchQuery } // Передаем параметр поиска на сервер
            });
            setUsers(response.data);
        } catch (error) {
            setError('Ошибка при загрузке пользователей');
        } finally {
            setLoading(false);
        }
    };

    // Функция для обработки ввода в поле поиска
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    // Функция для обработки поиска
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchUsers(search);
    };

    // Функция для получения рефералов конкретного пользователя
    const fetchReferrals = async (userId) => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/referral/partners/${userId}/referrals`);
            setSelectedUser({ ...selectedUser, referrals: response.data });
            setModalIsOpen(true);
        } catch (error) {
            setError('Ошибка при загрузке рефералов');
        }
    };

    // Функция для обновления как бонусов, так и процента
    const updateUser = async () => {
        if (bonuses !== '') {
            updateBonuses(); // Обновляем бонусы
        }
        if (percent !== '') {
            try {
                await axios.put(`${config.apiUrl}/api/referral/partners/${editingUserId}/percent`, { percent });
                fetchUsers(); // Обновить список пользователей
                alert('Процент пользователя обновлен');
                setPercent(0);
                setEditingUserId(null);
            } catch (error) {
                setError('Ошибка при обновлении процента пользователя');
            }
        }
    };

    // Функция для обновления только бонусов
    const updateBonuses = async () => {
        try {
            await axios.put(`${config.apiUrl}/api/referral/partners/${editingUserId}/bonuses`, { bonuses });
            fetchUsers(); // Обновить список пользователей
            alert('Бонусы обновлены');
            setBonuses(0);
            setEditingUserId(null);
        } catch (error) {
            setError('Ошибка при обновлении бонусов');
        }
    };


    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="mainAdmin">
            <Title text="Партнерская программа" />

            <div className="users-container">
                {/* Форма поиска */}
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <input 
                        type="text" 
                        value={search} 
                        onChange={handleSearchChange} 
                        placeholder="Поиск по имени, фамилии или телефону" 
                    />
                    <button type="submit">Поиск</button>
                </form>

                {loading ? (
                    <p>Загрузка...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <table className="bonus-table">
                        <thead>
                            <tr>
                                <th>Имя</th>
                                <th>Фамилия</th>
                                <th>Телефон</th>
                                <th>Бонусы</th>
                                <th>Процент</th>
                                <th>Рефералы</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.surname}</td>
                                    <td>{user.phone}</td>
                                    <td>{user.bonuses}</td>
                                    <td>{user.referralBonusPercentage ? `${user.referralBonusPercentage}%` : 'Общий'}</td>
                                    <td>
                                        <button onClick={() => fetchReferrals(user._id)}>Посмотреть рефералов</button>
                                    </td>
                                    <td>
                                        {editingUserId === user._id ? (
                                            <>
                                                <input 
                                                    type="number" 
                                                    value={bonuses} 
                                                    onChange={(e) => setBonuses(e.target.value)} 
                                                    placeholder="Новые бонусы" 
                                                />
                                                <input 
                                                    type="number" 
                                                    value={percent} 
                                                    onChange={(e) => setPercent(e.target.value)} 
                                                    placeholder="Новый процент" 
                                                />
                                                <button onClick={updateUser}>Сохранить</button>
                                                <button onClick={() => { setEditingUserId(null); setBonuses(0); setPercent(0); }}>Отмена</button>
                                            </>
                                        ) : (
                                            <button onClick={() => { setEditingUserId(user._id); setBonuses(user.bonuses); setPercent(user.percent || ''); }}>Изменить</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Модальное окно для отображения рефералов */}
            {modalIsOpen && selectedUser && (
                <div className="modal-overlay" onClick={() => setModalIsOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Рефералы пользователя: {selectedUser.name} {selectedUser.surname}</h3>
                        <button onClick={() => setModalIsOpen(false)} className="close-button">Закрыть</button>
                        <ul>
                            {selectedUser.referrals.length > 0 ? (
                                selectedUser.referrals.map(referral => (
                                    <li key={referral._id}>
                                        {referral.name} {referral.surname} — {referral.phone}
                                    </li>
                                ))
                            ) : (
                                <p>Нет рефералов</p>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PartnerProgramAdmin;
