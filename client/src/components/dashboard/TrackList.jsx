import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './css/admin.css';
import search from "../../assets/img/search.png";
import axios from 'axios';
import config from '../../config';
import { openConfirm } from '../Confirm';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const TabItem = ({ status, active, onClick }) => (
    <button
        onClick={() => onClick(status)}
        style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            backgroundColor: active ? '#1f4e79' : '#f1f3f5',
            color: active ? '#fff' : '#333',
            fontWeight: active ? '700' : '500',
            transition: 'background 0.15s ease-in-out',
            marginRight: '8px'
        }}
        onMouseOver={(e) => !active && (e.currentTarget.style.backgroundColor = '#e4e7eb')}
        onMouseOut={(e) => !active && (e.currentTarget.style.backgroundColor = '#f1f3f5')}
    >
        {status.statusText} ({status.count || 0})
    </button>
);

const statusPriority = [
    'Все',
    'Поступило на склад в Китае',
    'Отправлено в КЗ',
    'Готов к выдаче',
    'Получено',
];

const roleColor = (role) => {
    if (!role) return '#000';
    if (role === 'china') return '#c92a2a';
    if (role === 'admin') return '#2e7d32';
    if (role === 'filial') return '#1565c0';
    return '#000';
};

const TrackRow = ({ item }) => (
    <tr
        style={{
            transition: 'background-color 0.2s, transform 0.2s',
            backgroundColor: '#fff'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f5fb';
            e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.transform = 'translateY(0)';
        }}
    >
        <td style={{ padding: '10px 12px', borderBottom: '1px solid #e9ecef', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.track}</td>
        <td style={{ padding: '10px 12px', borderBottom: '1px solid #e9ecef', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1a4a7a', fontWeight: 600 }}>
            {item.user ? `${item.user} (${item.phone || '-'})` : '-'}
        </td>
        <td style={{ padding: '10px 12px', borderBottom: '1px solid #e9ecef', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.status || '-'}</td>
        <td style={{ padding: '10px 12px', borderBottom: '1px solid #e9ecef', width: '140px' }}>{formatDate(item.statusDate || item.date)}</td>
        <td style={{ padding: '10px 12px', borderBottom: '1px solid #e9ecef', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ color: roleColor(item.operatorRole), fontWeight: 700 }}>
                {item.operatorRole ? item.operatorRole.toUpperCase() : '—'}
            </span>
            {item.operatorName ? ` • ${item.operatorName}` : ''}
            {item.operatorPhone ? ` (${item.operatorPhone})` : ''}
        </td>
    </tr>
);

const TrackList = () => {
    const [statuses, setStatuses] = useState([]);
    const [activeStatus, setActiveStatus] = useState('all');
    const [tracks, setTracks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [footerStatus, setFooterStatus] = useState('');
    const [footerDate, setFooterDate] = useState(new Date().toISOString().slice(0, 10));

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const orderedStatuses = useMemo(() => {
        const all = [...statuses];
        all.sort((a, b) => {
            const iA = statusPriority.indexOf(a.statusText);
            const iB = statusPriority.indexOf(b.statusText);
            if (iA === -1 && iB === -1) {
                return a.statusText.localeCompare(b.statusText);
            }
            if (iA === -1) return 1;
            if (iB === -1) return -1;
            return iA - iB;
        });
        return all;
    }, [statuses]);

    const fetchStatuses = useCallback(async () => {
        try {
            const { data } = await axios.get(`${config.apiUrl}/api/status/getStatus`);
            const allCount = data.reduce((sum, s) => sum + (s.count || 0), 0);
            const allStatus = { _id: 'all', statusText: 'Все', count: allCount };
            setStatuses([allStatus, ...data]);
            const defaultStatus = data.find(s => s.statusText === 'Отправлено в КЗ') || data[0];
            setFooterStatus(defaultStatus?._id || '');
        } catch (error) {
            console.error('Ошибка получения статусов', error.message);
        }
    }, []);

    const fetchTracks = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                page,
                limit,
                search: debouncedSearch
            };

            if (activeStatus !== 'all') {
                params.status = activeStatus;
            }

            console.log('fetchTracks: activeStatus:', activeStatus, 'params:', params);
            const { data } = await axios.get(`${config.apiUrl}/api/track/tracks`, { params });
            setTracks(data.tracks || []);
            setTotal(data.totalCount || (data.tracks ? data.tracks.length : 0));
        } catch (error) {
            console.error('Ошибка получения треков', error.message);
        } finally {
            setIsLoading(false);
        }
    }, [activeStatus, page, limit, debouncedSearch]);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [activeStatus, debouncedSearch, limit]);

    useEffect(() => {
        fetchTracks();
    }, [fetchTracks]);

    const filteredTracks = useMemo(() => {
        const dateFiltered = tracks.filter(item => {
            const itemDate = new Date(item.date || item.history?.[0]?.date || item.createdAt);
            if (Number.isNaN(itemDate.getTime())) return false;
            if (dateFrom && itemDate < new Date(dateFrom + 'T00:00:00')) return false;
            if (dateTo && itemDate > new Date(dateTo + 'T23:59:59')) return false;
            return true;
        });

        return dateFiltered;
    }, [tracks, dateFrom, dateTo]);

    const applyDateFilter = () => {
        setPage(1);
    };

    const handleTransfer = async () => {
        if (isTransferring || filteredTracks.length === 0) return;

        const trackCount = filteredTracks.length;
        const confirmProceed = await openConfirm(`Вы точно хотите перенести ${trackCount} трек${trackCount === 1 ? '' : 'ов'}?`);
        if (!confirmProceed) return;

        const trackList = filteredTracks.map(t => t.track);
        if (trackList.length === 0) {
            alert('Нет треков для переноса');
            return;
        }

        setIsTransferring(true);
        setTracks(prev => prev.filter(t => !trackList.includes(t.track)));

        try {
            await axios.post(`${config.apiUrl}/api/track/addExcelTrack`, {
                tracks: trackList,
                status: footerStatus,
                date: footerDate
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setSuccessMessage(`Перенесено ${trackList.length} треков.`);
            setTimeout(() => setSuccessMessage(''), 3000);
            setDateFrom('');
            setDateTo('');
            setPage(1);
            await fetchTracks();
        } catch (error) {
            console.error('Ошибка при переносе треков', error.message);
            alert('Ошибка при переносе треков');
        } finally {
            setIsTransferring(false);
        }
    };

    const onTabClick = (status) => {
        setActiveStatus(status._id || 'all');
        setPage(1);
    };

    const onLimitChange = (e) => {
        setLimit(Number(e.target.value));
    };

    const visibleTracks = filteredTracks;

    return (
        <div className='mainAdmin' style={{ padding: '20px 12px 90px', fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
            <div style={{ width: '100%', maxWidth: '1180px', margin: '0 auto', minWidth: 0, padding: '0 12px' }}>
                <div style={{ fontSize: '26px', fontWeight: '700', marginBottom: '16px', color: '#1f4e79' }}>
                    Все треки
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <img src={search} alt="Поиск" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, width: '18px' }} />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Поиск: трек/телефон/userId"
                        style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #d0d7de', outline: 'none' }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#007bff'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#d0d7de'}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', marginBottom: '14px', paddingBottom: '4px' }}>
                {orderedStatuses.map(status => (
                    <TabItem key={status._id} status={status} active={activeStatus === status._id} onClick={onTabClick} />
                ))}
            </div>

            <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', padding: '10px 14px', borderBottom: '1px solid #e9ecef', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>{`Найдено: ${filteredTracks.length}`}</div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        />
                        <button
                            onClick={applyDateFilter}
                            style={{ padding: '8px 14px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Применить
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '10px', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'auto', border: '1px solid #e6ebf2', background: '#fff' }}>
                <div style={{ minWidth: '640px', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '640px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Трек</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Пользователь</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Статус</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Дата</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Оператор</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</td>
                            </tr>
                        )}
                        {!isLoading && visibleTracks.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>Нет треков</td>
                            </tr>
                        )}
                        {!isLoading && visibleTracks.map((track) => (
                            <TrackRow key={track.track} item={{
                                track: track.track || track.trackNumber,
                                personalId: track.personalId,
                                userId: track.userId || (track.user && typeof track.user === 'object' ? track.user._id : track.user),
                                user: track.user,
                                phone: track.phone,
                                status: track.status || track.history?.[track.history.length - 1]?.statusText,
                                statusDate: track.statusDate || track.history?.[track.history.length - 1]?.date || track.date || track.createdAt,
                                operatorName: track.operatorName,
                                operatorRole: track.operatorRole,
                                operatorPhone: track.operatorPhone
                            }} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}>Назад</button>
                    <div style={{ alignSelf: 'center' }}>Страница {page} из {totalPages}</div>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}>Вперед</button>
                </div>
                <div>
                    <select value={limit} onChange={onLimitChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
                        {[50, 100, 200].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ position: 'sticky', bottom: 0, backgroundColor: '#fff', boxShadow: '0 -2px 10px rgba(0,0,0,0.08)', padding: '12px 16px', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select value={footerStatus} onChange={(e) => setFooterStatus(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', flex: 1 }}>
                        {orderedStatuses.map(status => <option key={status._id} value={status._id}>{status.statusText}</option>)}
                    </select>

                    <input type="date" value={footerDate} onChange={(e) => setFooterDate(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />

                    <button
                        onClick={handleTransfer}
                        disabled={visibleTracks.length === 0 || isTransferring}
                        style={{
                            padding: '12px 20px',
                            borderRadius: '8px',
                            backgroundColor: visibleTracks.length === 0 ? '#8f9ba8' : '#28a745',
                            color: '#fff',
                            border: 'none',
                            cursor: visibleTracks.length === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            minWidth: '140px'
                        }}
                    >
                        {isTransferring ? 'Перенос...' : 'Перенести'}
                    </button>
                </div>
            </div>

            {successMessage && (
                <div style={{ position: 'fixed', bottom: '65px', right: '16px', backgroundColor: '#28a745', color: '#fff', padding: '10px 14px', borderRadius: '6px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                    {successMessage}
                </div>
            )}
        </div>
    </div>
    );
};

export default TrackList;
