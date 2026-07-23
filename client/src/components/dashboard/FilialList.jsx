import React, { useEffect, useState } from "react";
import './css/admin.css';
import { addFilial, getFilials, deleteFilial } from '../../action/filial';
import axios from 'axios';
import config from '../../config';
import { showToast } from '../Toast';
import { openConfirm } from '../Confirm';

const FilialList = () => {
    const [filialText, setFilialText] = useState('');
    const [filialName, setFilialName] = useState('');
    const [filialId, setFilialId] = useState('');
    const [filialAddress, setFilialAddress] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [filials, setFilials] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editingFilialId, setEditingFilialId] = useState(null);

    useEffect(() => {
        fetchFilials();
    }, []);

    const fetchFilials = async () => {
        const allFilials = await getFilials();
        setFilials(allFilials);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            if (editMode) {
                await axios.put(`${config.apiUrl}/api/filial/updateFilial/${editingFilialId}`, {
                    filialText,
                    filialName,
                    userPhone,
                    filialId,
                    filialAddress
                });
                showToast('Филиал успешно обновлен', 'success');
            } else {
                await addFilial(filialId, filialText, userPhone, filialAddress, filialName);
                showToast('Новый филиал успешно добавлен', 'success');
            }

            setFilialText('');
            setFilialName('');
            setUserPhone('');
            setFilialId('');
            setFilialAddress('');
            setEditMode(false);
            setEditingFilialId(null);
            fetchFilials();
        } catch (error) {
            console.error('Ошибка при добавлении/редактировании филиала:', error);
            if (error.response && error.response.data && error.response.data.message) {
                showToast(`Ошибка: ${error.response.data.message}`, 'error');
            } else {
                showToast('Произошла ошибка при добавлении/редактировании филиала', 'error');
            }
        }
    };

    const handleEdit = (filial) => {
        setFilialText(filial.filial.filialText);
        setFilialName(filial.filial.filialName || '');
        setUserPhone(filial.filial.userPhone);
        setFilialId(filial.filial.filialId);
        setFilialAddress(filial.filial.filialAddress);
        setEditingFilialId(filial.filial._id);
        setEditMode(true);
    };

    const handleDelete = async (filialId) => {
        const isConfirmed = await openConfirm('Вы уверены, что хотите удалить этот филиал?');
        if (!isConfirmed) return;

        try {
            await deleteFilial(filialId);
            showToast('Филиал успешно удален', 'success');
            fetchFilials();
        } catch (error) {
            console.error('Ошибка при удалении филиала:', error);
            if (error.response && error.response.data && error.response.data.message) {
                showToast(`Ошибка: ${error.response.data.message}`, 'error');
            } else {
                showToast('Произошла ошибка при удалении филиала', 'error');
            }
        }
    };

    const handleCancelEdit = () => {
        setFilialText('');
        setFilialName('');
        setUserPhone('');
        setFilialId('');
        setFilialAddress('');
        setEditMode(false);
        setEditingFilialId(null);
    };

    return (
        <div className="filial-list">
            <h1 className="filial-list-title">Филиалы</h1>

            <form className="form-filialAdd" onSubmit={handleSubmit}>
                <div className="filial-field-row">
                    <input
                        className="input-filialAdd"
                        type="text"
                        value={filialText}
                        onChange={(e) => setFilialText(e.target.value)}
                        placeholder="Название филиала"
                        required
                    />
                    <input
                        className="input-filialAdd"
                        type="text"
                        value={filialName}
                        onChange={(e) => setFilialName(e.target.value)}
                        placeholder="Отображаемое имя (регистрация)"
                    />
                </div>
                <div className="filial-field-row">
                    <input
                        className="input-filialAdd"
                        type="text"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="Номер телефона"
                    />
                    <input
                        className="input-filialAdd"
                        type="text"
                        value={filialId}
                        onChange={(e) => setFilialId(e.target.value)}
                        placeholder="ID филиала"
                    />
                </div>
                <input
                    className="input-filialAdd"
                    type="text"
                    value={filialAddress}
                    onChange={(e) => setFilialAddress(e.target.value)}
                    placeholder="Адрес филиала"
                />
                <div className="form-actions">
                    <button className="filialAdd-button" type="submit">
                        {editMode ? 'Обновить филиал' : 'Добавить филиал'}
                    </button>
                    {editMode && (
                        <button type="button" className="filialAdd-button filial-cancel-button" onClick={handleCancelEdit}>
                            Отмена
                        </button>
                    )}
                </div>
            </form>

            <div className="filial-table-wrapper">
                <table className="filial-table">
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Отобр. имя</th>
                            <th>Телефон</th>
                            <th>Адрес</th>
                            <th>ID</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filials.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '10px' }}>
                                    Филиалы не найдены
                                </td>
                            </tr>
                        )}
                        {filials.map((filial) => {
                            const f = filial.filial;
                            return (
                                <tr key={f._id}>
                                    <td>{f.filialText}</td>
                                    <td>{f.filialName || '—'}</td>
                                    <td>{f.userPhone}</td>
                                    <td>{f.filialAddress}</td>
                                    <td>{f.filialId}</td>
                                    <td className="filial-table-actions">
                                        <button className="filial-button edit" onClick={() => handleEdit(filial)}>
                                            ✎
                                        </button>
                                        <button className="filial-button delete" onClick={() => handleDelete(f._id)}>
                                            🗑
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FilialList;
