import axios from 'axios';
import config from '../config';

let configUrl = config.apiUrl;
// Функция для добавления нового трека
export const addTrack = async (track, status, date) => {
  try {
    const token = localStorage.getItem('token');
    const configHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.post(`${configUrl}/api/track/addTrack`, {
      track,
      status,
      date
    }, configHeaders);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      const { message, errors } = error.response.data;
      console.log('Validation errors:', errors);
      alert(message);
    } else {
      console.error('Error:', error.message);
    }
  }

  
};

// Функция для отправки запроса на обновление треков на сервер
export const excelTracks = async (tracks, status, date) => {
  try {
      const token = localStorage.getItem('token');
      const configHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      // Отправляем POST запрос на сервер для обновления треков
      const response = await axios.post(`${configUrl}/api/track/addExcelTrack`, {
          tracks,
          status,
          date
      }, configHeaders);
      
      // Возвращаем данные ответа от сервера
      return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      const { message, errors } = error.response.data;
      console.log('Validation errors:', errors);
      alert(message);
    } else {
      console.error('Error:', error.message);
    }
  }
};
