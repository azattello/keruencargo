import axios from 'axios';
import config from '../config';

// Action types
export const FETCH_ANNOUNCEMENTS_REQUEST = 'FETCH_ANNOUNCEMENTS_REQUEST';
export const FETCH_ANNOUNCEMENTS_SUCCESS = 'FETCH_ANNOUNCEMENTS_SUCCESS';
export const FETCH_ANNOUNCEMENTS_ERROR = 'FETCH_ANNOUNCEMENTS_ERROR';

export const CREATE_ANNOUNCEMENT_REQUEST = 'CREATE_ANNOUNCEMENT_REQUEST';
export const CREATE_ANNOUNCEMENT_SUCCESS = 'CREATE_ANNOUNCEMENT_SUCCESS';
export const CREATE_ANNOUNCEMENT_ERROR = 'CREATE_ANNOUNCEMENT_ERROR';

export const UPDATE_ANNOUNCEMENT_REQUEST = 'UPDATE_ANNOUNCEMENT_REQUEST';
export const UPDATE_ANNOUNCEMENT_SUCCESS = 'UPDATE_ANNOUNCEMENT_SUCCESS';
export const UPDATE_ANNOUNCEMENT_ERROR = 'UPDATE_ANNOUNCEMENT_ERROR';

export const DELETE_ANNOUNCEMENT_REQUEST = 'DELETE_ANNOUNCEMENT_REQUEST';
export const DELETE_ANNOUNCEMENT_SUCCESS = 'DELETE_ANNOUNCEMENT_SUCCESS';
export const DELETE_ANNOUNCEMENT_ERROR = 'DELETE_ANNOUNCEMENT_ERROR';

// Получить все объявления
export const fetchAnnouncements = () => async dispatch => {
  try {
    dispatch({ type: FETCH_ANNOUNCEMENTS_REQUEST });
    const response = await axios.get(`${config.apiUrl}/api/announcement`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    dispatch({
      type: FETCH_ANNOUNCEMENTS_SUCCESS,
      payload: response.data.announcements
    });
  } catch (error) {
    dispatch({
      type: FETCH_ANNOUNCEMENTS_ERROR,
      payload: error.response?.data?.message || 'Ошибка при получении объявлений'
    });
  }
};

// Создать объявление (только для админ)
export const createAnnouncement = (announcementData) => async dispatch => {
  try {
    dispatch({ type: CREATE_ANNOUNCEMENT_REQUEST });
    const response = await axios.post(`${config.apiUrl}/api/announcement`, announcementData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    dispatch({
      type: CREATE_ANNOUNCEMENT_SUCCESS,
      payload: response.data.announcement
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: CREATE_ANNOUNCEMENT_ERROR,
      payload: error.response?.data?.message || 'Ошибка при создании объявления'
    });
    throw error;
  }
};

// Обновить объявление (только для админ)
export const updateAnnouncement = (id, announcementData) => async dispatch => {
  try {
    dispatch({ type: UPDATE_ANNOUNCEMENT_REQUEST });
    const response = await axios.put(
      `${config.apiUrl}/api/announcement/${id}`,
      announcementData,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    dispatch({
      type: UPDATE_ANNOUNCEMENT_SUCCESS,
      payload: response.data.announcement
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: UPDATE_ANNOUNCEMENT_ERROR,
      payload: error.response?.data?.message || 'Ошибка при обновлении объявления'
    });
    throw error;
  }
};

// Удалить объявление (только для админ)
export const deleteAnnouncement = (id) => async dispatch => {
  try {
    dispatch({ type: DELETE_ANNOUNCEMENT_REQUEST });
    const response = await axios.delete(`${config.apiUrl}/api/announcement/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    dispatch({
      type: DELETE_ANNOUNCEMENT_SUCCESS,
      payload: id
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: DELETE_ANNOUNCEMENT_ERROR,
      payload: error.response?.data?.message || 'Ошибка при удалении объявления'
    });
    throw error;
  }
};
