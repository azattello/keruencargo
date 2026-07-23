import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./styles/login.css";
import phonePNG from "../assets/img/phone.png";
import passwdPNG from "../assets/img/passwd.png";
import { login } from "../action/user";
import { pushNotificationUtil } from "../utils/pushNotificationUtil";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector(state => state.user.currentUser?.role);

  const handleLogin = async () => {
    const loginSuccess = await dispatch(login(phone, password));
    if (loginSuccess) {
      // Запрашиваем разрешение на уведомления
      if (pushNotificationUtil.isSupported()) {
        await pushNotificationUtil.requestPermission();
        await pushNotificationUtil.registerServiceWorker();
      }
      
      // Редирект в зависимости от роли
      if (role === 'admin' || role === 'filial') {
        navigate("/dashboard");
      } else {
        navigate("/main");
      }
    }
  };

  return (
    <div className="auth">
      <div className="form">
        <h1 className="h1-auth">Вход в систему</h1>
        <p className="auth-subtitle">Введите свой номер телефона и пароль</p>

        <div className="input__div_auth">
          <img src={phonePNG} alt="Phone" className="phonePNG" />
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            type="tel"
            className="input"
            placeholder="8XXXXXXXXXX"
          />
        </div>

        <div className="input__div_auth">
          <img src={passwdPNG} alt="Password" className="phonePNG" />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="input"
            placeholder="******"
          />
        </div>

        <button className="buttonLogin" onClick={handleLogin}>
          Войти
        </button>

        <Link to="/registration" className="link__auth">
          Нет аккаунта? Зарегистрироваться
        </Link>
      </div>
    </div>
  );
};

export default Login;
