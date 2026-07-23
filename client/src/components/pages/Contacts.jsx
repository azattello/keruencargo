import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import BasePage from './BasePage';
import axios from 'axios';
import config from '../../config';
import { getFilialContactsByName } from '../../action/settings';
import '../styles/pages.css';

export default function Contacts() {
  const [contacts, setContacts] = useState(null);
  const [loading, setLoading] = useState(true);

  const selectedFilial = useSelector(state => state.user.currentUser.selectedFilial);

  useEffect(() => {
    (async () => {
      try {
        let res;
        if (selectedFilial) {
          res = await getFilialContactsByName(selectedFilial);
          setContacts(res);
        } else {
          res = await axios.get(`${config.apiUrl}/api/settings/getContacts`);
          setContacts(res.data);
        }
      } catch (err) {
        console.error('Ошибка при получении контактов:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedFilial]);

  return (
    <BasePage title="Контакты">
      
      <div className="contacts-container">
        {loading ? (
          <div className="loading">Загрузка контактов...</div>
        ) : contacts ? (
          <>
            <div className="contacts-header">
              <h2>Свяжитесь с нами</h2>
              <p>Выберите удобный для вас способ связи</p>
            </div>

            <div className="contacts-grid">
              {contacts.phone && (
                <a href={`tel:${contacts.phone}`} className="contact-card">
                  <div className="contact-icon">📞</div>
                  <h3>Телефон</h3>
                  <p>{contacts.phone}</p>
                  <span className="call-btn">Позвонить</span>
                </a>
              )}

              {contacts.whatsappLink && (
                <a href={contacts.whatsappLink} target="_blank" rel="noopener noreferrer" className="contact-card whatsapp">
                  <div className="contact-icon">💬</div>
                  <h3>WhatsApp</h3>
                  <p>{contacts.whatsappPhone || 'Напишите нам'}</p>
                  <span className="msg-btn">Написать</span>
                </a>
              )}

              {contacts.telegramLink && (
                <a href={contacts.telegramLink} target="_blank" rel="noopener noreferrer" className="contact-card telegram">
                  <div className="contact-icon">✈️</div>
                  <h3>Telegram</h3>
                  <p>{contacts.telegramId || 'Наш канал'}</p>
                  <span className="msg-btn">Перейти</span>
                </a>
              )}

              {contacts.instagram && (
                <a href={`https://instagram.com/${contacts.instagram}`} target="_blank" rel="noopener noreferrer" className="contact-card instagram">
                  <div className="contact-icon">📸</div>
                  <h3>Instagram</h3>
                  <p>@{contacts.instagram}</p>
                  <span className="follow-btn">Следить</span>
                </a>
              )}
            </div>
          </>
        ) : (
          <div className="no-contacts">Контакты не доступны в данный момент</div>
        )}
      </div>
    </BasePage>
  );
}
