// NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>404 - Страница не найдена</h1>
            <p style={{ fontSize: '1rem', marginBottom: '20px' }}>К сожалению, запрашиваемая страница не существует.</p>
            <Link to="/" style={{ fontSize: '1rem', color: 'blue' }}>Вернуться на главную</Link>
        </div>
    );
};

export default NotFound;
