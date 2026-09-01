import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../action/course';
import { showToast } from './Toast';
import '../components/styles/announcement.css';
import './dashboard/css/admin.css';

const initialForm = {
  title: '',
  youtubeUrl: '',
  description: '',
  image: null
};

const getYoutubeEmbedUrl = (value) => {
  if (!value) return '';
  const trimmed = value.trim();
  const match = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/i);
  const videoId = match ? match[1] : null;
  if (!videoId) return trimmed;
  return `https://www.youtube.com/embed/${videoId}`;
};

const CourseManager = () => {
  const dispatch = useDispatch();
  const { courses = [], loading } = useSelector(state => state.courses || {});
  const currentUser = useSelector(state => state.user.currentUser);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [...courses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return courses
      .filter(item =>
        item.title?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.youtubeUrl?.toLowerCase().includes(term)
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [courses, searchTerm]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files && files[0] ? files[0] : null }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      showToast('Введите название курса', 'error');
      return;
    }

    if (!formData.youtubeUrl?.trim()) {
      showToast('Укажите ссылку на YouTube', 'error');
      return;
    }

    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('youtubeUrl', formData.youtubeUrl);
      fd.append('description', formData.description || '');
      if (formData.image) {
        fd.append('image', formData.image);
      }

      if (editingId) {
        await dispatch(updateCourse(editingId, fd));
        showToast('Курс обновлен', 'success');
      } else {
        await dispatch(createCourse(fd));
        showToast('Курс создан', 'success');
      }

      resetForm();
      dispatch(fetchCourses());
    } catch (error) {
      showToast(error?.response?.data?.message || 'Ошибка при сохранении курса', 'error');
    }
  };

  const handleEdit = (course) => {
    setFormData({
      title: course.title || '',
      youtubeUrl: course.youtubeUrl || '',
      description: course.description || '',
      image: null
    });
    setEditingId(course._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить курс?')) return;
    try {
      await dispatch(deleteCourse(id));
      showToast('Курс удалён', 'success');
      dispatch(fetchCourses());
    } catch (error) {
      showToast(error?.response?.data?.message || 'Ошибка при удалении курса', 'error');
    }
  };

  if (currentUser?.role !== 'admin') {
    return <div className="announcement-manager"><p>Доступ запрещен</p></div>;
  }

  return (
    <div className="mainAdmin">
      <div className="announcement-page">
        <div className="announcement-header">
          <h1>Управление курсами</h1>
          <div className="announcement-actions-top">
            <input
              type="text"
              placeholder="Поиск по названию, описанию, ссылке..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="announcement-search"
            />
            <button className="btn-create" onClick={() => setShowForm(prev => !prev)}>
              {showForm ? '✕ Закрыть форму' : '+ Новый курс'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="announcement-panel">
            <form onSubmit={handleSubmit} className="announcement-form">
              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="title">Название курса *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Например: Как добавить свои посылки на сайте"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="youtubeUrl">Ссылка на YouTube *</label>
                  <input
                    type="url"
                    id="youtubeUrl"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Необязательно. Если добавите, описание будет отображаться на странице курса."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Изображение</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingId ? '💾 Обновить' : '💾 Создать'}
                </button>
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="announcements-list">
          <div className="announcements-list-header">
            <h2>Список курсов ({filteredCourses.length})</h2>
          </div>

          {loading ? (
            <p className="loading-text">Загрузка...</p>
          ) : filteredCourses.length === 0 ? (
            <p className="empty-text">Курсов не найдено</p>
          ) : (
            <div className="announcements-grid">
              {filteredCourses.map((course) => (
                <div key={course._id} className="announcement-card priority-medium">
                  {course.image && (
                    <div className="announcement-image">
                      <img src={`${course.image}`} alt={course.title} />
                    </div>
                  )}

                  <div className="announcement-content">
                    <div className="announcement-title-row">
                      <h3>{course.title}</h3>
                    </div>

                    <div className="course-video-wrap">
                      <iframe
                        src={getYoutubeEmbedUrl(course.youtubeUrl)}
                        title={course.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>

                    {course.description && <p className="description">{course.description}</p>}
                    <div className="announcement-meta">
                      <span>{new Date(course.createdAt).toLocaleString('ru-RU')}</span>
                    </div>
                  </div>

                  <div className="announcement-actions">
                    <button className="btn-edit" onClick={() => handleEdit(course)}>✏️</button>
                    <button className="btn-delete" onClick={() => handleDelete(course._id)}>🗑️</button>
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

export default CourseManager;
