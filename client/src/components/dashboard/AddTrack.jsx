import React, { useEffect, useState, useRef, useCallback } from "react";
import './css/admin.css';
import Title from "./title";
import scan from "../../assets/img/scan.png";
import { getStatus } from "../../action/status";
import { excelTracks } from "../../action/track";
import loadingPNG from "../../assets/img/loading.png";
import check from "../../assets/img/check.png";
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import config from '../../config';

const AddTrack = () => {
    const [statuses, setStatuses] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [globalStatus, setGlobalStatus] = useState("Готов к выдаче");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [menuOpen, setMenuOpen] = useState(false);
    const inputRef = useRef(null);
    const [bulkTracksText, setBulkTracksText] = useState('');
    const [showBulkInput, setShowBulkInput] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ track: '', userInfo: '' });

    const role = localStorage.getItem('role');
    const { t } = useTranslation();
    const isChina = role === 'china';

    const itemsPerPage = 20;
    const totalPages = Math.ceil(tracks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTracks = tracks.slice(startIndex, endIndex);

    // Загрузка из localStorage
    useEffect(() => {
        const savedTracks = localStorage.getItem('scannedTracks');
        if (savedTracks) {
            try {
                setTracks(JSON.parse(savedTracks));
            } catch (error) {
                console.error('Ошибка загрузки tracks из localStorage:', error);
            }
        }
    }, []);

    // Сохранение в localStorage
    useEffect(() => {
        localStorage.setItem('scannedTracks', JSON.stringify(tracks));
    }, [tracks]);

    // Автофокус на input
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Получение статусов
    const fetchStatuses = useCallback(async () => {
        try {
            const statusesData = await getStatus();
            setStatuses(statusesData);

            // Для china всегда "Поступило на склад в Китае", для других - "Готов к выдаче"
            const defaultStatusText = isChina ? "Поступило на склад в Китае" : "Готов к выдаче";
            const defaultStatus = statusesData.find(s => s.statusText === defaultStatusText);
            if (defaultStatus) {
                setGlobalStatus(defaultStatus._id);
            }
        } catch (error) {
            console.error('Ошибка при получении статусов:', error);
        }
    }, [isChina]);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);

    // Добавление трека
    const addTrackToBuffer = async (trackNumber) => {
        const cleanTrack = trackNumber.replace(/\s/g, '');
        if (!cleanTrack) return;

        // Проверка на дубликат в локальном списке
        const exists = tracks.some(t => t.track === cleanTrack);
        if (exists) {
            // Опционально: звук ошибки
            return;
        }

        // Проверка в базе данных
        let userInfo = 'Ошибка проверки';
        try {
            const response = await axios.get(`${config.apiUrl}/api/track/tracks`, {
                params: { search: cleanTrack, limit: 1 }
            });
            const foundTrack = response.data.tracks && response.data.tracks.length > 0 ? response.data.tracks[0] : null;

            userInfo = 'Пользователь не прикреплён';
            if (foundTrack && foundTrack.user) {
                userInfo = `${foundTrack.user} (${foundTrack.phone || '-'})`;
            }

            // Показать модальное окно
            setModalContent({ track: cleanTrack, userInfo });
            setShowModal(true);
            setTimeout(() => setShowModal(false), 2000);

        } catch (error) {
            console.error('Ошибка при проверке трека:', error);
            // Показать модальное окно с ошибкой
            setModalContent({ track: cleanTrack, userInfo });
            setShowModal(true);
            setTimeout(() => setShowModal(false), 2000);
        }

        const newTrack = {
            id: Date.now(),
            track: cleanTrack,
            status: null,
            userInfo: userInfo
        };

        setTracks(prev => [newTrack, ...prev]);

        // Звук успеха
        const successSound = new Audio('/sounds/success.mp3');
        successSound.play();
    };

    // Удаление трека
    const removeTrack = (id) => {
        setTracks(prev => prev.filter(t => t.id !== id));
    };

    // Обработка Enter в input
    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            const value = e.target.value.trim();
            if (value) {
                await addTrackToBuffer(value);
                e.target.value = '';
            }
        } else if (e.key === 'Backspace' && e.target.value === '' && tracks.length > 0) {
            // Удалить последний трек
            const lastTrack = tracks[tracks.length - 1];
            removeTrack(lastTrack.id);
        }
    };

    // Загрузка треков
    const handleUpload = async () => {
        if (!date) {
            alert('Выберите дату');
            return;
        }

        if (tracks.length === 0) {
            alert('Нет треков для загрузки');
            return;
        }

        setLoading(true);

        try {
            // Все треки получают общий статус
            const trackList = tracks.map(t => t.track);

            await excelTracks(trackList, globalStatus, date);

            setTracks([]);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);

            // Возврат фокуса
            if (inputRef.current) {
                inputRef.current.focus();
            }
        } catch (error) {
            console.error('Ошибка при загрузке треков:', error);
            alert(error.response?.data?.message || 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    // Очистка списка
    const clearTracks = () => {
        setTracks([]);
        setMenuOpen(false);
    };

    // Удаление дубликатов
    const removeDuplicates = () => {
        const seen = new Set();
        const unique = tracks.filter(t => {
            if (seen.has(t.track)) return false;
            seen.add(t.track);
            return true;
        });
        setTracks(unique);
        setMenuOpen(false);
    };

    // Обработка bulk вставки треков
    const handleBulkTracks = () => {
        const lines = bulkTracksText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const newTracks = [];
        const duplicates = [];

        lines.forEach(trackNumber => {
            const cleanTrack = trackNumber.replace(/\s/g, '');
            if (!cleanTrack) return;

            const exists = tracks.some(t => t.track === cleanTrack) || newTracks.some(t => t.track === cleanTrack);
            if (exists) {
                duplicates.push(cleanTrack);
            } else {
                newTracks.push({
                    id: Date.now() + Math.random(),
                    track: cleanTrack,
                    status: null,
                    userInfo: 'Не проверено'
                });
            }
        });

        if (newTracks.length > 0) {
            setTracks(prev => [...newTracks, ...prev]);
            setBulkTracksText('');
            setShowBulkInput(false);

            // Звук успеха
            const successSound = new Audio('/sounds/success.mp3');
            successSound.play();

            if (duplicates.length > 0) {
                alert(`Добавлено ${newTracks.length} треков. Пропущено дубликатов: ${duplicates.length}`);
            } else {
                alert(`Добавлено ${newTracks.length} треков`);
            }
        } else {
            alert('Нет новых треков для добавления');
        }
    };

    // Счетчик
    const counterText = isChina ? `${tracks.length} ${t('warehouse.tracksCount')}` : `${tracks.length} треков`;

    return (
        <div className="mainAdmin">
            <Title text="Добавить трек"/>
            <div className="mainAdmin-container">
                {loading && <div className="loading modal-load"><img src={loadingPNG} alt="" /><p>Загрузка...</p></div>}
                {success && <div className="success modal-load"><img src={check} alt="" /><p>Успешно загружено!!</p></div>}

                {/* Модальное окно для информации о треке */}
                {showModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10000
                    }}>
                        <div style={{
                            backgroundColor: '#fff',
                            padding: '30px',
                            borderRadius: '15px',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                            textAlign: 'center',
                            minWidth: '400px',
                            border: '2px solid #007bff'
                        }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '24px' }}>Информация о треке</h3>
                            <p style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>Трек: {modalContent.track}</p>
                            <p style={{ margin: '0', fontSize: '16px', color: '#555' }}>{modalContent.userInfo}</p>
                        </div>
                    </div>
                )}

                {/* Сканер */}
                <div className="scanner-section" style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px',
                    alignItems: 'center'
                }}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={isChina ? t('warehouse.scanPlaceholder') : "Сканируйте трек..."}
                        onKeyDown={handleKeyDown}
                        style={{
                            flex: 1,
                            padding: '15px',
                            borderRadius: '10px',
                            border: '2px solid #ddd',
                            fontSize: '16px',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#007bff'}
                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    />
                    <button
                        style={{
                            padding: '15px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: '#81b9f54f',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                        onClick={async () => {
                            const value = inputRef.current?.value.trim();
                            if (value) {
                                await addTrackToBuffer(value);
                                inputRef.current.value = '';
                            }
                        }}
                    >
                        <img src={scan} alt="scan" style={{width: '20px', height: '20px'}} />
                    </button>
                </div>

                {/* Bulk загрузка из Excel */}
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => setShowBulkInput(!showBulkInput)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: '1px solid #007bff',
                            backgroundColor: showBulkInput ? '#e7f3ff' : '#fff',
                            color: '#007bff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        {showBulkInput ? 'Скрыть' : 'Вставить из Excel'}
                    </button>

                    {showBulkInput && (
                        <div style={{
                            marginTop: '10px',
                            padding: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: '#f9f9f9'
                        }}>
                            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                                Вставьте треки из Excel (по одному на строку). Дубликаты будут пропущены.
                            </p>
                            <textarea
                                value={bulkTracksText}
                                onChange={(e) => setBulkTracksText(e.target.value)}
                                placeholder="Пример:&#10;TRACK001&#10;TRACK002&#10;TRACK003"
                                style={{
                                    width: '100%',
                                    height: '120px',
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '5px',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button
                                    onClick={handleBulkTracks}
                                    disabled={!bulkTracksText.trim()}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '5px',
                                        border: 'none',
                                        backgroundColor: bulkTracksText.trim() ? '#28a745' : '#ccc',
                                        color: 'white',
                                        cursor: bulkTracksText.trim() ? 'pointer' : 'not-allowed',
                                        fontSize: '14px'
                                    }}
                                >
                                    Добавить все
                                </button>
                                <button
                                    onClick={() => {
                                        setBulkTracksText('');
                                        setShowBulkInput(false);
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '5px',
                                        border: '1px solid #6c757d',
                                        backgroundColor: '#fff',
                                        color: '#6c757d',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Таблица */}
                <div className="tracks-table" style={{
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    overflow: 'visible'
                }}>
                    {/* Header */}
                    <div className="table-header" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '20px',
                        borderBottom: '1px solid #eee',
                        backgroundColor: '#f8f9fa'
                    }}>
                        <div style={{fontSize: '18px', fontWeight: 'bold'}}>
                            {counterText}
                        </div>

                        <div className="tracks-controls" style={{display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between'}}>
                            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center'}}>
                                {isChina ? (
                                    <span style={{fontSize: '16px', fontWeight: 'bold', color: '#28a745'}}>
                                        已抵達中國某倉庫
                                    </span>
                                ) : (
                                    <select
                                        className="status-select"
                                        value={statuses.find(s => s._id === globalStatus)?.statusText || ''}
                                        onChange={(e) => {
                                            const selectedStatus = statuses.find(s => s.statusText === e.target.value);
                                            if (selectedStatus) {
                                                setGlobalStatus(selectedStatus._id);
                                            }
                                        }}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '5px',
                                            border: '1px solid #ddd',
                                            minWidth: '175px'
                                        }}
                                    >
                                        {statuses.map(status => (
                                            <option key={status._id} value={status.statusText}>
                                                {status.statusText}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                <input
                                    className="date-input"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '5px',
                                        border: '1px solid #ddd',
                                        minWidth: '175px'
                                    }}
                                />

                                <button
                                    className="upload-btn"
                                    onClick={handleUpload}
                                    disabled={tracks.length === 0}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '5px',
                                        border: 'none',
                                        backgroundColor: tracks.length > 0 ? '#28a745' : '#ccc',
                                        color: 'white',
                                        cursor: tracks.length > 0 ? 'pointer' : 'not-allowed',
                                        fontWeight: 'bold',
                                        minWidth: '120px'
                                    }}
                                >
                                    {isChina ? t('warehouse.uploadButton') : 'Загрузить'}
                                </button>
                            </div>

                            <div style={{position: 'relative'}}>
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '5px',
                                        border: '1px solid #ddd',
                                        backgroundColor: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ⋮
                                </button>

                                {menuOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: '0',
                                        backgroundColor: 'white',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                        zIndex: 2000,
                                        minWidth: '150px',
                                        overflow: 'visible'
                                    }}>
                                        <button
                                            onClick={clearTracks}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                textAlign: 'left',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {isChina ? "清空列表" : "Очистить список"}
                                        </button>
                                        <button
                                            onClick={removeDuplicates}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                textAlign: 'left',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {isChina ? "删除重复项" : "Удалить дубликаты"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>                        </div>
                    {/* Тело таблицы */}
                    <div className="table-body">
                        {/* Заголовок таблицы */}
                        <div className="table-header-row" style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 20px',
                            borderBottom: '2px solid #eee',
                            backgroundColor: '#f8f9fa',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            <div style={{flex: 1}}>Трек-код</div>
                            <div style={{flex: 1}}>Пользователь</div>
                            <div style={{width: '30px'}}></div>
                        </div>

                        {currentTracks.length === 0 ? (
                            <div style={{
                                padding: '40px',
                                textAlign: 'center',
                                color: '#666'
                            }}>
                                Нет отсканированных треков
                            </div>
                        ) : (
                            currentTracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    className="table-row"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '15px 20px',
                                        borderBottom: '1px solid #eee',
                                        backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                                        transition: 'all 0.3s ease',
                                        opacity: 1,
                                        transform: 'translateY(0)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa'}
                                >
                                    <div style={{flex: 1, fontWeight: 'bold'}}>
                                        {track.track}
                                    </div>
                                    <div style={{
                                        flex: 1,
                                        fontSize: '14px',
                                        color: track.userInfo.includes('Пользователь') || track.userInfo.includes('Ошибка') ? '#666' : '#007bff',
                                        fontWeight: track.userInfo.includes('Пользователь') || track.userInfo.includes('Ошибка') ? 'normal' : 'bold'
                                    }}>
                                        {track.userInfo}
                                    </div>

                                        <button
                                        onClick={() => removeTrack(track.id)}
                                        style={{
                                            width: '26px',
                                            minWidth: '26px',
                                            height: '26px',
                                            borderRadius: '4px',
                                            border: '1px solid #dc3545',
                                            backgroundColor: 'transparent',
                                            color: '#dc3545',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            lineHeight: '1',
                                            padding: 0
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Пагинация */}
                    {totalPages > 1 && (
                        <div className="pagination" style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '20px',
                            gap: '10px'
                        }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    borderRadius: '3px'
                                }}
                            >
                                ←
                            </button>

                            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        backgroundColor: currentPage === page ? '#007bff' : 'white',
                                        color: currentPage === page ? 'white' : 'black',
                                        cursor: 'pointer',
                                        borderRadius: '3px'
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    backgroundColor: currentPage === totalPages ? '#f8f9fa' : 'white',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    borderRadius: '3px'
                                }}
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddTrack;
