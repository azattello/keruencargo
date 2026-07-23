import axios from 'axios';
import config from '../config';

let configUrl = config.apiUrl;
export const addFilial = async (filialId, filialText, userPhone, filialAddress, filialName = '') => {
  try {
    // Отправляем POST запрос на сервер для добавления нового филиала
    const response = await axios.post(`${configUrl}/api/filial/addFilial`, {
      filialText,
      filialName,
      userPhone,
      filialId,
      filialAddress
    });

    // Если запрос выполнен успешно, возвращаем данные ответа
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
        const { message, errors } = error.response.data;
        console.log('Validation errors:', errors);
        alert(message);
      } else {
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
  }
};

export const getFilials = async () => {
  try {
    // Отправляем GET запрос на сервер для получения данных о всех филиалах
    const response = await axios.get(`${configUrl}/api/filial/getFilial`);

    // Если запрос выполнен успешно, возвращаем данные ответа
    return response.data;
  } catch (error) {
    // Если произошла ошибка, выводим её в консоль и возвращаем null
    console.error('Ошибка при получении данных о филиалах:', error);
    return null;
  }
};
  
export const fetchFilialByUserPhone = async (userPhone) => {
  try {
      const response = await axios.get(`${configUrl}/api/filial/getFilialByUserPhone`, {
          params: {
              userPhone
          }
      });
      return response.data;
  } catch (error) {
      throw new Error(error.message);
  }
};  


export const deleteFilial = async (filialId) => {
  try {
    const response = await axios.delete(`${configUrl}/api/filial/deleteFilial/${filialId}`);
    return response.data.message;
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
  


export const getFilialByUserPhone = async (userPhone) => {
  try {
    const response = await axios.get(`${configUrl}/api/filial/getFilialByUserPhone`, {
      params: { userPhone } // Передача параметра запроса
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении филиала по номеру телефона:', error.message);
    throw error;
  }
};
