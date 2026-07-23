import axios from 'axios';
import config from '../config';

let configUrl = config.apiUrl;

// Функция для обновления настроек

export const updateSettings = async (
  videoLink,
  chinaAddress,
  whatsappNumber,
  aboutUsText,
  prohibitedItemsText, contractFile) => {
      
    const formData = new FormData();
    
    // Добавляем данные настроек в FormData
    if (videoLink) formData.append('videoLink', videoLink);
    if (chinaAddress) formData.append('chinaAddress', chinaAddress);
    if (whatsappNumber) formData.append('whatsappNumber', whatsappNumber);
    if (aboutUsText) formData.append('aboutUsText', aboutUsText);
    if (prohibitedItemsText) formData.append('prohibitedItemsText', prohibitedItemsText);
    
    // Добавляем файл контракта в FormData
    if (contractFile) {
        formData.append('contract', contractFile);
    }

    try {
        // Отправляем POST запрос на сервер для обновления настроек
        const response = await axios.post(`${configUrl}/api/settings/updateSettings`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Убедитесь, что это установлено
            },
        });

        return response.data; // Если запрос выполнен успешно, возвращаем данные ответа
    } catch (error) {
        if (error.response) {
            console.error('Ошибка при обновлении настроек:', error.response.data);
            throw error.response.data; // Возвращаем данные ошибки
        } else {
            console.error('Ошибка при обновлении настроек:', error.message);
            throw new Error('Ошибка при обновлении настроек'); // Обработка других ошибок
        }
    }
};

export const getSettings = async () => {
  try {
    const response = await axios.get(`${configUrl}/api/settings/getSettings`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении настроек:', error);
    return null;
  }
};

export const updateFilialContacts = async (userId, phone, whatsappPhone, whatsappLink, instagram, telegramId, telegramLink) => {
    try {
        const response = await axios.post(`${configUrl}/api/filial/updateFilialContacts`, {userId, phone, whatsappPhone, whatsappLink, instagram, telegramId, telegramLink});
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Ошибка при обновлении контактов филиала:', error.response.data);
            throw error.response.data;
        } else {
            console.error('Ошибка при обновлении контактов филиала:', error.message);
            throw new Error('Ошибка при обновлении контактов филиала');
        }
    }
};

export const getFilialContacts = async (userId) => {
    try {
        const response = await axios.get(`${configUrl}/api/filial/getFilialContacts/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении контактов филиала:', error);
        return null;
    }
};

export const updateFilialSettings = async (userId, videoLink, chinaAddress, whatsappNumber, aboutUsText, prohibitedItemsText, contractFile) => {
    try {
        const response = await axios.post(`${configUrl}/api/filial/updateFilialSettings`, {
            userId,
            videoLink,
            chinaAddress,
            whatsappNumber,
            aboutUsText,
            prohibitedItemsText,
            contractFilePath: contractFile ? contractFile.name : '' // Для совместимости, если файл есть
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Ошибка при обновлении доп. информации филиала:', error.response.data);
            throw error.response.data;
        } else {
            console.error('Ошибка при обновлении доп. информации филиала:', error.message);
            throw new Error('Ошибка при обновлении доп. информации филиала');
        }
    }
};

export const getFilialSettings = async (userId) => {
    try {
        const response = await axios.get(`${configUrl}/api/filial/getFilialSettings/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении доп. информации филиала:', error);
        return null;
    }
};

export const getFilialContactsByName = async (filialText) => {
    const encoded = encodeURIComponent(filialText);
    console.log('getFilialContactsByName - original:', filialText, 'encoded:', encoded);
    try {
        const response = await axios.get(`${configUrl}/api/filial/getFilialContactsByName/${encoded}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении контактов филиала:', error);
        return null;
    }
};

export const getFilialSettingsByName = async (filialText) => {
    const encoded = encodeURIComponent(filialText);
    console.log('getFilialSettingsByName - original:', filialText, 'encoded:', encoded);
    try {
        const response = await axios.get(`${configUrl}/api/filial/getFilialSettingsByName/${encoded}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении доп. информации филиала:', error);
        return null;
    }
};


// Функция для загрузки контракта
export const uploadContract = async (file) => {
  const formData = new FormData();
  formData.append('contract', file); // Здесь имя 'contract' должно совпадать с тем, что используется на сервере

  try {
      const response = await axios.post(`${configUrl}/api/upload/uploadContract`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
          }
      });
      return response.data; // Возвращаем ответ от сервера
  } catch (error) {
      // Обработка ошибок
      if (error.response) {
          console.error('Ошибка при загрузке контракта:', error.response.data);
          throw error.response.data; // Возвращаем данные ошибки
      } else {
          console.error('Ошибка при загрузке контракта:', error.message);
          throw new Error('Ошибка при загрузке контракта');
      }
  }
};



export const updatePrice = async (price,currency) => {
try {
  // Отправляем POST запрос на сервер для добавления нового филиала
  const response = await axios.post(`${configUrl}/api/settings/updatePrice`, {price,currency});

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

export const getPrice = async () => {
  try {
    // Отправляем GET запрос на сервер для получения данных о всех филиалах
    const response = await axios.get(`${configUrl}/api/settings/getPrice`);
    
    // Если запрос выполнен успешно, возвращаем данные ответа
    return response.data;
  } catch (error) {
    // Если произошла ошибка, выводим её в консоль и возвращаем null
    console.error('Ошибка при получении данных о филиалах:', error);
    return null;
  }
};



// Функция для обновления глобального процента бонуса
export const updateGlobalBonusPercentage = async (percent) => {
    try {
        const response = await axios.put(`${configUrl}/api/settings/globalBonus`, { globalReferralBonusPercentage: percent });
        return response.data;
    } catch (error) {
        throw new Error('Ошибка при обновлении глобального процента бонуса');
    }
};







export const updateContacts = async (phone, whatsappPhone, whatsappLink, instagram, telegramId, telegramLink) => {
  try {
    // Отправляем POST запрос на сервер для добавления нового филиала
    const response = await axios.post(`${configUrl}/api/settings/updateContacts`, {phone, whatsappPhone, whatsappLink, instagram, telegramId, telegramLink});
  
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

export const getContacts = async () => {
  try {
    // Отправляем GET запрос на сервер для получения данных о всех филиалах
    const response = await axios.get(`${configUrl}/api/settings/getContacts`);
    
    // Если запрос выполнен успешно, возвращаем данные ответа
    return response.data;
  } catch (error) {
    // Если произошла ошибка, выводим её в консоль и возвращаем null
    console.error('Ошибка при получении данных о филиалах:', error);
    return null;
  }
};