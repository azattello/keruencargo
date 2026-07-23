import React, { useEffect, useState } from 'react';
import config from '../../config';
import './css/GlobalIdCounter.css';

const GlobalIdCounterStatus = () => {
  const [counter, setCounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNumber, setNewNumber] = useState('');
  const [addingNumber, setAddingNumber] = useState(false);

  const token = localStorage.getItem('token');

  const fetchCounter = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${config.apiUrl}/api/auth/global-id-counter`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Ошибка при загрузке счётчика');
      }

      const data = await res.json();
      setCounter(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCounter();
  }, [fetchCounter]);

  const handleAddToReserve = async (e) => {
    e.preventDefault();
    const numValue = parseInt(newNumber, 10);

    if (!Number.isInteger(numValue) || numValue < 10) {
      alert('Номер должен быть целым числом >= 10');
      return;
    }

    try {
      setAddingNumber(true);
      const res = await fetch(`${config.apiUrl}/api/auth/global-id-counter/reserve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ number: numValue })
      });

      if (!res.ok) {
        throw new Error('Ошибка при добавлении номера');
      }

      const data = await res.json();
      setCounter(data);
      setNewNumber('');
      alert(data.message);
    } catch (err) {
      alert('Ошибка: ' + err.message);
      console.error(err);
    } finally {
      setAddingNumber(false);
    }
  };

  if (loading) {
    return <div className="global-id-counter">Загрузка...</div>;
  }

  if (error) {
    return <div className="global-id-counter error">Ошибка: {error}</div>;
  }

  return (
    <div className="global-id-counter-container">
      <header className="header-main">
        <h1 className="text-header">Глобальный счётчик ID</h1>
      </header>

      <div className="global-id-counter">
        {/* Основная информация */}
        <div className="counter-info-block">
          <div className="counter-item">
            <h3>Следующий ID</h3>
            <div className="counter-value">{counter?.nextId}</div>
          </div>

          <div className="counter-item">
            <h3>В резерве</h3>
            <div className="counter-value">{counter?.totalReserved || 0}</div>
          </div>
        </div>

        {/* Список резервированных номеров */}
        <div className="reserved-section">
          <h3>Резервированные номера</h3>
          {counter?.reservedIds && counter.reservedIds.length > 0 ? (
            <div className="reserved-list">
              {counter.reservedIds.map((num, idx) => (
                <span key={idx} className="reserved-badge">
                  {num}
                </span>
              ))}
            </div>
          ) : (
            <p className="no-reserved">Нет резервированных номеров</p>
          )}
        </div>

        {/* Форма для добавления номера в резерв */}
        <div className="add-reserve-section">
          <h3>Добавить номер в резерв</h3>
          <form onSubmit={handleAddToReserve} className="add-reserve-form">
            <input
              type="number"
              min="10"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="Введите номер..."
              required
            />
            <button type="submit" disabled={addingNumber}>
              {addingNumber ? 'Добавляю...' : 'Добавить'}
            </button>
          </form>
        </div>

        {/* Кнопка обновления */}
        <div className="refresh-btn-container">
          <button className="refresh-btn" onClick={fetchCounter}>
            🔄 Обновить
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalIdCounterStatus;
