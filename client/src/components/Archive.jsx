import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import config from '../config';
import Toast from './Toast';
import './styles/archive.css';

const Archive = ({ userId: propUserId, embedded = false }) => {
  const selectorUserId = useSelector(state => state.user?.id);
  const userId = propUserId || selectorUserId;
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [expandedTrack, setExpandedTrack] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchArchives = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await axios.get(`${config.apiUrl}/api/bookmark/archives/${userId}`);
      console.log('Архив загружен:', res.data);
      setArchives(res.data.archive || res.data.archives || []);
    } catch (error) {
      console.error('Ошибка при загрузке архива:', error?.response?.data || error.message);
      showToast('Ошибка при загрузке архива', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const deleteArchiveEntry = async (trackId) => {
    try {
      await axios.delete(`${config.apiUrl}/api/bookmark/${userId}/archive/${trackId}`);
      setArchives(prev => prev.filter(a => a._id !== trackId));
      showToast('Запись удалена из архива', 'success');
    } catch (error) {
      console.error('Ошибка при удалении:', error?.response?.data || error.message);
      showToast('Ошибка при удалении', 'error');
    }
  };



  if (loading) {
    return <div className="archive-container loading">Загрузка архива...</div>;
  }

  return (
    <div className="tracks archive-tracks">
      {archives.length === 0 ? (
        <div className="empty-state">Архив пуст</div>
      ) : (
        archives.map((item, idx) => (
          <div 
            key={item._id || idx} 
            className="track-card archive-track-card"
            onClick={() => setExpandedTrack(expandedTrack === item._id ? null : item._id)}
          >
            {/* Заголовок: номер трека и описание */}
            <div className="track-summary">
              <div className="track-header">
                <div>
                  <div className="track-code">{item.trackNumber}</div>
                  <div className="track-description">{item.description}</div>
                </div>
              </div>
            </div>

            {/* Статус и дата */}
            <div className="track-status-row">
              <span className="track-status archive-status">
                В архиве
              </span>
              <span className="track-date">
                {new Date(item.receivedAt).toLocaleDateString('ru-RU')}
              </span>
            </div>

            {/* Кнопки действий */}
            <div className="archive-buttons">
              <button 
                className="btn-delete-archive" 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteArchiveEntry(item._id);
                }}
              >
                УДАЛИТЬ
              </button>
            </div>

            {/* История (при клике) */}
            {expandedTrack === item._id && item.history && item.history.length > 0 && (
              <div className="archive-history-expanded">
                <div className="history-title">История статусов</div>
                {item.history.map((entry, i) => (
                  <div key={i} className="history-entry">
                    <span className="history-status">{entry.status?.name || 'Добавлен в базу'}</span>
                    <span className="history-date">{new Date(entry.date).toLocaleString('ru-RU')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default Archive;
