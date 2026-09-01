import axios from 'axios';
import config from '../config';

const configUrl = config.apiUrl;

export const addSending = async (track, filial, date) => {
  try {
    const token = localStorage.getItem('token');
    const configHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.post(`${configUrl}/api/sending/add`, {
      track,
      filial,
      date
    }, configHeaders);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Ошибка отправки');
    }
    throw new Error(error.message || 'Ошибка отправки');
  }
};

export const addBulkSending = async (tracks, filial, date) => {
  try {
    const token = localStorage.getItem('token');
    const configHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.post(`${configUrl}/api/sending/bulk`, {
      tracks,
      filial,
      date
    }, configHeaders);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Ошибка массовой отправки');
    }
    throw new Error(error.message || 'Ошибка массовой отправки');
  }
};

export const getSendings = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const configHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${configUrl}/api/sending/list`, {
      ...configHeaders,
      params
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Ошибка загрузки отправок');
    }
    throw new Error(error.message || 'Ошибка загрузки отправок');
  }
};
