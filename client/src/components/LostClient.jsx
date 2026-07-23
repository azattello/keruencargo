import React, { useEffect, useState } from 'react';
import './dashboard/css/admin.css';
import search from "../assets/img/search.png";
import { Link, useLocation } from 'react-router-dom';
import './styles/main2.css'; // Можно использовать существующие стили
import logo from '../assets/img/logo2.jpg';

import house from '../assets/icons/home-outline.svg';
import house2 from '../assets/icons/home.svg';

import box from '../assets/icons/layers-outline.svg';
import box2 from '../assets/icons/layers.svg';

import user from '../assets/icons/person-circle-outline.svg';
import user2 from '../assets/icons/person-circle.svg';
import config from '../config';
import Tab from './Tab';
import axios from 'axios';


const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const LostClient = () => {
    const location = useLocation();
    const [userData, setUserData] = useState(null);

    const [losts, setTracks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(100);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalUsers, setTotalUsers] = useState(0);


    useEffect(() => {
        // Пример запроса на получение профиля пользователя
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/api/auth/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Используем токен из localStorage
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data.user); // Сохраняем данные пользователя
                } else {
                    console.error('Ошибка при получении профиля:', response.statusText);
                }
            } catch (error) {
                console.error('Ошибка при получении профиля:', error.message);
            }
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/losts/losts`, {
                    params: {
                        page: currentPage,
                        limit: perPage,
                        search: searchTerm
                    }
                });

                setTracks(response.data.tracks);
                setTotalUsers(response.data.totalCount);
            } catch (error) {
                console.error('Ошибка при получении трек-кодов:', error.message);
            }
        };

        fetchTracks();
    }, [currentPage, perPage, searchTerm]);

    
    const handlePageChange = (e) => {
        setCurrentPage(e.target.value);
    };

    const handlePerPageChange = (e) => {
        setPerPage(e.target.value);
    };

    const handlePageChangePlus = () => {
        setCurrentPage(currentPage + 1);
    }

    const handlePageChangeMinus = () => {
        setCurrentPage(currentPage - 1);
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };


    return (
        <div className="main-lost">
            <header className="header header-main">
                <div className='LogoHeader'>
                    <img src={logo} className="logo2" alt="Logo" />
                </div>

                <ul className="Menu">
                    <Link to="/main" className="tabbutton-menu">
                        <img className="icons-svg" src={location.pathname === '/main' ? house2 : house} alt="Главная" />
                        <p style={location.pathname === '/main' ? { color: '#1F800C' } : { color: '#808080' } }>Главная</p>
                    </Link>
                    
                    <Link to="/parcels" className="tabbutton-menu">
                        <img className="icons-svg" src={location.pathname === '/parcels' ? box2 : box} alt="Посылки" />
                        <p style={location.pathname === '/parcels' ? { color: '#1F800C' } : { color: '#808080' } }>Посылки</p>
                    </Link>

                    <Link to="/profile" className="tabbutton-menu">
                        <img className="icons-svg" src={location.pathname === '/profile' ? user2 : user} alt="Профиль" />
                        <p style={location.pathname === '/profile' ? { color: '#1F800C' } : { color: '#808080' } }>Профиль</p>
                    </Link>

                    {userData && (userData.role === 'admin' || userData.role === 'filial') && (
                        <Link to="/dashboard" className="tabbutton-menu">Панель управления</Link>
                    )}
                </ul>
            </header>

            <section className='section-lost'>
            <div className="header-bar header-bar-client">
                    <div className="search-bar search-bar-client">
                        <img src={search} alt="" className="searchIcon" />
                        <input
                            type="text"
                            className="searchInput searchInput-client"
                            placeholder="Поиск..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                          
                </div>

                <p className="totalCount totalCount-client">Найдено: {totalUsers}</p>

                <div className="table-user">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Трек-код</th>
                                <th>Дата</th>
                            </tr>
                        </thead>
                        <tbody>
                            {losts.map((lost, index) => (
                                <tr key={index}>
                                    <td>{lost.track}</td>
                                    <td>{formatDate(lost.date)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>


                <div className="page-point-bar page-point-bar-client">
                    <div className="page-point page-point-client2" onClick={handlePageChangeMinus}>Предыдущая страница</div>
                    <div className="page-point page-point-client2" onClick={handlePageChangePlus}>Следующая страница</div>
                </div>
                <div className='page-point-bar page-point-bar-client'>
                <div className="page-point page-point-client">
                        <label htmlFor="page">Номер страницы: </label>
                        <input type="number" id="page" value={currentPage} onChange={handlePageChange} />
                    </div>
                    <div className="page-point page-point-client">
                        <label htmlFor="perPage">Кол-во страниц: </label>
                        <input type="number" id="perPage" value={perPage} onChange={handlePerPageChange} />
                    </div>
                </div>

                </section>
            

            <div className="area"></div>
            <Tab/>
        </div>
    );
}

export default LostClient;
