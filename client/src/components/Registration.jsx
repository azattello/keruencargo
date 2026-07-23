import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './styles/home.css';
import phonePNG from '../assets/img/phone.png';
import passwdPNG from '../assets/img/passwd.png';
import namePNG from '../assets/img/name.png';
import { registration } from "../action/user";
import { getFilials } from "../action/filial"; // Импортируем getFilials для получения списка филиалов
import { getSettings } from "../action/settings"; // Импортируем getSettings для получения настроек
import { useDispatch } from 'react-redux';
import config from "../config";
import { pushNotificationUtil } from "../utils/pushNotificationUtil";

const Registration = () => {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [selectedFilial, setSelectedFilial] = useState(""); // Добавляем состояние для выбранного филиала
    const [filials, setFilials] = useState([]); // Состояние для списка филиалов
    const [referrerId, setReferrerId] = useState(null); // Добавляем состояние для реферала
    const [isChecked, setIsChecked] = useState(false);
    const [contractFilePath, setContractFilePath] = useState(""); // Состояние для пути к файлу
    const [phoneError, setPhoneError] = useState(""); // Состояние для ошибки телефона

    const navigate  = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        // Проверяем наличие реферального параметра в URL
        const searchParams = new URLSearchParams(location.search);
        const ref = searchParams.get('ref');
        if (ref) {
            setReferrerId(ref);
        }
        
        // Загружаем список филиалов при загрузке компонента
        const fetchFilials = async () => {
            const allFilials = await getFilials();
            setFilials(allFilials);
        };

        // Загружаем настройки, включая путь к файлу контракта
        const fetchSettings = async () => {
            const settings = await getSettings();
            if (settings && settings.contractFilePath) {
                setContractFilePath(settings.contractFilePath);
            }
        };

        fetchSettings();
        fetchFilials();
    }, [location]);

    // Валидация номера телефона
    const validatePhone = (phoneNumber) => {
        // Формат: 8XXXXXXXXXX (11 цифр, начинается с 8)
        const phoneRegex = /^8\d{10}$/;
        return phoneRegex.test(phoneNumber);
    };

    const handlePhoneChange = (event) => {
        const value = event.target.value;
        setPhone(value);
        
        // Очищаем ошибку при вводе
        if (phoneError) {
            setPhoneError("");
        }
    };

    const handleRegistration = async () => {
        // Проверяем валидность номера телефона
        if (!phone) {
            setPhoneError("Номер телефона обязателен");
            return;
        }

        if (!validatePhone(phone)) {
            setPhoneError("Номер телефона должен быть в формате: 8XXXXXXXXXX (11 цифр)");
            return;
        }

        const registrationSuccess = await dispatch(registration(name, surname, phone, password, referrerId, selectedFilial, isChecked ));
        if (registrationSuccess) {
            // Инициализируем push-уведомления после успешной регистрации
            if (pushNotificationUtil.isSupported()) {
                const hasPermission = await pushNotificationUtil.requestPermission();
                if (hasPermission) {
                    await pushNotificationUtil.registerServiceWorker();
                }
            }
            navigate("/main");
        }
    };

    
    return (
      <div className="auth">
        <div className="form">
            <h1 className="h1-auth">Регистрация</h1>
            <div className="input__div_auth"><img src={namePNG} alt="person" className="phonePNG"/>
                <input value={name} onChange={(event) => setName(event.target.value)} type="text" className="input" placeholder="Имя"/>
            </div>
            <div className="input__div_auth"><img src={namePNG} alt="person" className="phonePNG"/>
                <input value={surname} onChange={(event) => setSurname(event.target.value)} type="text" className="input" placeholder="Фамилия"/>
            </div>
            <div className="input__div_auth"><img src={phonePNG} alt="Phone" className="phonePNG"/>
                <input value={phone} onChange={handlePhoneChange} type="text" className="input" placeholder="8XXXXXXXXXX"/>
                {phoneError && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{phoneError}</p>}
            </div>
            <div className="input__div_auth">
                <select value={selectedFilial} onChange={(e) => setSelectedFilial(e.target.value)} className="input">
                    <option value="">Выберите филиал</option>
                    {filials.map(filial => (
                        <option key={filial.filial._id} value={filial.filial.filialText}>
                            {filial.filial.filialName ? filial.filial.filialName : filial.filial.filialText}
                        </option>
                    ))}
                </select>
            </div>
            <div className="input__div_auth"><img src={passwdPNG} alt="Password" className="phonePNG"/>
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="input" placeholder="Придумайте пароль"/>
            </div>
            
            {/* Выпадающий список для выбора филиала */}
           
            <div className="checkbox__div">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(event) => setIsChecked(event.target.checked)}
                />
                <span className="checkbox__text">
                Согласен на обработку персональных данных и с {contractFilePath && (
                            <a href={`${config.apiUrl}${contractFilePath}`} target="_blank" rel="noopener noreferrer" className="terms-link">
                                условиями
                            </a>
                        )}
                </span>
            </div>

            <button className="buttonLogin" onClick={handleRegistration}>Зарегистрироваться</button>
            <Link to="/login" className="link__auth">Войти</Link>
        </div>
      </div>
    );
}

export default Registration;
