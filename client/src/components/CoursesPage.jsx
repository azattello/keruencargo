import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const getYoutubeEmbedUrl = (value) => {
  if (!value) return '';
  const trimmed = value.trim();
  const match = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/i);
  const videoId = match ? match[1] : null;
  if (!videoId) return trimmed;
  return `https://www.youtube.com/embed/${videoId}`;
};

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/course`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setCourses(response.data.courses || []);
      } catch (error) {
        console.error('Ошибка при загрузке курсов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="courses-page" style={{
      padding: '24px 16px 80px',
      maxWidth: '1200px',
      margin: '0 auto',
      background: '#f5f7f5'
    }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <Link
          to="/main"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#1f7a1f',
            color: '#fff',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 600,
            boxShadow: '0 10px 20px rgba(31, 122, 31, 0.2)'
          }}
        >
          ← На главную
        </Link>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#1c2d1c' }}>Курсы</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#5d675d' }}>Загрузка...</div>
      ) : !courses.length ? (
        <div style={{
          background: '#fff',
          borderRadius: '18px',
          padding: '28px 18px',
          textAlign: 'center',
          color: '#4a574a',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
        }}>
          Пока нет доступных курсов.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px' }}>
          {courses.map(course => (
            <article key={course._id} style={{
              background: '#fff',
              borderRadius: '22px',
              padding: '18px',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              overflow: 'hidden'
            }}>
              <h2 style={{
                margin: '0 0 16px',
                fontSize: 'clamp(1.2rem, 2vw, 2rem)',
                color: '#1f2a1f',
                lineHeight: 1.3
              }}>{course.title}</h2>

              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#dfe8df',
                marginBottom: '18px'
              }}>
                <iframe
                  src={getYoutubeEmbedUrl(course.youtubeUrl)}
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 0
                  }}
                />
              </div>

              {(course.image || course.description) && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 320px) minmax(0, 1fr)',
                  gap: '18px',
                  alignItems: 'start'
                }}>
                  {course.image && (
                    <img
                      src={`${config.apiUrl}${course.image}`}
                      alt={course.title}
                      style={{
                        width: '100%',
                        maxHeight: '260px',
                        objectFit: 'cover',
                        borderRadius: '14px',
                        display: 'block'
                      }}
                    />
                  )}

                  {course.description && (
                    <div style={{
                      color: '#3b473b',
                      fontSize: '1rem',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {course.description}
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
