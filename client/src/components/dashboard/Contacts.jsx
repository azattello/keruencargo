import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from 'react-redux';
import './css/admin.css';
import { updateContacts, getContacts, updateFilialContacts, getFilialContacts } from '../../action/settings';

const Contacts = () => {
    const [phone, setPhone] = useState('');
    const [whatsappPhone, setWhatsappPhone] = useState('');
    const [whatsappLink, setWhatsappLink] = useState('');
    const [instagram, setInstagram] = useState('');
    const [telegramId, setTelegramId] = useState('');
    const [telegramLink, setTelegramLink] = useState('');
    const [contacts, setContacts] = useState({});

    const role = useSelector(state => state.user.currentUser?.role);
    const userId = useSelector(state => state.user.currentUser?._id || state.user.currentUser?.id);

    const fetchContacts = useCallback(async () => {
        try {
            let allContacts;
            if (role === 'filial' && userId) {
                allContacts = await getFilialContacts(userId);
            } else {
                allContacts = await getContacts();
            }
            setContacts(allContacts || {});
        } catch (error) {
            console.error('Ошибка при получении данных о контактах:', error);
        }
    }, [role, userId]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            console.log('💾 Сохраняю контакты | role:', role, '| userId:', userId);
            if (phone !== '' || whatsappPhone !== '' || whatsappLink !== '' || instagram !== '' || telegramId !== '' || telegramLink !== '') {
                if (role === 'filial' && userId) {
                    console.log('📝 Сохраняю контакты филиала для userId:', userId);
                    await updateFilialContacts(userId, phone, whatsappPhone, whatsappLink, instagram, telegramId, telegramLink);
                } else {
                    console.log('📝 Сохраняю глобальные контакты');
                    await updateContacts(phone, whatsappPhone, whatsappLink, instagram, telegramId, telegramLink);
                }
                console.log('✅ Контакты сохранены');
                alert('Данные успешно сохранены');
                setPhone('');
                setWhatsappPhone('');
                setWhatsappLink('');
                setInstagram('');
                setTelegramId('');
                setTelegramLink('');
                fetchContacts();
            } else {
                alert('Все поля пустые');
            }
        } catch (error) {
            alert('Ошибка при сохранении данных');
        }
    };


    return (
        <div className="status-list">
            <h1 className="status-list-title">Контакты</h1>
            <form className="form-filialAdd" onSubmit={handleSubmit}>
                <div className="inputs-wrapper-contacts">
                    <p><b>Номер для звонка</b></p>

                    <input
                        className="input-filialAdd"
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+77776662233"
                    />
                    <p className="priceCurrency">
                        {contacts.phone ? `${contacts.phone}` : ''}
                    </p>                   
                </div>

                <div className="inputs-wrapper-contacts">
                    <p><b>WhatsApp номер</b></p>

                    <input
                        className="input-filialAdd"
                        type="text"
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        placeholder="+77776662233"
                    />
                    <p className="priceCurrency">
                        {contacts.whatsappPhone ? `${contacts.whatsappPhone}` : ''}
                    </p>   
                    <input
                        className="input-filialAdd"
                        type="text"
                        value={whatsappLink}
                        onChange={(e) => setWhatsappLink(e.target.value)}
                        placeholder="https://wa.link/pf7cv0"
                    />
                    <p className="priceCurrency">
                        {contacts.whatsappLink ? `${contacts.whatsappLink}` : ''}
                    </p>                   
                </div>

                <div className="inputs-wrapper-contacts">
                    <p><b>Instagram</b></p>

                    <input
                        className="input-filialAdd"
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@qazlogistics.kz"
                    />
                    <p className="priceCurrency">
                        {contacts.instagram ? `${contacts.instagram}` : ''}
                    </p>                   
                </div>

                <div className="inputs-wrapper-contacts">
                    <p><b>Telegram</b></p>

                    <input
                        className="input-filialAdd"
                        type="text"
                        value={telegramId}
                        onChange={(e) => setTelegramId(e.target.value)}
                        placeholder="@qazlogistics.kz"
                    />
                    <p className="priceCurrency">
                        {contacts.telegramId ? `${contacts.telegramId}` : ''}
                    </p> 
                    <input
                        className="input-filialAdd"
                        type="text"
                        value={telegramLink}
                        onChange={(e) => setTelegramLink(e.target.value)}
                        placeholder="https://t.me/qazlogistics"
                    />
                    <p className="priceCurrency">
                        {contacts.telegramLink ? `${contacts.telegramLink}` : ''}
                    </p>                   
                </div>
                <button className="filialAdd-button" type="submit">Сохранить</button>


            </form>
        </div>
    );
}

export default Contacts;
