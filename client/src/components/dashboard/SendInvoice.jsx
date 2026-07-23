import React, { useState, useEffect, useCallback } from 'react';
import config from '../../config';
import axios from 'axios';
import './css/SendInvoice.css';
import searchIcon from '../../assets/img/search.png';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '-';
  return `${Number(amount).toLocaleString('ru-RU')} ₸`;
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: '#fff3cd', text: '#856404', label: 'Не оплачено' },
    paid: { bg: '#d4edda', text: '#155724', label: 'Оплачено' },
    cancelled: { bg: '#f8d7da', text: '#721c24', label: 'Отменено' }
  };
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '12px',
      backgroundColor: config.bg,
      color: config.text,
      fontSize: '12px',
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }}>
      {config.label}
    </span>
  );
};

const InvoiceRow = ({ invoice, onRowClick, onEdit, onDelete }) => (
  <tr
    style={{
      backgroundColor: '#fff',
      transition: 'background-color 0.2s, transform 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#f0f5fb';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = '#fff';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    onClick={() => onRowClick(invoice)}
  >
    <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {invoice.invoiceNumber || '-'}
    </td>
    <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1a4a7a', fontWeight: 600 }}>
      {invoice.userName}
    </td>
    <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {invoice.userPhone}
    </td>
    <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', width: '120px', textAlign: 'right' }}>
      {formatCurrency(invoice.amount)}
    </td>
    <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', width: '110px' }}>
      {formatDate(invoice.date)}
    </td>
    <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', width: '120px' }}>
      <StatusBadge status={invoice.status} />
    </td>
    <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', width: '100px', textAlign: 'center' }}>
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(invoice); }}
        style={{ padding: '4px 8px', marginRight: '4px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
      >
        ✎
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(invoice); }}
        style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
      >
        ✕
      </button>
    </td>
  </tr>
);

const SendInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    itemCount: '',
    totalWeight: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Edit/View modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Debounce invoice search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = {
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : '',
        search: debouncedSearch
      };
      
      const response = await axios.get(`${config.apiUrl}/api/user/admin/invoices`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      setInvoices(response.data.invoices || []);
      setTotal(response.data.totalCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при загрузке счетов');
      console.error('Ошибка при загрузке счетов:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  // Search users
  const handleUserSearch = useCallback(async (query) => {
    setUserSearch(query);
    if (!query.trim()) {
      setUserSearchResults([]);
      return;
    }

    setIsSearchingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.apiUrl}/api/user/admin/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserSearchResults(response.data || []);
    } catch (err) {
      console.error('Ошибка при поиске пользователей:', err);
      setUserSearchResults([]);
    } finally {
      setIsSearchingUsers(false);
    }
  }, []);

  // Create invoice
  const handleCreateInvoice = async () => {
    if (!selectedUser) {
      setError('Выберите клиента');
      return;
    }
    if (!formData.amount) {
      setError('Укажите сумму');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${config.apiUrl}/api/user/${selectedUser._id}/invoice`, {
        totalAmount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        itemCount: formData.itemCount ? parseInt(formData.itemCount, 10) : 0,
        totalWeight: formData.totalWeight ? parseFloat(formData.totalWeight) : 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Счет успешно создан!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Reset form
      setShowModal(false);
      setSelectedUser(null);
      setUserSearch('');
      setUserSearchResults([]);
      setFormData({ amount: '', description: '', itemCount: '', totalWeight: '', date: new Date().toISOString().split('T')[0] });
      
      // Refresh list
      setPage(1);
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании счета');
    }
  };

  // View/Edit invoice
  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setEditingInvoice(true);
    setEditFormData({
      status: invoice.status,
      description: invoice.description || '',
      itemCount: invoice.itemCount || 0,
      totalWeight: invoice.totalWeight || 0
    });
    setShowInvoiceModal(true);
  };

  const handleSaveInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${config.apiUrl}/api/user/${selectedInvoice.userId}/invoice/${selectedInvoice._id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Счет обновлен!');
      setTimeout(() => setSuccess(''), 3000);
      setShowInvoiceModal(false);
      setEditingInvoice(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении счета');
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    if (!window.confirm(`Удалить счет ${invoice.invoiceNumber || invoice._id}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${config.apiUrl}/api/user/${invoice.userId}/invoice/${invoice._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Счет удален!');
      setTimeout(() => setSuccess(''), 3000);
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при удалении счета');
    }
  };

  const onLimitChange = (e) => {
    setLimit(parseInt(e.target.value));
    setPage(1);
  };

  return (
    <div className="mainAdmin">
    <div style={{ width: 'calc(100% - 250px)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ margin: 0, color: '#1f4e79', fontSize: '28px', fontWeight: 700 }}>📋 Управление счетами</h1>

      {/* Search and filter bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e6ebf2' }}>
        <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <img src={searchIcon} alt="search" style={{ position: 'absolute', left: '10px', width: '18px', opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Поиск по клиенту, телефону, счету..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 36px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontFamily: 'inherit',
              fontSize: '14px'
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            minWidth: '150px',
            cursor: 'pointer'
          }}
        >
          <option value="all">Все статусы</option>
          <option value="pending">Не оплачено</option>
          <option value="paid">Оплачено</option>
          <option value="cancelled">Отменено</option>
        </select>

        <button
          onClick={() => {
            setShowModal(true);
            setSelectedUser(null);
            setUserSearch('');
            setUserSearchResults([]);
            setFormData({ invoiceNumber: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
          }}
          style={{
            padding: '10px 16px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
        >
          Новый счет
        </button>
      </div>

      {/* Table */}
      <div style={{ borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'auto', border: '1px solid #e6ebf2', background: '#fff' }}>
        <div style={{ minWidth: '900px', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef', fontWeight: 600, color: '#545454' }}>Счет</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef', fontWeight: 600, color: '#545454' }}>Клиент</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef', fontWeight: 600, color: '#545454' }}>Телефон</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e9ecef', fontWeight: 600, color: '#545454' }}>Сумма</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef', fontWeight: 600, color: '#545454' }}>Дата</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef', fontWeight: 600, color: '#545454' }}>Статус</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef', fontWeight: 600, color: '#545454' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Загрузка...</td>
                </tr>
              )}
              {!isLoading && invoices.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Счетов не найдено</td>
                </tr>
              )}
              {!isLoading && invoices.map((invoice) => (
                <InvoiceRow
                  key={invoice._id}
                  invoice={invoice}
                  onRowClick={() => {
                    setSelectedInvoice(invoice);
                    setEditingInvoice(false);
                    setShowInvoiceModal(true);
                  }}
                  onEdit={handleEditInvoice}
                  onDelete={handleDeleteInvoice}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: page === 1 ? 'not-allowed' : 'pointer', backgroundColor: page === 1 ? '#f0f0f0' : '#fff' }}>← Назад</button>
          <div style={{ alignSelf: 'center', color: '#666', fontSize: '14px' }}>Страница {page} из {totalPages}</div>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: page === totalPages ? 'not-allowed' : 'pointer', backgroundColor: page === totalPages ? '#f0f0f0' : '#fff' }}>Вперед →</button>
        </div>
        <select value={limit} onChange={onLimitChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer' }}>
          {[50, 100, 200].map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      {/* Modal: Create Invoice */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1f4e79', fontSize: '20px' }}>Создать счет</h2>

            {/* User search */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>Выберите клиента</label>
              {!selectedUser ? (
                <>
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="Поиск клиента..."
                      value={userSearch}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  {isSearchingUsers && <div style={{ color: '#999', fontSize: '12px' }}>Поиск...</div>}
                  {userSearchResults.length > 0 && (
                    <div style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      maxHeight: '200px',
                      overflow: 'auto',
                      marginBottom: '12px'
                    }}>
                      {userSearchResults.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => {
                            setSelectedUser(user);
                            setUserSearch('');
                            setUserSearchResults([]);
                          }}
                          style={{
                            padding: '10px 12px',
                            borderBottom: '1px solid #f0f0f0',
                            cursor: 'pointer',
                            backgroundColor: '#fff',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                          <div style={{ fontWeight: 600, color: '#1a4a7a' }}>{user.name} {user.surname}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>{user.phone} • {user.personalId}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1a4a7a' }}>{selectedUser.name} {selectedUser.surname}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{selectedUser.phone}</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setUserSearch('');
                    }}
                    style={{ padding: '4px 8px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', color: '#666' }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Form fields */}
            {selectedUser && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#333' }}>Номер счета</label>
                  <div style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#f8f9fa', color: '#333' }}>
                    Генерируется автоматически из Personal ID и последовательности XXX-0001
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#333' }}>Сумма (₸) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    step="0.01"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#333' }}>Количество (шт)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.itemCount}
                      onChange={(e) => setFormData({ ...formData, itemCount: e.target.value })}
                      placeholder="0"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#333' }}>Вес (кг)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.totalWeight}
                      onChange={(e) => setFormData({ ...formData, totalWeight: e.target.value })}
                      placeholder="0"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#333' }}>Дата</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#333' }}>Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Описание услуги или товара"
                    rows="3"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleCreateInvoice}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ✓ Отправить счет
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#6c757d',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ✕ Отмена
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal: View/Edit Invoice */}
      {showInvoiceModal && selectedInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1f4e79', fontSize: '20px' }}>
              {editingInvoice ? 'Редактировать счет' : 'Информация о счете'}
            </h2>

            <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#999' }}>Клиент</div>
                <div style={{ fontWeight: 600, color: '#1a4a7a' }}>{selectedInvoice.userName}</div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#999' }}>Телефон</div>
                <div style={{ fontWeight: 600 }}>{selectedInvoice.userPhone}</div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#999' }}>Personal ID</div>
                <div style={{ fontWeight: 600 }}>{selectedInvoice.personalId}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Номер счета</div>
                  <div style={{ fontWeight: 600, color: '#333' }}>{selectedInvoice.invoiceNumber || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Сумма</div>
                  <div style={{ fontWeight: 600, color: '#333' }}>{formatCurrency(selectedInvoice.amount)}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Дата</div>
                  <div style={{ fontWeight: 600, color: '#333' }}>{formatDate(selectedInvoice.date)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Статус</div>
                  {editingInvoice ? (
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="pending">Не оплачено</option>
                      <option value="paid">Оплачено</option>
                      <option value="cancelled">Отменено</option>
                    </select>
                  ) : (
                    <div><StatusBadge status={selectedInvoice.status} /></div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Количество</div>
                  {editingInvoice ? (
                    <input
                      type="number"
                      min="0"
                      value={editFormData.itemCount}
                      onChange={(e) => setEditFormData({ ...editFormData, itemCount: e.target.value })}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  ) : (
                    <div style={{ fontWeight: 600, color: '#333' }}>{selectedInvoice.itemCount || '-'} шт</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Вес</div>
                  {editingInvoice ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editFormData.totalWeight}
                      onChange={(e) => setEditFormData({ ...editFormData, totalWeight: e.target.value })}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  ) : (
                    <div style={{ fontWeight: 600, color: '#333' }}>{selectedInvoice.totalWeight || '-'} кг</div>
                  )}
                </div>
              </div>
            </div>

            {(selectedInvoice.description || editingInvoice) && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#333' }}>Описание</label>
                {editingInvoice ? (
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows="4"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                ) : (
                  <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '6px', color: '#666' }}>
                    {selectedInvoice.description || '-'}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              {editingInvoice ? (
                <>
                  <button
                    onClick={handleSaveInvoice}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#1976d2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ✓ Сохранить
                  </button>
                  <button
                    onClick={() => {
                      setEditingInvoice(false);
                      setEditFormData({});
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#6c757d',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ✕ Отмена
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditingInvoice(true)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#1976d2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ✎ Редактировать
                  </button>
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#6c757d',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ✕ Закрыть
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          backgroundColor: '#dc3545',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '6px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          maxWidth: '400px'
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          backgroundColor: '#28a745',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '6px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          maxWidth: '400px'
        }}>
          {success}
        </div>
      )}
    </div>
    </div>
  );
};

export default SendInvoice;
