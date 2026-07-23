import axios from "axios";
import config from '../config';


// Получение всех баннеров
export const fetchBanners = () => async (dispatch) => {
    try {
        const response = await axios.get(`${config}/api/banners`);
        dispatch({
            type: "FETCH_BANNERS_SUCCESS",
            payload: response.data,
        });
    } catch (error) {
        dispatch({
            type: "FETCH_BANNERS_FAILURE",
            payload: error.message,
        });
    }
};

// Загрузка нового баннера
export const uploadBanner = (file) => async (dispatch) => {
    const formData = new FormData();
    formData.append("banner", file);

    try {
        const response = await axios.post(`${config}/api/banners`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        dispatch({
            type: "UPLOAD_BANNER_SUCCESS",
            payload: response.data, // Добавляем загруженный баннер в Redux
        });
    } catch (error) {
        dispatch({
            type: "UPLOAD_BANNER_FAILURE",
            payload: error.message,
        });
    }
};

// Удаление баннера
export const deleteBanner = (id) => async (dispatch) => {
    try {
        await axios.delete(`${config}/api/banners/${id}`);
        dispatch({
            type: "DELETE_BANNER_SUCCESS",
            payload: id, // Передаем id баннера, который удаляем
        });
    } catch (error) {
        dispatch({
            type: "DELETE_BANNER_FAILURE",
            payload: error.message,
        });
    }
};
