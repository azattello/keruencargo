import axios from 'axios';
import config from '../config';

let configUrl = config.apiUrl;

// Функция для отправки запроса на обновление треков на сервер
export const excelLosts = async (tracks) => {
try {
    // Отправляем POST запрос на сервер для обновления треков
    const response = await axios.post(`${configUrl}/api/losts/addExcelLost`, {
        tracks
    });
    
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
  