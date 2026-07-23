import axios from 'axios';
import config from '../config';

let configUrl = config.apiUrl;
export const addStatus = async (statusText) => {
    
  try {
    // Отправляем запрос на сервер для добавления нового статуса
    const response = await axios.post(`${configUrl}/api/status/addStatus`, {
      statusText
    });
    
    // Возвращаем ответ от сервера
    return response.data;
  } catch (error) {
    // Если есть ошибка валидации, отображаем сообщение об ошибке
    if (error.response && error.response.status === 400) {
        const { message, errors } = error.response.data;
        console.log('Validation errors:', errors);
        alert(message);
      } else {
        // Если произошла другая ошибка, выводим сообщение об ошибке в консоль
        console.error('Error:', error.message);
      }
  }
};


// Функция для отправки запроса на получение списка статусов, отсортированных по времени создания
export const getStatus = async () => {
  try {
      const response = await axios.get(`${configUrl}/api/status/getStatus`);
      // Сортируем статусы по времени создания в порядке убывания
      const sortedStatuses = response.data.sort((b,a ) => new Date(b.createdAt) - new Date(a.createdAt));
      return sortedStatuses;
  } catch (error) {
      throw new Error('Ошибка при получении статусов');
  }
};


export const deleteStatus = async (statusId) => {
  try {
    // Отправляем DELETE запрос на сервер для удаления статуса по его идентификатору
    const response = await axios.delete(`${configUrl}/api/status/deleteStatus/${statusId}`);
    console.log('Статус успешно удален:', response.data.message);
    return true;
  } catch (error) {
    console.error('Ошибка при удалении статуса:', error);
    return false;
  }
};
