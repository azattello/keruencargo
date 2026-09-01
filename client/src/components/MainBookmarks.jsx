import { useState, useEffect, useCallback, useMemo } from "react";
import "./styles/MainBookmarks.css";
import axios from 'axios';
import config from '../config';
import { useSelector } from 'react-redux';
import { showToast } from './Toast';
import { openConfirm } from './Confirm';
import Archive from './Archive';

export default function MainBookmarks({ initialTab = null }) {
  const ADDED_LABEL = 'Ожидаем';
  const [active, setActive] = useState(initialTab || 'Все');
  const [openTrack, setOpenTrack] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [notFound, setNotFound] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCountsFromServer, setStatusCountsFromServer] = useState({}); // ✅ Подсчет со ВСЕХ данных
  const [archiveCount, setArchiveCount] = useState(0); // Подсчет архива
  const PAGE_LIMIT = 25; // количество закладок на страницу
  const HISTORY_LIMIT = 5; // показываем последние 5 записей по умолчанию

  const [statuses, setStatuses] = useState([]);



  const [isCreateTrackOpen, setCreateTrackOpen] = useState(false);
  const [createTrackNumber, setCreateTrackNumber] = useState('');
  const [createStatusId, setCreateStatusId] = useState('');

  const currentUser = useSelector(state => state.user.currentUser);
  const userId = currentUser?.id;

  const [isEditOpen, setEditOpen] = useState(false);
  const [editOriginalTrack, setEditOriginalTrack] = useState('');
  const [loadingHistoryFor, setLoadingHistoryFor] = useState(null);
  const [editTrackNumber, setEditTrackNumber] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsNotFound, setEditIsNotFound] = useState(false);

  const openEditModal = ({ trackNumber, description, isNotFound }) => {
    setEditOriginalTrack(trackNumber);
    setEditTrackNumber(trackNumber);
    setEditDescription(description || '');
    setEditIsNotFound(!!isNotFound);
    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setEditOriginalTrack(''); setEditTrackNumber(''); setEditDescription(''); setEditIsNotFound(false);
  };

  const saveEditedBookmark = async () => {
    try {
      const payload = { description: editDescription };
      if (editIsNotFound && editTrackNumber && editTrackNumber !== editOriginalTrack) payload.newTrackNumber = editTrackNumber;
      await axios.patch(`${config.apiUrl}/api/bookmark/${userId}/bookmarks/${encodeURIComponent(editOriginalTrack)}`, payload);
      closeEditModal();
      fetchBookmarks(page);
      window.dispatchEvent(new CustomEvent('bookmarksUpdated'));
      showToast('Закладка сохранена', 'success');
    } catch (err) {
      console.error('Ошибка при сохранении изменений закладки:', err?.response?.data || err.message);
      showToast(err?.response?.data?.message || 'Ошибка при сохранении закладки', 'error');
    }
  };



  const fetchStatuses = useCallback(async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/status/getStatus`);
      // Сортируем по statusNumber для правильного порядка статусов
      const sorted = (res.data || []).slice().sort((a, b) => (a.statusNumber || 0) - (b.statusNumber || 0));
      setStatuses(sorted);
      if (sorted && sorted.length) setCreateStatusId(sorted[0]._id);
    } catch (err) {
      console.error('Ошибка при получении статусов:', err.message);
    }
  }, []);

  const fetchBookmarks = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = {
        page: pageNum,
        limit: PAGE_LIMIT,
        historyLimit: HISTORY_LIMIT,
      };

      if (active !== 'Все') {
        params.status = active === ADDED_LABEL ? 'Добавлен в базу' : active;
      }

      const response = await axios.get(`${config.apiUrl}/api/bookmark/${userId}/getBookmarks`, {
        params
      });

      // API возвращает { notFoundBookmarks, updatedBookmarks, totalPages, totalBookmarks, statusCounts }
      setNotFound(response.data.notFoundBookmarks || []);
      setBookmarks(response.data.updatedBookmarks || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalCount(response.data.totalBookmarks || 0);
      
      // Нормализуем statusCounts - заменяем старый текст "Добавлен в базу" на новый ADDED_LABEL
      let normalizedCounts = { ...response.data.statusCounts || {} };
      if (normalizedCounts['Добавлен в базу']) {
        normalizedCounts[ADDED_LABEL] = normalizedCounts['Добавлен в базу'];
        delete normalizedCounts['Добавлен в базу'];
      }
      setStatusCountsFromServer(normalizedCounts);
    } catch (error) {
      console.error('Ошибка при получении закладок:', error?.response?.data || error.message);
      showToast('Ошибка при получении закладок', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, active]);

  const fetchArchiveCount = useCallback(async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/bookmark/archives/${userId}`);
      const count = res.data.archive?.length || res.data.archives?.length || 0;
      setArchiveCount(count);
    } catch (err) {
      console.error('Ошибка при получении подсчета архива:', err.message);
    }
  }, [userId]);

  // эффект — загрузка закладок и статусов, подписка на обновления
  useEffect(() => {
    if (!userId) return;
    fetchStatuses();
    fetchArchiveCount();
  }, [userId, fetchStatuses, fetchArchiveCount]);

  useEffect(() => {
    if (!userId) return;
    fetchBookmarks(page);
  }, [userId, page, active, fetchBookmarks]);

  useEffect(() => {
    const onUpdated = () => { setActive(ADDED_LABEL); setPage(1); };
    window.addEventListener('bookmarksUpdated', onUpdated);
    return () => window.removeEventListener('bookmarksUpdated', onUpdated);
  }, [userId]);

  const deleteBookmark = async (trackNumber) => {
    const confirmDelete = await openConfirm('Удалить закладку?');
    if (!confirmDelete) return;
    try {
      await axios.delete(`${config.apiUrl}/api/bookmark/${userId}/delete/${trackNumber}`);
      // обновим список
      fetchBookmarks(page);
      window.dispatchEvent(new CustomEvent('bookmarksUpdated'));
      showToast('Закладка удалена', 'success');
    } catch (error) {
      console.error('Ошибка при удалении закладки:', error?.response?.data || error.message);
      showToast('Ошибка при удалении закладки', 'error');
    }
  };

  const archiveBookmark = async (trackNumber) => {
    const confirmArchive = await openConfirm('Добавить в архив?');
    if (!confirmArchive) return;
    try {
      // Найти правильный bookmark по trackNumber
      const bookmark = bookmarks.find(b => b.trackNumber === trackNumber);
      if (!bookmark || !bookmark._id) {
        showToast('Ошибка: закладка не найдена', 'error');
        return;
      }
      await axios.post(`${config.apiUrl}/api/bookmark/${userId}/archive/${bookmark._id}`);
      setArchiveCount(prev => prev + 1);
      fetchBookmarks(page);
      window.dispatchEvent(new CustomEvent('bookmarksUpdated'));
      showToast('Добавлено в архив', 'success');
    } catch (error) {
      console.error('Ошибка при архивировании:', error?.response?.data || error.message);
      showToast('Ошибка при архивировании', 'error');
    }
  };

  const archiveAllReceived = async () => {
    // Используем filtered (уже отфильтрованные по статусу "Получено")
    if (filtered.length === 0) {
      showToast('Нет треков со статусом "Получено"', 'info');
      return;
    }

    const confirmArchive = await openConfirm(`Архивировать ${filtered.length} треков?`);
    if (!confirmArchive) return;

    try {
      let archived = 0;
      for (const track of filtered) {
        try {
          // Найти правильный bookmark по trackNumber из основного массива
          const bookmark = bookmarks.find(b => b.trackNumber === track.trackNumber);
          if (!bookmark || !bookmark._id) {
            console.warn(`Bookmark ID не найден для трека ${track.trackNumber}`);
            continue;
          }
          await axios.post(`${config.apiUrl}/api/bookmark/${userId}/archive/${bookmark._id}`);
          archived++;
        } catch (error) {
          console.error(`Ошибка при архивировании трека ${track.trackNumber}:`, error?.response?.data || error.message);
        }
      }
      setArchiveCount(prev => prev + archived);
      fetchBookmarks(1);
      window.dispatchEvent(new CustomEvent('bookmarksUpdated'));
      showToast(`Архивировано ${archived} из ${filtered.length} треков`, 'success');
    } catch (error) {
      console.error('Ошибка при массовом архивировании:', error?.response?.data || error.message);
      showToast('Ошибка при архивировании', 'error');
    }
  };

  const loadFullHistory = async (trackNumber) => {
    setLoadingHistoryFor(trackNumber);
    try {
      const res = await axios.get(`${config.apiUrl}/api/track/history/${encodeURIComponent(trackNumber)}`);
      const history = res.data.history || [];
      setBookmarks(prev => prev.map(b => (b.trackNumber === trackNumber ? { ...b, history, hasMoreHistory: false, showFullHistory: true } : b)));
      showToast('Полная история подгружена', 'success');
    } catch (err) {
      console.error('Ошибка при подгрузке полной истории:', err?.response?.data || err.message);
      showToast('Ошибка при подгрузке истории', 'error');
    } finally {
      setLoadingHistoryFor(null);
    }
  };



  const createTrackInSystem = async () => {
    if (!createTrackNumber || !createStatusId) return showToast('Трек и статус обязателены', 'error');
    try {
      await axios.post(`${config.apiUrl}/api/track/addTrack`, { track: createTrackNumber, status: createStatusId, date: new Date() });
      setCreateTrackNumber(''); setCreateTrackOpen(false);
      fetchBookmarks(page);
      window.dispatchEvent(new CustomEvent('bookmarksUpdated'));
      showToast('Трек добавлен в систему', 'success');
    } catch (error) {
      console.error('Ошибка при создании трека в системе:', error?.response?.data || error.message);
      showToast('Ошибка при создании трека в системе', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  // Вспомогательная функция: нормализует статус (может быть populated объект, id или строка)
  const resolveStatusText = (statusOrObj) => {
    if (!statusOrObj) return 'Неизвестен';
    if (typeof statusOrObj === 'object' && statusOrObj.statusText) return statusOrObj.statusText;
    if (typeof statusOrObj === 'object' && statusOrObj._id) {
      const found = (statuses || []).find(s => String(s._id) === String(statusOrObj._id));
      if (found) return found.statusText;
      return String(statusOrObj._id);
    }
    const byId = (statuses || []).find(s => String(s._id) === String(statusOrObj));
    if (byId) return byId.statusText;
    const byText = (statuses || []).find(s => s.statusText === statusOrObj);
    if (byText) return byText.statusText;
    return String(statusOrObj);
  };

  const getDisplayStatus = useCallback((bookmark) => {
    if (!bookmark || !Array.isArray(bookmark.history) || bookmark.history.length === 0) {
      return { statusText: 'Неизвестен', isDerived: false };
    }

    const history = bookmark.history.slice();
    const last = history[history.length - 1];
    const lastText = resolveStatusText(last && last.status);

    if (lastText === 'Получено' && history.length > 1) {
      const previous = history[history.length - 2];
      const previousText = resolveStatusText(previous && previous.status);
      if (previousText && previousText.startsWith('Прибыло в филиал ')) {
        return { statusText: previousText, isDerived: true };
      }
    }

    return { statusText: lastText, isDerived: false };
  }, [resolveStatusText]);

  const statusCounts = useMemo(() => ({
    ...statusCountsFromServer,
    'Архив': archiveCount,
    total: totalCount || Object.values(statusCountsFromServer).reduce((a, b) => a + (b || 0), 0)
  }), [statusCountsFromServer, archiveCount, totalCount]);

  const serverStatusTexts = useMemo(() => (statuses || []).map(s => s.statusText), [statuses]);
  const extraStatusTexts = useMemo(() => Object.keys(statusCounts).filter(s => 
    s !== 'total' && 
    s !== ADDED_LABEL && 
    s !== 'Архив' && 
    s !== 'Добавлен в базу' &&
    !serverStatusTexts.includes(s)
  ), [statusCounts, ADDED_LABEL, serverStatusTexts]);
  const statusTabs = useMemo(() => ['Все', ADDED_LABEL, ...serverStatusTexts, ...extraStatusTexts, 'Архив'], [serverStatusTexts, extraStatusTexts]);

  const filtered = useMemo(() => {
    if (active === 'Архив') return [];

    if (active === ADDED_LABEL) {
      return notFound.map(nf => ({ ...nf, _isNotFound: true }));
    }

    if (active === 'Все') {
      const notFoundNormalized = notFound.map(nf => ({ ...nf, _isNotFound: true }));
      const combined = [...notFoundNormalized];

      const addSortedGroup = (statusText) => {
        const group = bookmarks.filter(b => {
          const displayStatus = getDisplayStatus(b);
          return displayStatus.statusText === statusText;
        }).slice().sort((a, b) => {
          const ad = (a.history && a.history.length) ? new Date(a.history[a.history.length - 1].date) : new Date(a.createdAt || 0);
          const bd = (b.history && b.history.length) ? new Date(b.history[b.history.length - 1].date) : new Date(b.createdAt || 0);
          return bd - ad;
        });
        combined.push(...group);
      };

      serverStatusTexts.forEach(addSortedGroup);
      extraStatusTexts.forEach(addSortedGroup);

      const includedIds = new Set(combined.filter(i => !i._isNotFound).map(x => x._id || x.trackNumber));
      const rest = bookmarks.filter(b => !includedIds.has(b._id || b.trackNumber)).slice().sort((a, b) => {
        const ad = (a.history && a.history.length) ? new Date(a.history[a.history.length - 1].date) : new Date(a.createdAt || 0);
        const bd = (b.history && b.history.length) ? new Date(b.history[b.history.length - 1].date) : new Date(b.createdAt || 0);
        return bd - ad;
      });
      combined.push(...rest);
      return combined;
    }

    return bookmarks.filter(b => {
      const displayStatus = getDisplayStatus(b);
      return displayStatus.statusText === active;
    }).slice().sort((a, b) => {
      const ad = (a.history && a.history.length) ? new Date(a.history[a.history.length - 1].date) : new Date(a.createdAt || 0);
      const bd = (b.history && b.history.length) ? new Date(b.history[b.history.length - 1].date) : new Date(b.createdAt || 0);
      return bd - ad;
    });
  }, [active, ADDED_LABEL, bookmarks, extraStatusTexts, getDisplayStatus, notFound, serverStatusTexts]);

  return (
    <div>
      {/* табы */}
      <div className="tabs">
        {statusTabs.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(s)}
            className={`tab ${active === s ? 'active' : ''} ${s === 'Архив' ? 'archive-tab' : ''}`}
          >
            {s === 'Архив' ? '📦' : ''} {s} <span className="count">{s === 'Все' ? (statusCounts.total || 0) : (statusCounts[s] || 0)}</span>
          </button>
        ))}

      </div>

      {/* Кнопка для массового архивирования - только на табе "Получено" */}
      {active === 'Получено' && filtered.length > 0 && (
        <div className="archive-button-wrapper">
          <button className="btn-archive-all" onClick={archiveAllReceived}>
            🏷️ Архивировать все полученные ({filtered.length})
          </button>
        </div>
      )}

      {/* список треков или архив */}
      {active === 'Архив' ? (
        <div className="archive-section">
          <Archive userId={userId} embedded={true} />
        </div>
      ) : (
        <>
          <div className="tracks">
            {loading && <div className="loading">Загрузка...</div>}

            {!loading && filtered.length === 0 && (
              <div className="empty">Добавьте ваши треки</div>
            )}

            {!loading && filtered.map((t, i) => {
              const isNotFound = !!t._isNotFound;
              const last = (!isNotFound && t.history && t.history.length) ? t.history[t.history.length - 1] : null;
              const displayStatus = isNotFound ? { statusText: ADDED_LABEL } : getDisplayStatus(t);
              const currentStatus = displayStatus.statusText;
              const updatedAt = isNotFound ? formatDate(t.createdAt) : (last ? formatDate(last.date) : formatDate(t.createdAt));
              const title = t.description || '';
              const code = t.trackNumber || (t.trackDetails && t.trackDetails.track);

              return (
                <div
                  key={i}
                  className={`track-card ${openTrack === i ? 'open' : ''}`}
                  onClick={() => setOpenTrack(openTrack === i ? null : i)}
                >
                  <div className="track-summary">
                    <div className="track-header">
                      <div className={`track-title ${title ? '' : 'no-title'}`}>{title}</div>
                      {isNotFound ? (
                        <div className="track-actions-header">
                          <button className="btn-edit-small" onClick={(e) => { e.stopPropagation(); openEditModal({trackNumber: code, description: t.description, isNotFound}); }}>Редактировать</button>
                          <button className="btn-delete" onClick={(e) => { e.stopPropagation(); deleteBookmark(code); }}>Удалить</button>
                        </div>
                      ) : (
                        <div className="track-menu-wrapper">
                          <button
                            className="track-menu-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenTrack(openTrack === `menu-${i}` ? null : `menu-${i}`);
                            }}
                          >
                            ⋮
                          </button>

                          {openTrack === `menu-${i}` && (
                            <div className="track-menu">
                              <button className="menu-item" onClick={(e) => { e.stopPropagation(); openEditModal({trackNumber: code, description: t.description, isNotFound}); }}>Редактировать</button>
                              {currentStatus === 'Получено' && (
                                <button className="menu-item archive" onClick={(e) => { e.stopPropagation(); archiveBookmark(code); }}>В архив</button>
                              )}
                              <button className="menu-item delete" onClick={(e) => { e.stopPropagation(); deleteBookmark(code); }}>Удалить</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  

                    {/* Трек номер под описанием */}
                    <div className="track-code-row">
                      <div className="track-code">{code}</div>
                    </div>

                    {/* Статус и дата в одной строке */}
                    <div className="track-status-row">
                      <div className="track-status">{currentStatus}</div>
                      <div className="track-date">{updatedAt}</div>
                    </div>
                  </div>

                  {/* История */}
                  {openTrack === i && (
                    <div className="track-history">
                      {(() => {
                        if (isNotFound) return <div className="small">Нет истории</div>;
                        let historyToShow = (t.history || []).slice();
                        // Используем resolveStatusText чтобы корректно сопоставлять populated/ids/strings
                        const statusStrings = historyToShow.map(h => resolveStatusText(h.status));
                        const lastIdx = statusStrings.lastIndexOf(currentStatus);
                        if (!t.showFullHistory && lastIdx >= 0) historyToShow = historyToShow.slice(0, lastIdx + 1);

                        return (
                          <>
                            {historyToShow.map((h, j) => {
                              const hStatus = resolveStatusText(h.status);
                              const isCurrent = hStatus === currentStatus;
                              return (
                                <div key={j} className={`history-item ${isCurrent ? 'current' : 'done'}`}>
                                  <div className="circle" />
                                  <div className="history-content">
                                    <span className="history-status">{hStatus}</span>
                                    <span className="history-date">{formatDate(h.date)}</span>
                                  </div>
                                </div>
                              );
                            })}

                            {t.hasMoreHistory && (
                              <div className="history-load-more">
                                <button disabled={loadingHistoryFor === t.trackNumber} onClick={(e) => { e.stopPropagation(); loadFullHistory(t.trackNumber); }}>
                                  {loadingHistoryFor === t.trackNumber ? 'Загрузка...' : 'Показать полную историю'}
                                </button>
                              </div>
                            )}

                            {t.showFullHistory && (
                              <div className="history-load-more">
                                <button onClick={(e) => { e.stopPropagation(); setBookmarks(prev => prev.map(b => b.trackNumber === t.trackNumber ? { ...b, showFullHistory: false } : b)); }}>
                                  Свернуть историю
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Пагинация */}
      {active !== 'Архив' && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Назад</button>
          <span>Страница {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Вперед</button>
        </div>
      )}

      {/* Create track modal */}
      {isCreateTrackOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3>Добавить трек в систему</h3>
            <input placeholder="Трек номер" value={createTrackNumber} onChange={e => setCreateTrackNumber(e.target.value)} />
            <select value={createStatusId} onChange={e => setCreateStatusId(e.target.value)}>
              {statuses.map(s => <option key={s._id} value={s._id}>{s.statusText}</option>)}
            </select>
            <div className="modal-actions">
              <button onClick={() => setCreateTrackOpen(false)}>Отмена</button>
              <button onClick={createTrackInSystem}>Добавить в систему</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit bookmark modal */}
      {isEditOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Редактировать закладку</h2>
            <div className="modal-fields">
              <input placeholder="Трек номер" value={editTrackNumber} onChange={e => setEditTrackNumber(e.target.value)} disabled={!editIsNotFound} />
              <input placeholder="Описание" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeEditModal}>Отмена</button>
              <button className="btn-save" onClick={saveEditedBookmark}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
