import axios from 'axios'
import {setUser} from "../reducers/userReducer";
import config from '../config';

let configUrl = config.apiUrl;

// Нормализация номера телефона
const normalizePhone = (phone) => {
    return String(phone).replace(/\D/g, '');
};
export const registration = (name, surname, phone, password, referrer, selectedFilial, isChecked) => {
    return async dispatch => {
        try {
            // Валидация на клиенте
            if (!name?.trim() || !surname?.trim() || !phone?.toString().trim() || !password?.trim()) {
                alert('Пожалуйста, заполните все поля');
                return false;
            }

            const normalizedPhone = normalizePhone(phone);

            // Отправляем запрос на сервер для регистрации пользователя
            const registrationResponse = await axios.post(`${configUrl}/api/auth/registration`, {
                name,
                surname,
                phone: normalizedPhone,
                password,
                referrer,
                selectedFilial,
                isChecked
            });

            // Если регистрация прошла успешно, авторизуем пользователя
            const loginResponse = await axios.post(`${configUrl}/api/auth/login`, {
                phone: normalizedPhone,
                password
            });

            // Получаем токен из ответа и сохраняем его в локальном хранилище
            localStorage.setItem('token', loginResponse.data.token);
            localStorage.setItem('userId', loginResponse.data.user.id);

            // Отправляем action для обновления состояния с информацией о пользователе
            dispatch(setUser(loginResponse.data.user));

            // Возвращаем сообщение об успешной регистрации
            alert(registrationResponse.data.message);

            return true; 

        } catch (error) {
            // Обрабатываем ошибку
            alert(error.response.data.message);
            return false; 

        }
    }
}


export const login =  (phone, password) => {
    return async dispatch => {
        try {
            // Валидация на клиенте
            if (!phone?.toString().trim() || !password?.trim()) {
                alert('Пожалуйста, введите номер телефона и пароль');
                return false;
            }

            const normalizedPhone = normalizePhone(phone);

            const response = await axios.post(`${configUrl}/api/auth/login`, {
                phone: normalizedPhone,
                password
            })
            
            // Сохраняем токен
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('userId', response.data.user.id)
            
            // Сохраняем роль пользователя
            const isAdmin = response.data.user.role === 'admin';
            localStorage.setItem('isAdmin', isAdmin);
            
            // Обновляем состояние один раз
            dispatch(setUser(response.data.user));
            
            return true; 
            
        } catch (e) {
            const errorMsg = e.response?.data?.message || 'Ошибка авторизации';
            alert(errorMsg)
            return false; 
        }
    }
}


export const auth =  () => {
    return async dispatch => {
        try {
            const token = localStorage.getItem('token');
            
            // Если токена нет, просто выходим
            if (!token) {
                console.log('Нет токена - требуется вход');
                dispatch(setUser(null));
                return;
            }
            
            const response = await axios.get(`${configUrl}/api/auth/auth`, 
                {
                    headers:{Authorization: `Bearer ${token}`},
                    timeout: 5000  // 5 секунд таймаут
                }
            );
            
            // Сохраняем роль пользователя и userId
            const isAdmin = response.data.user.role === 'admin';
            localStorage.setItem('isAdmin', isAdmin);
            localStorage.setItem('userId', response.data.user.id);
            
            // Обновляем состояние один раз
            dispatch(setUser(response.data.user));
            console.log('✓ Авторизация восстановлена');

            
        } catch (error) {
            // Если токен истёк или ошибка авторизации, очищаем данные (без alert)
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('userId');
            dispatch(setUser(null));
            console.log('Авторизация потеряна, требуется повторный вход:', error.response?.status);
        }
    }
}

export const logout = () => {
    return async dispatch => {
        // Очищаем localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        sessionStorage.removeItem('selectedNavItem');
        
        // Обнуляем пользователя в state
        dispatch(setUser(null));
        
        console.log('✓ Пользователь вышел из аккаунта');
    }
}


  
  