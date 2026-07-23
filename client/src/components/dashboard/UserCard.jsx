import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { useSelector } from 'react-redux';
import { showToast } from '../Toast';
import { openConfirm } from '../Confirm';

export default function UserCard({ profileData, onClose }) {
  // Hooks must be called unconditionally and in the same order on every render
  const currentUser = useSelector(s => s.user.currentUser);
  const role = currentUser && currentUser.role;

  const [statuses, setStatuses] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState(new Set());
  const [massDate, setMassDate] = useState('');
  const [massStatus, setMassStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [localProfile, setLocalProfile] = useState(profileData);

  // Новые состояния для быстрого просмотра по статусам (хуки должны вызываться всегда, до раннего return)
  const [bookmarksForStatus, setBookmarksForStatus] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    // загрузим актуальные статусы
    const fetchStatuses = async () => {
      try {
        const resp = await axios.get(`${config.apiUrl}/api/status/getStatus`);
        setStatuses(resp.data || []);
      } catch (e) {
        console.error('Не удалось загрузить статусы', e.message);
      }
    };
    fetchStatuses();
  }, []);

  const [isFullLoaded, setIsFullLoaded] = useState(false);

  useEffect(() => {
    // При изменении входных данных — если пришёл fullProfile с tracksByStatus, ставим его; иначе запрашиваем быстрый профиль (skipTracks)
    const init = async () => {
      setSelectedTracks(new Set());
      if (!profileData) return;
      // Если пришли уже полные данные — используем их
      if (profileData.tracksByStatus) {
        setLocalProfile(profileData);
        setIsFullLoaded(true);
        return;
      }

        // Иначе запросим быстрый профиль без треков
      try {
        setLoading(true);
        const resp = await axios.get(`${config.apiUrl}/api/user/${encodeURIComponent(profileData.user._id)}/fullProfile`, { 
          params: { skipTracks: 1 },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setLocalProfile(resp.data);
        setIsFullLoaded(false);
      } catch (e) {
        console.error('Ошибка при загрузке быстрого профиля', e?.response?.data || e.message);
        // fallback — используем переданные profileData
        setLocalProfile(profileData);
        setIsFullLoaded(false);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [profileData]);

  useEffect(() => {
    console.debug('UserCard state', { profileData, localProfile, isFullLoaded, loading });
  }, [profileData, localProfile, isFullLoaded, loading]);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editBookmark, setEditBookmark] = useState(null);
  const [editForm, setEditForm] = useState({ newTrackNumber: '', description: '' });

  // UI state: per-track menu
  const [openMenu, setOpenMenu] = useState(null);
  // Настройки отображения списка треков (высота и расширение)
  const [listHeight, setListHeight] = useState(420);
  const [expandedTracks, setExpandedTracks] = useState(false);

  const openEditBookmark = (bookmark) => {
    setEditBookmark(bookmark);
    setEditForm({ newTrackNumber: bookmark.trackNumber, description: bookmark.description || '' });
    setEditModalOpen(true);
  }; 
  const closeEditModal = () => { setEditModalOpen(false); setEditBookmark(null); };

  const submitEditBookmark = async () => {
    if (!editBookmark) return;
    try {
      setLoading(true);
      await axios.patch(`${config.apiUrl}/api/bookmark/${user._id}/bookmarks/${encodeURIComponent(editBookmark.trackNumber)}`, { newTrackNumber: editForm.newTrackNumber, description: editForm.description }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      showToast('Закладка обновлена', 'success');
      closeEditModal();
      if (selectedStatus) await loadBookmarksByStatus(selectedStatus);
      await refreshProfile();
    } catch (err) {
      console.error('Ошибка при редактировании закладки', err?.response?.data || err.message);
      showToast('Не удалось обновить закладку', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Bulk delete selected bookmarks (client-only)
  const handleBulkDeleteClient = async () => {
    if (!role || role !== 'admin') return showToast('Доступ запрещён', 'error');
    const selected = Array.from(selectedTracks);
    if (!selected.length) return showToast('Нет выбранных закладок', 'error');
    const confirm = await openConfirm(`Удалить ${selected.length} закладок у пользователя?`);
    if (!confirm) return;
    try {
      setLoading(true);
      const promises = selected.map(track => axios.delete(`${config.apiUrl}/api/bookmark/${user._id}/delete/${encodeURIComponent(track)}`).then(() => ({ track, ok: true })).catch(err => ({ track, ok: false, err })));
      const results = await Promise.all(promises);
      const okCount = results.filter(r => r.ok).length;
      const failCount = results.length - okCount;
      if (okCount) showToast(`${okCount} закладок удалено`, 'success');
      if (failCount) showToast(`${failCount} удалить не удалось`, 'error');
      if (selectedStatus) await loadBookmarksByStatus(selectedStatus);
      await refreshProfile();
      setSelectedTracks(new Set()); // Сброс выбора после удаления
    } catch (e) {
      console.error('Ошибка при массовом удалении закладок', e?.response?.data || e.message);
      showToast('Ошибка при удалении', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Bulk delete selected bookmarks and delete tracks from base
  const handleBulkDeleteClientAndBase = async () => {
    if (!role || role !== 'admin') return showToast('Доступ запрещён', 'error');
    const selected = Array.from(selectedTracks);
    if (!selected.length) return showToast('Нет выбранных закладок', 'error');
    const confirm = await openConfirm(`Удалить ${selected.length} закладок у пользователя и соответствующие треки из базы?`);
    if (!confirm) return;
    try {
      setLoading(true);
      const promises = selected.map(async (track) => {
        try {
          // delete from base (may require admin auth)
          await axios.delete(`${config.apiUrl}/api/track/${encodeURIComponent(track)}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
          await axios.delete(`${config.apiUrl}/api/bookmark/${user._id}/delete/${encodeURIComponent(track)}`);
          return { track, ok: true };
        } catch (err) {
          return { track, ok: false, err };
        }
      });
      const results = await Promise.all(promises);
      const okCount = results.filter(r => r.ok).length;
      const failCount = results.length - okCount;
      if (okCount) showToast(`${okCount} треков и закладок удалено`, 'success');
      if (failCount) showToast(`${failCount} удалить не удалось`, 'error');
      if (selectedStatus) await loadBookmarksByStatus(selectedStatus);
      await refreshProfile();
      setSelectedTracks(new Set()); // Сброс выбора после удаления
    } catch (e) {
      console.error('Ошибка при массовом удалении треков', e?.response?.data || e.message);
      showToast('Ошибка при удалении', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!profileData || !profileData.user) {
    const focusId = sessionStorage.getItem('focusUserId');
    const handleRetry = async () => {
      if (!focusId) return showToast('Нет данных пользователя для загрузки', 'error');
      setLoading(true);
      try {
        const resp = await axios.get(`${config.apiUrl}/api/user/${encodeURIComponent(focusId)}/fullProfile`, { params: { skipTracks: 1 }, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setLocalProfile(resp.data);
        setIsFullLoaded(false);
        showToast('Профиль загружен', 'success');
      } catch (err) {
        console.error('Ошибка при повторной загрузке профиля', err?.response?.data || err.message);
        showToast('Не удалось загрузить профиль', 'error');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="focused-user-card">
        <div style={{ padding: 16 }}>
          <p className="muted">Данные профиля отсутствуют или ещё загружаются.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="filter-point" onClick={handleRetry} disabled={loading}>{loading ? 'Загрузка...' : 'Повторить загрузку'}</button>
            <button className="btn-cancel" onClick={onClose}>Закрыть</button>
          </div>
        </div>
      </div>
    );
  }

  const user = (localProfile && localProfile.user) || profileData.user;
  const selectedCount = Array.from(selectedTracks).filter(t => (bookmarksForStatus||[]).some(b => b.trackNumber === t)).length;

  const refreshProfile = async () => {
    try {
      const resp = await axios.get(`${config.apiUrl}/api/user/${user._id}/fullProfile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLocalProfile(resp.data);
      // сброс селекции
      setSelectedTracks(new Set());
    } catch (e) {
      console.error('Ошибка при обновлении профиля', e.message);
      showToast('Не удалось обновить профиль', 'error');
    }
  };

  const toggleSelect = (track) => {
    const next = new Set(selectedTracks);
    if (next.has(track)) next.delete(track);
    else next.add(track);
    setSelectedTracks(next);
  };

  const loadBookmarksByStatus = async (statusId) => {
    setSelectedStatus(statusId);
    setLoading(true);
    try {
      console.debug('loadBookmarksByStatus ->', statusId);
      const resp = await axios.get(`${config.apiUrl}/api/bookmark/${user._id}/bookmarksByStatus`, { params: { statusId }, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const list = resp.data.bookmarks || [];
      console.debug('bookmarksByStatus returned', list.length);
      setBookmarksForStatus(list);
    } catch (e) {
      console.error('Ошибка при загрузке закладок по статусу', e.message);
      showToast('Ошибка при загрузке закладок', 'error');
    } finally {
      setLoading(false);
    }
  };
  const applyTrackToBase = async (trackNumber) => {
    if (!role || role !== 'admin') return showToast('Доступ запрещён', 'error');
    const confirm = await openConfirm(`Создать/обновить трек ${trackNumber} в общей базе?`);
    if (!confirm) return;
    try {
      setLoading(true);
      // используем addTrack - обновит или создаст
      await axios.post(`${config.apiUrl}/api/track/addTrack`, { track: trackNumber, status: selectedStatus || massStatus, date: new Date().toISOString() }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      showToast('Трек применён в базе', 'success');
      // обновим представление
      if (selectedStatus) await loadBookmarksByStatus(selectedStatus);
      await refreshProfile();
    } catch (e) {
      console.error('Ошибка при применении трека в базе', e.message);
      showToast('Ошибка при применении трека', 'error');
    } finally {
      setLoading(false);
    }
  };





  const selectStatus = (status) => {
    const next = new Set(selectedTracks);
    const list = localProfile.tracksByStatus[status] || [];
    list.forEach(t => next.add(t.track));
    setSelectedTracks(next);
  };

  // Выбрать все закладки, показанные в текущем фильтре статуса
  const selectAllInBookmarks = () => {
    const next = new Set(selectedTracks);
    (bookmarksForStatus || []).forEach(b => next.add(b.trackNumber));
    setSelectedTracks(next);
  };

  // Снять выбор у закладок в текущем фильтре
  const clearSelectionInBookmarks = () => {
    const next = new Set(selectedTracks);
    (bookmarksForStatus || []).forEach(b => next.delete(b.trackNumber));
    setSelectedTracks(next);
  };

  // Массовая смена статуса у выбранных закладок
  const handleBulkChangeBookmarksStatus = async () => {
    if (!role || role !== 'admin') return showToast('Доступ запрещён', 'error');
    if (!massStatus) return showToast('Выберите статус', 'error');

    const selected = Array.from(selectedTracks);
    if (!selected.length) return showToast('Нет выбранных закладок', 'error');

    const confirm = await openConfirm(`Установить статус выбранным закладкам (${selected.length})?`);
    if (!confirm) return;

    try {
      setLoading(true);
      const promises = selected.map(track =>
        axios.patch(`${config.apiUrl}/api/bookmark/${user._id}/bookmarks/${encodeURIComponent(track)}/status`, { statusId: massStatus, date: (massDate || new Date().toISOString()) }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
          .then(() => ({ track, ok: true }))
          .catch(err => ({ track, ok: false, err }))
      );

      const results = await Promise.all(promises);
      const okCount = results.filter(r => r.ok).length;
      const failCount = results.length - okCount;
      if (okCount) showToast(`${okCount} закладок обновлено`, 'success');
      if (failCount) showToast(`${failCount} обновить не удалось`, 'error');

      if (selectedStatus) await loadBookmarksByStatus(selectedStatus);
      await refreshProfile();
      setSelectedTracks(new Set()); // Сброс выбора после обновления
    } catch (e) {
      console.error('Ошибка при массовом обновлении статусов закладок', e?.response?.data || e.message);
      showToast('Ошибка при массовом обновлении', 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteTrack = async (trackNumber) => {
    if (!role || role !== 'admin') return showToast('Доступ запрещён', 'error');
    const confirm = await openConfirm(`Удалить трек ${trackNumber} из системы? Это действие повлияет на всех пользователей.`);
    if (!confirm) return;
    try {
      await axios.delete(`${config.apiUrl}/api/track/${trackNumber}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      showToast('Трек удалён', 'success');
      await refreshProfile();
    } catch (e) {
      console.error('Ошибка удаления трека', e.message);
      if (e.response && e.response.status === 401) showToast('Требуется авторизация администратора', 'error');
      else showToast('Ошибка при удалении трека', 'error');
    }
  };

  const handleUnlinkBookmark = async (trackNumber) => {
    const confirm = await openConfirm(`Удалить закладку ${trackNumber} у пользователя?`);
    if (!confirm) return;
    try {
      await axios.delete(`${config.apiUrl}/api/bookmark/${user._id}/delete/${trackNumber}`);
      showToast('Закладка удалена у пользователя', 'success');
      await refreshProfile();
    } catch (e) {
      console.error('Ошибка при отвязке закладки', e.message);
      showToast('Ошибка при удалении закладки', 'error');
    }
  };

  return (
    <div className="focused-user-card">
      <div className="focused-header">
        <div className="header-left">
          <div className="avatar">{user.profilePhoto ? <img src={user.profilePhoto} alt="avatar" /> : <div className="avatar-fallback">{(user.name||'')[0]}</div>}</div>
          <div>
            <h3 className="user-name">{user.name} {user.surname}</h3>
            <div className="user-sub">{user.selectedFilial || 'Филиал не указан'} • <span className="muted">{user.role}</span></div>
          </div>
        </div>

        <div className="focused-actions">
          <button onClick={onClose} className="btn-cancel">Закрыть</button>
        </div>
      </div>

      <div className="focused-grid">
        <div className="focused-col info-col">
          <h4>Информация</h4>
          <div className="info-row"><span>PersonalId:</span><strong>{user.personalId || '—'}</strong></div>
          <div className="info-row"><span>Телефон:</span><strong>{user.phone || '—'}</strong></div>
          <div className="info-row"><span>Дата регистрации:</span><strong>{new Date(user.createdAt).toLocaleString()}</strong></div>
          <div className="info-row"><span>Бонусы:</span><strong>{user.bonuses ?? 0}</strong></div>
        </div>

        <div className="focused-col invoices-col">
          <h4>Счета</h4>
          {localProfile.invoices && localProfile.invoices.length ? (
            <div className="invoices-list">
              {localProfile.invoices.map((inv, i) => (
                <div key={i} className={`invoice-entry ${inv.status === 'paid' ? 'paid' : 'pending'}`}>
                  <div className="invoice-left">
                    <div className="invoice-date">{new Date(inv.date).toLocaleDateString()}</div>
                    <div className="invoice-desc">{inv.itemCount} шт • {inv.totalWeight} кг • {inv.totalAmount} тг</div>
                  </div>
                  <div className="invoice-right">
                    <div className={`badge ${inv.status === 'paid' ? 'badge-paid' : 'badge-pending'}`}>{inv.status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Счета отсутствуют</p>
          )}
        </div>

        <div className="focused-col tracks-col">
          <h4>Треки</h4>
          <p className="muted" style={{marginTop:6}}>Фильтры и массовые операции — ниже. Нажмите «Открыть треки», чтобы начать работу.</p>
          <div style={{marginTop:8}}>
            <button className="filter-point" onClick={() => { setBookmarksForStatus(localProfile.user.bookmarks || []); setSelectedStatus('all'); }}>Открыть треки</button>
          </div>
        </div>
      </div>

      <div className={`tracks-section ${expandedTracks ? 'expanded' : ''}`}>
        <div className="tracks-header">
          <h4>Треки</h4> 
          <div className="tracks-controls">
            <button className="filter-point" onClick={() => { setBookmarksForStatus(localProfile.user.bookmarks || []); setSelectedStatus('all'); }}>Все треки</button>
            {statuses.map(s => {
              const count = (profileData.user.bookmarks || []).filter(b => String(b.currentStatus) === String(s._id)).length;
              const active = String(selectedStatus) === String(s._id);
              return (
                <button key={s._id} className={`filter-point ${active ? 'active' : ''}`} onClick={() => loadBookmarksByStatus(s._id)}>
                  <span className="status-text-inner">{s.statusText}</span>
                  <span className="status-count">{count}</span>
                </button>
              );
            })}
            <button className="filter-point secondary" onClick={() => { setBookmarksForStatus((localProfile.user.bookmarks || []).filter(b => b.trackId)); setSelectedStatus('inBase'); }}>Добавлен в базу</button>
            {!isFullLoaded && (
              <button className="filter-point secondary" onClick={async () => {
                try {
                  setLoading(true);
                  const resp = await axios.get(`${config.apiUrl}/api/user/${encodeURIComponent(user._id)}/fullProfile`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                  });
                  setLocalProfile(resp.data);
                  setIsFullLoaded(true);
                  showToast('Полная история загружена', 'success');
                } catch (err) {
                  console.error('Ошибка при загрузке полной истории', err.message);
                  showToast('Ошибка при загрузке полной истории', 'error');
                } finally {
                  setLoading(false);
                }
              }}>Загрузить полную историю</button>
            )}

            <div style={{display:'flex', gap:8, marginLeft:10, alignItems:'center', flexWrap:'wrap'}}>
              <button className="filter-point secondary action-btn" onClick={selectAllInBookmarks}>Выбрать всё</button>
              <button className="filter-point secondary action-btn" onClick={clearSelectionInBookmarks}>Снять выбор</button>
              {selectedCount ? <div className="track-count-badge">{selectedCount}</div> : null}
              <div style={{display:'flex', gap:6, alignItems:'center'}}>
                <select value={massStatus} onChange={e => setMassStatus(e.target.value)}>
                  <option value="">Выбрать статус</option>
                  {statuses.map(s => <option key={s._id} value={s._id}>{s.statusText}</option>)}
                </select>
                <input type="date" value={massDate} onChange={e => setMassDate(e.target.value)} />
                <button className="filter-point bulk-action primary" onClick={handleBulkChangeBookmarksStatus} disabled={loading || selectedTracks.size === 0 || !massStatus}>Обновить выбранные</button>
                <button className="filter-point bulk-action danger" onClick={handleBulkDeleteClient} disabled={loading || selectedTracks.size === 0}>Подтвердить</button>
                {role === 'admin' && <button className="filter-point bulk-action danger" onClick={handleBulkDeleteClientAndBase} disabled={loading || selectedTracks.size === 0}>Удалить выбранные из базы</button>}
              </div>

              <div style={{display:'flex', gap:12, alignItems:'center', marginLeft:8, marginTop:6}}>
                <input type="range" min="220" max="900" value={listHeight} onChange={e => setListHeight(Number(e.target.value))} className="tracks-slider" />
                <div className="slider-track-value">{listHeight}px</div>
                <button className="filter-point" onClick={() => setExpandedTracks(!expandedTracks)}>{expandedTracks ? 'Свернуть' : 'Расширить'}</button>
              </div>
            </div>
          </div>
        </div>

        {/* info about active filter */}
        {(selectedStatus) ? (() => {
          const ss = statuses.find(s => String(s._id) === String(selectedStatus));
          const cnt = (bookmarksForStatus || []).length;
          return <div className="tracks-filter-info" style={{margin:'8px 0 12px 0',display:'flex',alignItems:'center',gap:10}}><strong>Фильтр:</strong> <span style={{padding:'6px 10px',background:'#f3f6f3',borderRadius:8}}>{ss ? ss.statusText : selectedStatus} <span style={{opacity:0.8,marginLeft:8}}>({cnt})</span></span></div>;
        })() : null}

        <div className={`tracks-list ${expandedTracks ? 'expanded' : ''}`} style={{ maxHeight: listHeight, overflowY: 'auto', width: '100%' }}>
          {bookmarksForStatus && bookmarksForStatus.length ? (
            bookmarksForStatus.map((b, i) => (
              <div key={i} className="track-item" style={{position:'relative'}}>
                <div className="track-item-left">
                  <input type="checkbox" checked={selectedTracks.has(b.trackNumber)} onChange={() => toggleSelect(b.trackNumber)} />
                  <div>
                    <div><strong style={{color:'#111'}}>{b.trackNumber}</strong> <small className="muted">{b.description || ''}</small></div>
                    <div className="muted">Добавлено: {new Date(b.createdAt).toLocaleString()}</div>
                    {b.statusDate ? <div className="muted">Дата статуса: {new Date(b.statusDate).toLocaleDateString()}</div> : null}
                  </div>
                </div>
                <div className="track-item-right">
                  {/* three-dot menu */}
                  <button className="more-btn" onClick={() => setOpenMenu(openMenu === b.trackNumber ? null : b.trackNumber)}>⋮</button>
                  {openMenu === b.trackNumber && (
                    <div className="more-menu" onMouseLeave={() => setOpenMenu(null)}>
                      <button onClick={() => { openEditBookmark(b); setOpenMenu(null); }}>Редактировать</button>
                      <button onClick={() => { handleUnlinkBookmark(b.trackNumber); setOpenMenu(null); }}>Убрать у клиента</button>
                      {role === 'admin' && <button onClick={() => { handleDeleteTrack(b.trackNumber); setOpenMenu(null); }}>Удалить из базы</button>}
                      {role === 'admin' && <button onClick={() => { applyTrackToBase(b.trackNumber); setOpenMenu(null); }}>Добавить в базу</button>}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            (localProfile.tracksByStatus && Object.keys(localProfile.tracksByStatus).length) ? (
              Object.entries(localProfile.tracksByStatus).map(([status, tracks]) => (
                <div key={status} className="status-group">
                  <h5>{status} <small className="muted">({tracks.length})</small> <button className="filter-point" onClick={() => selectStatus(status)} style={{marginLeft:10}}>Выбрать все в статусе</button></h5>
                  {tracks.map((t, idx) => (
                    <div key={idx} className="track-entry" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div style={{display:'flex',gap:10,alignItems:'center'}}>
                        <input type="checkbox" checked={selectedTracks.has(t.track)} onChange={() => toggleSelect(t.track)} />
                        <div>
                          <div className="track-main"><strong>{t.track}</strong>{t.notFound && <em className="muted"> (Добавлен вручную)</em>}</div>
                          {t.history && t.history.length ? (
                            <details className="track-history">
                              <summary>История ({t.history.length})</summary>
                              <ul>
                                {t.history.map((h, j) => (
                                  <li key={j}>{new Date(h.date).toLocaleString()} — {h.statusText || (h.status && h.status.statusText) || h.description || ''}</li>
                                ))}
                              </ul>
                            </details>
                          ) : null}
                        </div>
                      </div>

                      <div style={{display:'flex',gap:8}}>
                        <button className="filter-point" onClick={() => openEditBookmark({ trackNumber: t.track, description: t.description })}>Редактировать</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="muted">Треки отсутствуют</p>
            )
          )}
        </div>



        {editModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h3>Редактировать закладку</h3>
              <div className="modal-fields">
                <label>Трек</label>
                <input value={editForm.newTrackNumber} onChange={e => setEditForm({ ...editForm, newTrackNumber: e.target.value })} />
                <label>Описание</label>
                <input value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button className="filter-point" onClick={submitEditBookmark} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
                <button className="btn-cancel" onClick={closeEditModal}>Отмена</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}