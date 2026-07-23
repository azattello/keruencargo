import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../action/announcement';
import { showToast } from './Toast';
import '../components/styles/announcement.css';
import './dashboard/css/admin.css';

const AnnouncementManager = () => {
  const dispatch = useDispatch();
  const { announcements = [], loading } = useSelector(state => state.announcements);
  const currentUser = useSelector(state => state.user.currentUser);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    image: '',
    priority: 'low'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const filteredAnnouncements = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [...announcements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return announcements
      .filter(item =>
        item.title?.toLowerCase().includes(term) ||
        item.message?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        String(item.priority).toLowerCase().includes(term)
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [announcements, searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      showToast('Заполните обязательные поля', 'error');
      return;
    }

    try {
      if (editingId) {
        await dispatch(updateAnnouncement(editingId, formData));
        showToast('Объявление обновлено', 'success');
      } else {
        await dispatch(createAnnouncement(formData));
        showToast('Объявление создано', 'success');
      }

      setFormData({ title: '', message: '', image: '', priority: 'low' });
      setEditingId(null);
      setShowForm(false);
      dispatch(fetchAnnouncements());
    } catch (error) {
      showToast('Ошибка при сохранении объявления', 'error');
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title || '',
      message: announcement.message || '',
      image: announcement.image || '',
      priority: announcement.priority || 'low'
    });
    setEditingId(announcement._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) return;
    try {
      await dispatch(deleteAnnouncement(id));
      showToast('Объявление удалено', 'success');
      dispatch(fetchAnnouncements());
    } catch (error) {
      showToast('Ошибка при удалении объявления', 'error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', message: '', image: '', priority: 'low' });
  };

  if (currentUser?.role !== 'admin') {
    return <div className="announcement-manager"><p>Доступ запрещен</p></div>;
  }

  return (
    <div className="mainAdmin">
    <div className="announcement-page">
      <div className="announcement-header">
        <h1>Управление объявлениями</h1>
        <div className="announcement-actions-top">
          <input
            type="text"
            placeholder="Поиск по заголовку, тексту, приоритету..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="announcement-search"
          />
          <button className="btn-create" onClick={() => setShowForm(prev => !prev)}>
            {showForm ? '✕ Закрыть форму' : '+ Новое объявление'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="announcement-panel">
          <form onSubmit={handleSubmit} className="announcement-form">
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="title">Заголовок *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Введите заголовок"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="priority">Приоритет</label>
                <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="high">Высокий</option>
                  <option value="medium">Средний</option>
                  <option value="low">Низкий</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Сообщение *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Введите сообщение"
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">URL изображения</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">
                {editingId ? '💾 Обновить' : '💾 Создать'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="announcements-list">
        <div className="announcements-list-header">
          <h2>Список объявлений ({filteredAnnouncements.length})</h2>
        </div>

        {loading ? (
          <p className="loading-text">Загрузка...</p>
        ) : filteredAnnouncements.length === 0 ? (
          <p className="empty-text">Объявлений не найдено</p>
        ) : (
          <div className="announcements-grid">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement._id} className={`announcement-card priority-${announcement.priority}`}>
                {announcement.image && (
                  <div className="announcement-image">
                    <img src={announcement.image} alt={announcement.title} />
                  </div>
                )}
                <div className="announcement-content">
                  <div className="announcement-title-row">
                    <h3>{announcement.title}</h3>
                    <span className={`tag tag-${announcement.priority}`}>{announcement.priority}</span>
                  </div>
                  <p className="message">{announcement.message}</p>
                  {announcement.description && <p className="description">{announcement.description}</p>}
                  <div className="announcement-meta">
                    <span>{new Date(announcement.createdAt).toLocaleString('ru-RU')}</span>
                    <span className="status-tag">{announcement.status || 'active'}</span>
                  </div>
                </div>
                <div className="announcement-actions">
                  <button className="btn-edit" onClick={() => handleEdit(announcement)}>✏️</button>
                  <button className="btn-delete" onClick={() => handleDelete(announcement._id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default AnnouncementManager;
