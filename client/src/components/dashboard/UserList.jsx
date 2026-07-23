import React, { useState, useEffect, useCallback } from 'react';
import './css/admin.css';
import searchIcon from '../../assets/img/search.png';
import QRScanner from './QRScanner';
import axios from 'axios';
import config from '../../config';

const Badge = ({ role }) => {
  const map = {
    admin: { color: '#ff6666', text: 'admin' },
    filial: { color: '#3b82f6', text: 'filial' },
    client: { color: '#6b7280', text: 'client' }
  };
  const r = map[role] || { color: '#9ca3af', text: role || '-'};
  return <span style={{ background: r.color + '22', color: r.color, borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>{r.text}</span>;
};

const UserFilters = ({ searchTerm, setSearchTerm, filters, setFilters, filials, setSortByDate, sortByFilial, setSortByFilial, setSortByActivity }) => {
  const { role, filial } = filters;
  const clearFilter = (key) => setFilters(prev => ({ ...prev, [key]: '' }));

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center' }}>
      <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 220 }}>
        <img src={searchIcon} alt='Search' style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 16, opacity: .6 }} />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder='Поиск: personalId/телефон/имя'
          style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #d1d5db', borderRadius: 8 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setFilters(prev => ({ ...prev, role: prev.role === 'client' ? '' : 'client' }))}
          style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #cbd5e1', background: role === 'client' ? '#e0e7ff' : '#fff' }}>
          client
        </button>
        <button
          onClick={() => setFilters(prev => ({ ...prev, role: prev.role === 'filial' ? '' : 'filial' }))}
          style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #cbd5e1', background: role === 'filial' ? '#e0e7ff' : '#fff' }}>
          filial
        </button>
        <button
          onClick={() => setFilters(prev => ({ ...prev, role: prev.role === 'admin' ? '' : 'admin' }))}
          style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #cbd5e1', background: role === 'admin' ? '#fee2e2' : '#fff' }}>
          admin
        </button>

        <select value={filial || ''} onChange={(e) => setFilters(prev => ({ ...prev, filial: e.target.value }))} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
          <option value=''>Филиал</option>
          {filials.map(f => <option key={f.filial._id} value={f.filial.filialText}>{f.filial.filialText}</option>)}
        </select>

        <select onChange={(e) => setSortByDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
          <option value='latest'>Последние</option>
          <option value='oldest'>Старые</option>
        </select>

        <select value={sortByFilial} onChange={(e) => setSortByFilial(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
          <option value=''>Сортировать филиал</option>
          <option value='asc'>A → Z</option>
          <option value='desc'>Z → A</option>
        </select>

        <button onClick={() => setSortByActivity(prev => !prev)} style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #cbd5e1', background: '#fff' }}>
          Активность
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {role && <span style={{ fontSize: 12, background: '#f3f4f6', borderRadius: 999, padding: '4px 8px' }}>Роль: {role} <button style={{ border: 'none', background: 'transparent', marginLeft: 4, cursor: 'pointer' }} onClick={() => clearFilter('role')}>×</button></span>}
        {filial && <span style={{ fontSize: 12, background: '#f3f4f6', borderRadius: 999, padding: '4px 8px' }}>Филиал: {filial} <button style={{ border: 'none', background: 'transparent', marginLeft: 4, cursor: 'pointer' }} onClick={() => clearFilter('filial')}>×</button></span>}
      </div>
    </div>
  );
};

const UserRow = ({ user, onSelect, onMenu }) => (
  <div onClick={() => onSelect(user)} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr 1fr', gap: 8, padding: 12, borderBottom: '1px solid #e5e7eb', cursor: 'pointer', alignItems: 'center', background: '#fff' }}>
    <div style={{ fontWeight: 600 }}>{user.personalId || '-'}</div>
    <div>
      <div>{user.name} {user.surname}</div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{user.selectedFilial || '-'}</div>
    </div>
    <div>{user.phone || '-'}</div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Badge role={user.role} />
      <button onClick={(e) => { e.stopPropagation(); onMenu(user); }} style={{ border: 'none', background: 'transparent', fontSize: 18 }}>⋮</button>
    </div>
  </div>
);

const UserDrawer = ({ user, visible, onClose, onRefresh, userActions, filials }) => {
  const [tab, setTab] = useState('info');
  const [currentUser, setCurrentUser] = useState(user);
  const [newPassword, setNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [invoicesPerPage] = useState(5);
  const [tracksPage, setTracksPage] = useState(1);
  const [tracksPerPage] = useState(10);
  const [isMobileView, setIsMobileView] = useState(typeof window !== 'undefined' ? window.innerWidth <= 900 : true);
  const [selectedFilialForUpdate, setSelectedFilialForUpdate] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { setCurrentUser(user); }, [user]);

  const baseUser = (currentUser && currentUser.user) ? currentUser.user : (currentUser || user);
  const tracksByStatus = (currentUser && currentUser.tracksByStatus) ? currentUser.tracksByStatus : (baseUser?.tracksByStatus || {});
  const invoices = (currentUser && currentUser.invoices) ? currentUser.invoices : (baseUser?.invoices || []);

  useEffect(() => {
    if (baseUser?.selectedFilial && filials.length) {
      const foundFilial = filials.find(f => f.filial?.filialText === baseUser.selectedFilial);
      setSelectedFilialForUpdate(foundFilial ? foundFilial.filial._id : '');
    }
  }, [baseUser, filials]);

  if (!visible || !user) return null;

  const drawerStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: isMobileView ? '100%' : 500,
    maxWidth: isMobileView ? '100%' : 500,
    height: '100vh',
    background: '#fff',
    boxShadow: isMobileView ? 'none' : '-4px 0 20px rgba(0,0,0,0.15)',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    padding: isMobileView ? 12 : 20,
    overflow: 'hidden',
  };

  const refreshProfile = async () => {
    if (!baseUser?._id) return;
    try {
      const profile = await userActions.getUserProfile(baseUser._id);
      setCurrentUser(profile || baseUser);
      setStatusMessage('');
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    if (!baseUser?._id || !invoiceId) return;
    try {
      await userActions.markAsPaid(baseUser._id, invoiceId);
      setStatusMessage('Счёт отмечен оплаченным');
      await onRefresh();
      await refreshProfile();
    } catch (err) {
      setStatusMessage('Ошибка: ' + (err.message || 'не удалось'));
    }
  };

  const handlePasswordChange = async () => {
    if (!baseUser?._id || !newPassword) {
      setStatusMessage('Введите новый пароль');
      return;
    }
    try {
      await userActions.resetPassword(baseUser._id, newPassword);
      setStatusMessage('Пароль изменён');
      setNewPassword('');
      await onRefresh();
      await refreshProfile();
    } catch (err) {
      setStatusMessage('Ошибка: ' + (err.message || 'не удалось'));
    }
  };

  const handleRelease = async () => {
    if (!baseUser?._id) return;
    if (!window.confirm('Вы уверены, что хотите освободить личный код? Это действие нельзя отменить.')) return;
    try {
      await userActions.releasePersonalId(baseUser._id);
      setStatusMessage('PersonalId освобождён');
      await onRefresh();
      await refreshProfile();
    } catch (err) {
      setStatusMessage('Ошибка: ' + (err.message || 'не удалось'));
    }
  };

  const handleDelete = async () => {
    if (!baseUser?._id) return;
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await userActions.deleteUser(baseUser._id);
      setStatusMessage('Пользователь удалён');
      await onClose();
      await onRefresh();
    } catch (err) {
      setStatusMessage('Ошибка: ' + (err.message || 'не удалось'));
    }
  };
  return (
    <div className="user-profile-drawer" style={drawerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 20 }}>Профиль пользователя</h3>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 24, cursor: 'pointer' }}>×</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {['info','tracks','settings'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding: '8px 10px', borderRadius: 6, border: tab===t ? '1px solid #3b82f6' : '1px solid #d1d5db', background: tab===t ? '#eff6ff' : '#fff' }}>{t === 'info' ? 'Инфо' : t === 'tracks' ? 'Треки' : 'Настройки'}</button>
        ))}
      </div>

      <div className="user-profile-content">
        {tab === 'info' && (
          <div style={{ lineHeight:1.6 }}>
            <p><b>Имя:</b> {baseUser?.name} {baseUser?.surname}</p>
            <p><b>Телефон:</b> {baseUser?.phone}</p>
            <p><b>Филиал:</b> {baseUser?.selectedFilial}</p>
            <p><b>Дата регистрации:</b> {baseUser?.createdAt ? new Date(baseUser.createdAt).toLocaleDateString() : '-'}</p>
            <p><b>PersonalId:</b> {baseUser?.personalId || '-'}</p>
            <p><b>Пароль:</b> <input type={showPassword ? 'text' : 'password'} value={baseUser?.password || '********'} readOnly onClick={() => setShowPassword(!showPassword)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }} /></p>

            <div style={{ marginTop: 20 }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 16 }}>История счетов</h4>
              {(invoices || []).length === 0 ? (
                <p style={{ margin: 0, color: '#6b7280' }}>Счетов нет</p>
              ) : (
                <>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {(invoices || [])
                      .slice((invoicesPage - 1) * invoicesPerPage, invoicesPage * invoicesPerPage)
                      .map(inv => (
                        <div key={inv._id || inv.date} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6, padding: 8, background: '#f9fafb' }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{inv.itemCount} шт • {inv.totalWeight} кг • {inv.totalAmount} ₸</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>Дата: {inv.date ? new Date(inv.date).toLocaleDateString() : '-'} | Статус: {inv.status || 'pending'}</div>
                          </div>
                          <button onClick={() => handleMarkAsPaid(inv._id)} disabled={inv.status === 'paid'} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #10b981', background: inv.status === 'paid' ? '#d1fae5' : '#10b981', color: inv.status === 'paid' ? '#047857' : '#fff', cursor: inv.status === 'paid' ? 'not-allowed' : 'pointer' }}>
                            {inv.status === 'paid' ? 'Оплачен' : 'Отметить оплаченным'}
                          </button>
                        </div>
                      ))}
                  </div>
                  {Math.ceil((invoices || []).length / invoicesPerPage) > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                      <button onClick={() => setInvoicesPage(p => Math.max(1, p - 1))} disabled={invoicesPage === 1} style={{ padding: '4px 8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>←</button>
                      <span>Страница {invoicesPage} из {Math.ceil((invoices || []).length / invoicesPerPage)}</span>
                      <button onClick={() => setInvoicesPage(p => Math.min(Math.ceil((invoices || []).length / invoicesPerPage), p + 1))} disabled={invoicesPage === Math.ceil((invoices || []).length / invoicesPerPage)} style={{ padding: '4px 8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>→</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {tab === 'tracks' && (
          <div>
            {(() => {
              const tracks = Object.entries(tracksByStatus || {}).flatMap(([status, arr]) => arr.map(track => ({ track, statusText: status })));
              const paginatedTracks = tracks.slice((tracksPage - 1) * tracksPerPage, tracksPage * tracksPerPage);
              return tracks.length === 0 ? (
                <p>Треков нет</p>
              ) : (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Трек</th>
                        <th style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTracks.map((item, index) => {
                        const trackValue = item.track?.track || item.track?.trackNumber || item.track?.id || item.track || '-';
                        return (
                          <tr key={(trackValue && String(trackValue)) || index}>
                            <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{trackValue}</td>
                            <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{item.statusText || item.track?.status?.statusText || item.track?.status || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {Math.ceil(tracks.length / tracksPerPage) > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                      <button onClick={() => setTracksPage(p => Math.max(1, p - 1))} disabled={tracksPage === 1} style={{ padding: '4px 8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>←</button>
                      <span>Страница {tracksPage} из {Math.ceil(tracks.length / tracksPerPage)}</span>
                      <button onClick={() => setTracksPage(p => Math.min(Math.ceil(tracks.length / tracksPerPage), p + 1))} disabled={tracksPage === Math.ceil(tracks.length / tracksPerPage)} style={{ padding: '4px 8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>→</button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {tab === 'settings' && (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Сменить пароль</h4>
              <div style={{ display: 'flex', flexDirection: isMobileView ? 'column' : 'row', gap: 8, marginBottom: 8 }}>
                <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='Новый пароль' style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                <button onClick={handlePasswordChange} style={{ width: isMobileView ? '100%' : 'auto', padding: '8px 12px', borderRadius: 6, border: '1px solid #3b82f6', background: '#3b82f6', color: '#fff', cursor: 'pointer' }}>Сменить</button>
              </div>
              <div style={{ display: 'flex', flexDirection: isMobileView ? 'column' : 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <select value={selectedFilialForUpdate} onChange={(e) => setSelectedFilialForUpdate(e.target.value)} style={{ flex: 1, padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}>
                  <option value=''>Выберите филиал</option>
                  {(filials || []).map((f) => {
                    const text = f.filial?.filialText || f.name || f;
                    const value = f.filial?._id || f._id || text;
                    return <option key={value} value={value}>{text}</option>;
                  })}
                </select>
                <button onClick={async () => {
                  if (!selectedFilialForUpdate || !baseUser?._id) {
                    setStatusMessage('Выберите филиал для обновления');
                    return;
                  }
                  try {
                    await userActions.updateFilial(baseUser._id, selectedFilialForUpdate);
                    await refreshProfile();
                    await onRefresh();
                    setStatusMessage('Филиал обновлён');
                  } catch (error) {
                    setStatusMessage('Ошибка обновления филиала: ' + (error.message || 'не удалось'));
                  }
                }} style={{ width: isMobileView ? '100%' : 'auto', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Применить филиал</button>
              </div>
              <button onClick={handleRelease} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Освободить личный код</button>
              <button onClick={handleDelete} style={{ color: '#b91c1c', padding: '8px 12px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fee2e2', cursor: 'pointer' }}>Удалить пользователя</button>
              {statusMessage && <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#059669' }}>{statusMessage}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Pagination = ({ current, total, onPageChange }) => {
  const pages = Math.max(1, Math.ceil(total / 50));
  return (
    <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:10 }}>
      <button disabled={current===1} onClick={() => onPageChange(current-1)}>{'<'}</button>
      {Array.from({length:pages}, (_,i)=>i+1).slice(Math.max(0,current-3), current+2).map(page => (
        <button key={page} onClick={() => onPageChange(page)} style={{ fontWeight: page===current ? 700 : 400 }}>{page}</button>
      ))}
      <button disabled={current===pages} onClick={() => onPageChange(current+1)}>{'>'}</button>
    </div>
  );
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filials, setFilials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ role: '', filial: '' });
  const [sortByDate, setSortByDate] = useState('latest');
  const [sortByFilial, setSortByFilial] = useState('');
  const [sortByActivity, setSortByActivity] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [totalUsers, setTotalUsers] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedId, setScannedId] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const userActions = {
    createInvoice: async (userId, invoice) => await axios.post(`${config.apiUrl}/api/user/${encodeURIComponent(userId)}/invoices`, invoice),
    updateInvoice: async (userId, invoiceId, invoice) => await axios.put(`${config.apiUrl}/api/user/${encodeURIComponent(userId)}/invoices/${encodeURIComponent(invoiceId)}`, invoice),
    deleteInvoice: async (userId, invoiceId) => await axios.delete(`${config.apiUrl}/api/user/${encodeURIComponent(userId)}/invoices/${encodeURIComponent(invoiceId)}`),
    markAsPaid: async (userId, invoiceId) => await axios.patch(`${config.apiUrl}/api/user/${encodeURIComponent(userId)}/invoices/${encodeURIComponent(invoiceId)}/paid`),
    resetPassword: async (userId, password) => await axios.put(`${config.apiUrl}/api/user/update/${encodeURIComponent(userId)}`, { newPassword: password }),
    releasePersonalId: async (userId) => await axios.post(`${config.apiUrl}/api/user/releasePersonalId`, { userId }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}),
    updateFilial: async (userId, filialId) => await axios.put(`${config.apiUrl}/api/user/update/${encodeURIComponent(userId)}`, { filial: filialId }),
    getUserProfile: async (userId) => {
      const { data } = await axios.get(`${config.apiUrl}/api/user/${encodeURIComponent(userId)}/fullProfile`);
      return data;
    },
    deleteUser: async (userId) => await axios.delete(`${config.apiUrl}/api/user/delete/${encodeURIComponent(userId)}`)
  };

  const fetchFilials = async () => {
    const data = await axios.get(`${config.apiUrl}/api/filial/getFilial`);
    setFilials(data.data || []);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const trimmedSearch = searchTerm.trim();
      let data;

      if (trimmedSearch.length > 0) {
        const response = await axios.get(`${config.apiUrl}/api/user/admin/search`, {
          params: { q: trimmedSearch },
          headers
        });
        data = { users: response.data, totalCount: Array.isArray(response.data) ? response.data.length : 0 };
      } else {
        const params = {
          page: currentPage,
          limit: perPage,
          sortByDate,
          sortByFilial,
          filterByRole: filters.role,
          filterByFilial: filters.filial,
          activity: sortByActivity ? '1' : '0'
        };
        const response = await axios.get(`${config.apiUrl}/api/user/users`, { params, headers });
        data = response.data;
      }

      setUsers(data.users || data || []);
      setTotalUsers(data.totalCount || (data.users ? data.users.length : 0));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, perPage, searchTerm, sortByDate, sortByFilial, filters.role, filters.filial, sortByActivity]);

  useEffect(() => { fetchFilials(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filters.role, filters.filial, sortByDate, sortByFilial, sortByActivity]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filteredUsers = users;

  const handleScan = (text) => {
    if (!text) return;
    const normalized = String(text).trim();
    setScannedId(normalized);
    setSearchTerm(normalized);
    setIsScannerOpen(false);
  };

  const openUserDetails = async (userId) => {
    try {
      const data = await userActions.getUserProfile(userId);
      setSelectedUser(data); // сохраним полный профиль с tracksByStatus
      setDrawerVisible(true);
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      alert('Не удалось загрузить профиль пользователя');
    }
  };

  const openDrawer = (user) => {
    if (user?._id) {
      openUserDetails(user._id);
    } else {
      setSelectedUser(user);
      setDrawerVisible(true);
    }
  };

  const handleRowMenu = (user) => {
    const action = window.prompt('Выберите действие: open/edit/invoices/reset/delete', 'open');
    if (!action) return;
    const switchMap = {
      open: () => openDrawer(user),
      edit: () => { setSelectedUser(user); setDrawerVisible(true); },
      invoices: () => { setSelectedUser(user); setDrawerVisible(true); },
      reset: () => userActions.resetPassword(user._id, window.prompt('Новый пароль')),
      delete: async () => { if (window.confirm('Удалить?')) { await userActions.deleteUser(user._id); fetchUsers(); }}
    };
    switchMap[action]?.();
  };

  const isEmpty = filteredUsers.length === 0;

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f5f7fa', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1f4e79', marginBottom:'20px' }}>Пользователи</h1>
        <UserFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          filials={filials}
          setSortByDate={setSortByDate}
          sortByFilial={sortByFilial}
          setSortByFilial={setSortByFilial}
          setSortByActivity={setSortByActivity}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setIsScannerOpen(true)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff' }}>Сканировать QR</button>
          {isScannerOpen && (
            <div style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, background: '#f8fafc' }}>
              <QRScanner onScan={handleScan} />
              <p>Вставьте или отсканируйте номер:</p>
              <input
                value={scannedId}
                onChange={(e) => setScannedId(e.target.value)}
                placeholder='Телефон или personalId'
                style={{ padding: 6, width: 240, borderRadius: 6, border: '1px solid #cbd5e1', marginRight: 8 }}
              />
              <button onClick={() => { setSearchTerm(scannedId); setIsScannerOpen(false); }} style={{ padding: '6px 10px', borderRadius: 6 }}>Найти</button>
              <button onClick={() => { setIsScannerOpen(false); setScannedId(''); }} style={{ padding: '6px 10px', borderRadius: 6, background: '#f0f0f0' }}>Закрыть</button>
            </div>
          )}
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr 1.5fr 1fr', gap:8, padding:'10px 12px', background:'#f8fafc', fontWeight:700 }}>
            <div>PersonalId</div><div>Имя / Филиал</div><div>Телефон</div><div>Действия</div>
          </div>
          {isLoading ? <div style={{ padding: 16 }}>Загрузка...</div> : isEmpty ? <div style={{ padding: 16 }}>Нет пользователей</div> : filteredUsers.map(user => (
            <UserRow key={user._id || user.personalId || user.phone} user={user} onSelect={openDrawer} onMenu={handleRowMenu} />
          ))}
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 10 }}>
          <div>Всего: {totalUsers}</div>
          <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
            <span>На странице:</span>
            <select value={perPage} onChange={e => setPerPage(Number(e.target.value))} style={{ padding: 4, borderRadius: 6, border: '1px solid #d1d5db' }}>
              {[25,50,100,200].map(v=> <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <Pagination current={currentPage} total={totalUsers} onPageChange={(p)=>setCurrentPage(p)} />
      </div>

      <UserDrawer
        user={selectedUser}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onRefresh={fetchUsers}
        userActions={userActions}
        filials={filials}
      />
    </div>
  );
};

export default UserList;
