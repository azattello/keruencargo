import axios from 'axios';
import config from '../config';

let configUrl = config.apiUrl;

export const addBookmark = async ( userId , description, trackNumber) => {
    
    const apiUrl = `${configUrl}/api/bookmark/${userId}/bookmarks`;

    const data = {
        description,
        trackNumber
    };

    try {
        const response = await axios.post(apiUrl, data);
        console.log('Успешно прикреплен трек-номер:', response.data);
        window.location.reload();
        return response.data;
    } catch (error) {
        console.error('Ошибка при прикреплении трек-номера:', error.response.data.message);
        throw new Error('Ошибка при прикреплении трек-номера');
    }
};
