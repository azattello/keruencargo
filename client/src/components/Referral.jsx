import React, { useEffect, useState } from "react";
import './styles/parcels.css';
import './styles/referral.css';

import Tab from './Tab';
import { Link, useLocation } from "react-router-dom";

import house from '../assets/icons/home-outline.svg';
import house2 from '../assets/icons/home.svg';

import box from '../assets/icons/layers-outline.svg';
import box2 from '../assets/icons/layers.svg';


import user from '../assets/icons/person-circle-outline.svg';
import user2 from '../assets/icons/person-circle.svg';
import config from "../config";

const titlePage = "Партнерская программа"; 




const Referral = () => {

    const location = useLocation();
    const [userData, setUserData] = useState(null);


    const [referrals, setReferrals] = useState([]);
    const [referralLink, setReferralLink] = useState('');

    useEffect(() => {
        // Функция для получения данных профиля пользователя
        const fetchUserProfile = async () => {
            try {
                // Отправляем GET запрос на сервер для получения данных профиля
                const response = await fetch(`${config.apiUrl}/api/auth/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Передаем токен в заголовке запроса
                    }
                });

                // Проверяем, успешно ли выполнен запрос
                if (response.ok) {
                    // Если запрос успешен, получаем данные профиля из ответа
                    const data = await response.json();
                    setUserData(data.user); // Сохраняем данные профиля в состоянии
                } else {
                    // Если произошла ошибка, выводим сообщение об ошибке
                    console.error('Failed to fetch user profile:', response.statusText);
                }
            } catch (error) {
                // Если произошла ошибка при выполнении запроса, выводим сообщение об ошибке
                console.error('Error fetching user profile:', error.message);
            }
        };

        // Вызываем функцию для получения данных профиля пользователя
        fetchUserProfile();
    }, []); // Запрос будет выполнен только при первом рендере компонента


    useEffect(() => {
        const fetchReferrals = async () => {
            try {
               // Отправляем GET запрос на сервер для получения данных профиля
               const response = await fetch(`${config.apiUrl}/api/user/referrals`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Передаем токен в заголовке запроса
                }
            });
            // Проверяем, успешно ли выполнен запрос
            if (response.ok) {
                const data = await response.json(); // Преобразуем ответ в JSON
                setReferrals(data); // Устанавливаем данные
            } else {
                // Если произошла ошибка, выводим сообщение об ошибке
                console.error('Failed to fetch user profile:', response.statusText);
            }

            } catch (error) {
                console.error('Ошибка при получении рефералов:', error);
            }
        };
    
        fetchReferrals();

    }, [referrals]);
    

    
    const generateReferralLink = () => {
        const userId = userData.id; // Здесь мы берем ID текущего пользователя
        const link = `${window.location.origin}/registration?ref=${userId}`;
        setReferralLink(link);
        navigator.clipboard.writeText(link); // Копируем ссылку в буфер обмена
        alert("Реферальная ссылка скопирована!");
    };


  


    return (
      
        <div className="main__parcels">
            <header className="header">
                    <div className='LogoHeader'>
                        <div className="title2">
                            {titlePage}
                        </div>
                    </div>

                    <ul className="Menu">
                        <Link to="/main" className="tabbutton-menu">
                            <img className="icons-svg" src={location.pathname === '/main' ? house2 : house} alt="" />
                            <p style={location.pathname === '/main' ? { color: '#1F800C' } : { color: '#808080' } }>Главная</p>
                        </Link>
                        
                        <Link to="/parcels" className="tabbutton-menu" >
                            <img className="icons-svg" src={location.pathname === '/parcels' ? box2 : box}  alt="" />
                            <p style={location.pathname === '/parcels' ? { color: '#1F800C' } : { color: '#808080' } }>Посылки</p>
                        </Link>

                        {/* <Link to="/notification" className="tabbutton-menu" >
                            <img src={location.pathname === '/notification' ? bell2 : bell} alt="" />
                            <p>Уведомление</p>
                        </Link> */}

                        <Link to="/profile" className="tabbutton-menu" >
                            <img className="icons-svg" src={location.pathname === '/profile' ? user2 : user}  alt="" />
                            <p style={location.pathname === '/profile' ? { color: '#1F800C' } : { color: '#808080' } }>Профиль</p>
                        </Link>
                        
                        {userData && userData.role === 'admin' && (
                            <Link to="/dashboard" className="tabbutton-menu">Панель управления</Link>
                        )}
                        {userData && userData.role === 'filial' && (
                            <Link to="/dashboard" className="tabbutton-menu">Панель управления</Link>
                        )}
                        
                    </ul>

                </header>
                
                <div className="referral-section">
                    <div className="header-ref">
                        <h2>Пользователи, зарегистрированные по вашей реферальной ссылке</h2>
                        <div className='bonus-container'><span className='bonus'>B</span><span  className='bonus-total'>{userData ? userData.bonuses : 0}</span></div>
                    </div>
                <ul>

                    {referrals.map((referral) => (
                        <li key={referral._id}>
                             <p><strong>Имя: </strong> {referral.name}</p>
                            <p><strong>Фамилия: </strong> {referral.surname}</p>
                            <p><strong>Номер телефона: </strong> {referral.phone}</p>
                            <p><strong>Дата регистрации: </strong> {new Date(referral.createdAt).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
                <button className="info-el-ref" onClick={generateReferralLink}>Партнерская программа</button>
                {referralLink && <div className="ref-p" ><p><b>Ваша реферальная ссылка:</b> <br /> {referralLink}</p></div>}

            <div className="area3"></div>

            </div>

            <Tab/>
        </div>

    )
}

export default Referral;