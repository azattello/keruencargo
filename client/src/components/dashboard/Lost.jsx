import React, { useState, useEffect } from 'react';
import './css/admin.css';
import Title from "./title";
import search from "../../assets/img/search.png";
import axios from 'axios';
import config from '../../config';
import { excelLosts} from "../../action/lost";

import loadingPNG from "../../assets/img/loading.png";
import check from "../../assets/img/check.png";


const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};




const Lost = () => {
    const [losts, setTracks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(100);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalUsers, setTotalUsers] = useState(0);


    const [modalOpen, setModalOpen] = useState(false);
    const [textareaValue, setTextareaValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const resetSuccess = () => {
        setTimeout(() => {
          setSuccess(false);
        }, 1500);
    };
    
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

    const handleOpenModal = () => {
        setModalOpen(!modalOpen);
    };
    const handleTextareaChange = (event) => {
        setTextareaValue(event.target.value);
    };

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/losts/losts`, {
                    params: {
                        page: currentPage,
                        limit: perPage,
                        search: searchTerm, // Передаем поисковой запрос в параметрах запроса
                    }
                });

                setTracks(response.data.tracks);
                setTotalUsers(response.data.totalCount); // Обновление общего количества пользователей
            } catch (error) {
                console.error('Ошибка при получении трек-кодов:', error.message);
            }
        };

        fetchTracks();
    }, [currentPage, perPage, searchTerm]);


    const handleSubmit = async () => {
        setLoading(true);
        // Проверка на пустые значения
        if (!textareaValue.trim()) {
            setLoading(false);
            return alert('Необходимо заполнить все поля');
        }

        const trackList = textareaValue
            .split('\n') // Разбиваем текст на строки
            .filter(track => track.trim() !== '') // Удаляем пустые строки
            .map(track => track.trim()); // Убираем пробелы из начала и конца каждой строки

        console.log(trackList);
        // Отправляем запрос на обновление треков
        try {
            await excelLosts(trackList);
            console.log('Треки успешно обновлены!');
            setSuccess(true); // Устанавливаем флаг успешной загрузки
        } catch (error) {
            console.error('Ошибка при обновлении треков:', error);
            alert(error.response.data.message); // Выводим сообщение об ошибке
        } finally {
            setLoading(false); // Сбрасываем флаг загрузки после завершения запроса
            setTextareaValue('');
            handleOpenModal();
        }
        resetSuccess();
    };


    return (
        <div className="mainAdmin">
            <Title text="Потеряшки" />
            <div className="users-container">
            {loading && <div className="loading modal-load"><img src={loadingPNG} alt="" /><p>Загрузка...</p></div>}
            {success && <div className="success modal-load"><img src={check} alt="" /><p>Успешно загружено!!</p></div>}
                <div className="header-bar">
                    <div className="search-bar">
                        <img src={search} alt="" className="searchIcon" />
                        <input
                            type="text"
                            className="searchInput"
                            placeholder="Поиск..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                        <button className="add-lost-item-button"  onClick={handleOpenModal}> Добавить утерянный товар</button>
                          
                </div>

                <p className="totalCount">Найдено: {totalUsers}</p>

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

                {modalOpen && (
                    <div className="modalExcel">
                        <div className="modal-header">
                            <h2>Массовая загрузка утеренных товаров</h2>
                            <div className="close" onClick={handleOpenModal}></div>
                        </div>
                        <textarea value={textareaValue} onChange={handleTextareaChange} name="textarea" id="" cols="30" rows="10" className="textarea"></textarea>
                        <button className="buttonExcel buttonExcelLost" onClick={handleSubmit}>Загрузить</button>
                    </div>
                )}

                <div className="page-point-bar">
                    <div className="page-point" onClick={handlePageChangeMinus}>Предыдущая страница</div>
                    <div className="page-point">
                        <label htmlFor="page">Номер страницы: </label>
                        <input type="number" id="page" value={currentPage} onChange={handlePageChange} />
                    </div>
                    <div className="page-point">
                        <label htmlFor="perPage">Кол-во: </label>
                        <input type="number" id="perPage" value={perPage} onChange={handlePerPageChange} />
                    </div>
                    <div className="page-point" onClick={handlePageChangePlus}>Следующая страница</div>
                </div>
            </div>
        </div>
    );
};

export default Lost;
