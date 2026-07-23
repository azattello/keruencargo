import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './UserListSimple.module.css';
const levels = [
  'Bronze', 'Silver', 'Gold', 'Elite', 'Platinum', 'Vyper Diamond', 'Vyper Titan', 'Vyper Crown', 'Vyper Infinity'
];

const UserListSimple = () => {
  const [users, setUsers] = useState([]);
  const [filterLevel, setFilterLevel] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusAction, setBonusAction] = useState('add');
  const [modalError, setModalError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyUser, setHistoryUser] = useState(null);

  useEffect(() => {
    axios.get('/api/user', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setUsers(res.data.users || []))
      .catch(() => setUsers([]));
  }, []);

  // Получение истории бонусов
  const [bonusHistory, setBonusHistory] = useState([]);
  useEffect(() => {
    if (historyOpen && historyUser) {
      axios.get(`/api/user/${historyUser._id}/bonus-history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => setBonusHistory(res.data.history || []))
        .catch(() => setBonusHistory([]));
    }
  }, [historyOpen, historyUser]);

  const filtered = users.filter(u =>
    (!filterLevel || u.level === filterLevel) &&
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.toString().includes(search))
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Пользователи (упрощённый список)</h2>
      <div className={styles.filterBar}>
        <select className={styles.select} value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
          <option value=''>Все уровни</option>
          {levels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <input
          className={styles.input}
          type='text'
          placeholder='Поиск по имени или телефону'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
  <table className={styles.table}>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Уровень</th>
            <th>Баллы</th>
            <th>Процент</th>
            <th>Рефералы</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(u => (
            <tr key={u._id}>
              <td>{u.name} {u.surname}</td>
              <td>{u.phone}</td>
              <td>{u.level || '-'}</td>
              <td>{u.bonuses || 0}</td>
              <td>{u.referralBonusPercentage || '-'}</td>
              <td>{(u.referrals && u.referrals.length) || 0}</td>
              <td>
                <button className={styles.actionBtn} onClick={() => { setModalOpen(true); setModalUser(u); setBonusAmount(''); setBonusAction('add'); setModalError(''); }}>Списать/начислить баллы</button>
                <button className={styles.actionBtn} onClick={() => { setHistoryOpen(true); setHistoryUser(u); }}>История</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Модальное окно для списания/начисления баллов */}
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Списать/начислить баллы для {modalUser.name} {modalUser.surname}</h3>
            <select value={bonusAction} onChange={e => setBonusAction(e.target.value)}>
              <option value='add'>Начислить</option>
              <option value='spend'>Списать</option>
            </select>
            <input
              type='number'
              placeholder='Сумма баллов'
              value={bonusAmount}
              onChange={e => setBonusAmount(e.target.value)}
            />
            {modalError && <div className={styles.error}>{modalError}</div>}
            <div className={styles.modalActions}>
              <button
                onClick={async () => {
                  if (!bonusAmount || isNaN(bonusAmount) || Number(bonusAmount) <= 0) {
                    setModalError('Введите корректную сумму');
                    return;
                  }
                  try {
                    await axios.post(`/api/user/${modalUser._id}/bonuses`, {
                      action: bonusAction,
                      amount: Number(bonusAmount)
                    }, {
                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    // После успешной операции обновить список пользователей
                    const res = await axios.get('/api/user', {
                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setUsers(res.data.users || []);
                    setModalOpen(false);
                    setModalUser(null);
                    setBonusAmount('');
                    setBonusAction('add');
                    setModalError('');
                  } catch (err) {
                    setModalError('Ошибка при операции');
                  }
                }}
              >Сохранить</button>
              <button onClick={() => { setModalOpen(false); setModalUser(null); }}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно истории бонусов */}
      {historyOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>История бонусов для {historyUser.name} {historyUser.surname}</h3>
            <ul>
              {bonusHistory.length === 0 && <li>Нет операций</li>}
              {bonusHistory.map((h, i) => (
                <li key={i}>
                  {h.amount > 0 ? '+' : ''}{h.amount} баллов — {h.type} {h.description ? `(${h.description})` : ''} <span style={{ color: '#888', fontSize: 12 }}>{h.date && new Date(h.date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
            <div className={styles.modalActions}>
              <button onClick={() => setHistoryOpen(false)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListSimple;
