import React, { useState, useRef } from "react";
import './css/admin.css';
import axios from 'axios';
import config from '../../config';

const TrackSearch = () => {
    const [searchTrack, setSearchTrack] = useState('');
    const [trackData, setTrackData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const handleSearch = async () => {
        if (!searchTrack.trim()) {
            setError('Введите трек-код');
            return;
        }

        setLoading(true);
        setError('');
        setTrackData(null);

        try {
            // Получить данные трека
            const response = await axios.get(`${config.apiUrl}/api/track/tracks`, {
                params: { search: searchTrack.trim(), limit: 1 }
            });

            if (response.data.tracks && response.data.tracks.length > 0) {
                const track = response.data.tracks[0];
                setTrackData(track);
            } else {
                setError('Трек не найден');
            }
        } catch (err) {
            console.error('Ошибка поиска трека:', err);
            setError('Ошибка при поиске трека');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleString('ru-RU');
    };

    return (
        <div className="mainAdmin">
            <div style={{
               width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '30px 20px 20px'
            }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1f4e79', marginBottom:'20px' }}>Поиск трека</h1>

                <p style={{ margin: '12px 0 0', color: 'rgba(61, 61, 61, 0.9)', fontSize: '1rem' }}>
                    Введите трек-код, чтобы получить максимально полную информацию о посылке, статусе, пользователе и товаре.
                </p>
            </div>
            <div className="mainAdmin-container">
                {/* Поле поиска */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '24px',
                    alignItems: 'stretch'
                }}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Введите трек-код для поиска..."
                        value={searchTrack}
                        onChange={(e) => setSearchTrack(e.target.value)}
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
                        onClick={handleSearch}
                        disabled={loading}
                        style={{
                            padding: '15px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: loading ? '#ccc' : '#28a745',
                            color: 'white',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? 'Поиск...' : 'Найти'}
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '10px',
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        borderRadius: '5px',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                )}

                {trackData && (
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        boxShadow: '0 15px 30px rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                        padding: '20px'
                    }}>
                        {/* Информация о треке */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ margin: '0 0 12px 0', color: '#111', fontSize: '1.4rem' }}>Данные трека</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                                <div style={{ padding: '14px', backgroundColor: '#f6f8ff', borderRadius: '12px' }}>
                                    <p style={{ margin: '0 0 6px', color: '#555' }}><strong>Трек-код</strong></p>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#222' }}>{trackData.track}</p>
                                </div>
                                <div style={{ padding: '14px', backgroundColor: '#f6f8ff', borderRadius: '12px' }}>
                                    <p style={{ margin: '0 0 6px', color: '#555' }}><strong>Статус</strong></p>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#222' }}>{trackData.status?.statusText || trackData.status || '-'}</p>
                                </div>
                                <div style={{ padding: '14px', backgroundColor: '#f6f8ff', borderRadius: '12px' }}>
                                    <p style={{ margin: '0 0 6px', color: '#555' }}><strong>Товар / продукт</strong></p>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#222' }}>{trackData.productName || 'Не указано'}</p>
                                </div>
                                <div style={{ padding: '14px', backgroundColor: '#f6f8ff', borderRadius: '12px' }}>
                                    <p style={{ margin: '0 0 6px', color: '#555' }}><strong>Пользователь</strong></p>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#222' }}>{trackData.user ? `${trackData.user} ${trackData.phone ? `(${trackData.phone})` : ''}` : 'Не прикреплён'}</p>
                                </div>
                                <div style={{ padding: '14px', backgroundColor: '#f6f8ff', borderRadius: '12px' }}>
                                    <p style={{ margin: '0 0 6px', color: '#555' }}><strong>Создал</strong></p>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#222' }}>{trackData.createdBy ? `${trackData.createdBy.name || '—'}${trackData.createdBy.phone ? ` (${trackData.createdBy.phone})` : ''}` : '—'}</p>
                                </div>
                                <div style={{ padding: '14px', backgroundColor: '#f6f8ff', borderRadius: '12px' }}>
                                    <p style={{ margin: '0 0 6px', color: '#555' }}><strong>Обновил</strong></p>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#222' }}>{trackData.updatedBy ? `${trackData.updatedBy.name || '—'}${trackData.updatedBy.phone ? ` (${trackData.updatedBy.phone})` : ''}` : '—'}</p>
                                </div>
                            </div>
                            <div style={{ marginTop: '18px', color: '#444' }}>
                                <p style={{ margin: '0 6px 6px 0' }}><strong>Дата создания:</strong> {formatDate(trackData.createdAt)}</p>
                                <p style={{ margin: 0 }}><strong>Дата последнего обновления:</strong> {formatDate(trackData.updatedAt)}</p>
                            </div>
                        </div>

                        {/* История трека */}
                        <div>
                            <h3 style={{ margin: '0 0 12px 0', color: '#111', fontSize: '1.3rem' }}>История трека</h3>
                            {trackData.history && trackData.history.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {trackData.history.map((item, index) => (
                                        <div key={index} style={{
                                            padding: '16px',
                                            border: '1px solid #e7eaf3',
                                            borderRadius: '12px',
                                            backgroundColor: '#fafbff'
                                        }}>
                                            <p style={{ margin: '0 0 8px', color: '#333' }}><strong>Статус:</strong> {item.statusText || item.status?.statusText || (typeof item.status === 'string' ? item.status : 'Не указан')}</p>
                                            <p style={{ margin: '0 0 8px', color: '#555' }}><strong>Дата:</strong> {formatDate(item.date)}</p>
                                            {item.operatorName && <p style={{ margin: 0, color: '#555' }}><strong>Оператор:</strong> {item.operatorName} {item.operatorPhone ? `(${item.operatorPhone})` : ''}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#555' }}>История отсутствует</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackSearch;