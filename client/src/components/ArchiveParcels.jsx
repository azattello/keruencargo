import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import { useSelector } from 'react-redux';
import './styles/parcels2.css';
import { FaCheckCircle } from 'react-icons/fa';


const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ArchiveParcels = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [notFoundBookmarks, setNotFoundBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookmarks, setTotalBookmarks] = useState(0);

  const userId = useSelector(state => state.user.currentUser?.id);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        console.log('Загрузка архивных закладок...');
        const bookmarksResponse = await axios.get(`${config.apiUrl}/api/bookmark/archives/${userId}?page=${currentPage}`);
        
        console.log('Получены данные:', bookmarksResponse.data);

        setBookmarks(bookmarksResponse.data.archive || []);
        setNotFoundBookmarks(bookmarksResponse.data.notFoundBookmarks || []);
        setTotalPages(bookmarksResponse.data.totalPages || 1);
        setTotalBookmarks(bookmarksResponse.data.totalArchives || 0);

        setLoading(false);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchBookmarks();
    }
  }, [userId, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="bookmark-summary">
        <div>Загрузка ...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="bookmark-summary">
        <p>Показано {bookmarks.length + notFoundBookmarks.length} из {totalBookmarks} архивированных посылок</p>
      </div>

      <div className="bookmarks-list">
        {bookmarks.map((bookmark) => (
          <div className="bookmark-card" key={bookmark._id}>
            <div className="bookmark-header" style={{ backgroundColor: "#4caf50" }}>
              <h2 className="bookmark-h2">{bookmark.trackNumber}</h2>
            </div>

            <div className="statuses-bookmark">
              <p className="description">{bookmark.description}</p>

              <div className="status-item">
                <FaCheckCircle className="status-icon completed" />
                <div className="status-text">
                  <p>Дата регистрации клиентом:</p>
                  <span className="date-bookmarks">{bookmark.createdAt ? formatDate(bookmark.createdAt) : 'нет данных'}</span>
                </div>
              </div>
{/* 
              {bookmark.history && bookmark.history.map((historyItem, index) => (
                <div className="status-item" key={index}>
                  {historyItem.statusText ? (
                    <FaCheckCircle className="status-icon completed" />
                  ) : (
                    <FaTimesCircle className="status-icon pending" />
                  )}
                  <div className="status-text">
                    <p>{historyItem.statusText || 'Статус не указан'}</p>
                    <span className="date-bookmarks">
                      {historyItem.date ? formatDate(historyItem.date) : 'нет данных'}
                    </span>
                  </div>
                </div>
              ))} */}

              {bookmark.receivedAt && (
                <div className="status-item">
                  <FaCheckCircle className="status-icon completed" />
                  <div className="status-text">
                    <p>Дата получения:</p>
                    <span className='date-bookmarks'>{formatDate(bookmark.receivedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Пагинация */}
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">
          &laquo;
        </button>
        <span className="pagination-info">Страница {currentPage} из {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-button">
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default ArchiveParcels;
