import axios from 'axios';
import config from '../config';

export const FETCH_COURSES_REQUEST = 'FETCH_COURSES_REQUEST';
export const FETCH_COURSES_SUCCESS = 'FETCH_COURSES_SUCCESS';
export const FETCH_COURSES_ERROR = 'FETCH_COURSES_ERROR';

export const fetchCourses = () => async dispatch => {
  try {
    dispatch({ type: FETCH_COURSES_REQUEST });
    const response = await axios.get(`${config.apiUrl}/api/course`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    dispatch({
      type: FETCH_COURSES_SUCCESS,
      payload: response.data.courses || []
    });
    return response.data.courses || [];
  } catch (error) {
    dispatch({
      type: FETCH_COURSES_ERROR,
      payload: error.response?.data?.message || 'Ошибка при загрузке курсов'
    });
    throw error;
  }
};

export const createCourse = (formData) => async dispatch => {
  try {
    const response = await axios.post(`${config.apiUrl}/api/course`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCourse = (id, formData) => async dispatch => {
  try {
    const response = await axios.put(`${config.apiUrl}/api/course/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCourse = (id) => async dispatch => {
  try {
    const response = await axios.delete(`${config.apiUrl}/api/course/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
