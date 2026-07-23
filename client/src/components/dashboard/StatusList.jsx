import React, { useEffect, useState } from "react";
import './css/admin.css';
import { addStatus, getStatus } from "../../action/status";
// import {deleteStatus } from "../../action/status";
// import trash from "../../assets/img/trash.png"

const StatusList = () => {
  const [statusText, setStatusText] = useState('');
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
      // Получаем статусы при загрузке компонента
      fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
      try {
          const statusesData = await getStatus();
          setStatuses(statusesData);
      } catch (error) {
          console.error('Ошибка при получении статусов:', error);
      }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Вызываем функцию addStatus с введенным текстом статуса
      const response = await addStatus(statusText);
      console.log('Новый статус успешно добавлен:', response);
      // Очищаем поле ввода после успешного добавления
      setStatusText('');
      // После добавления нового статуса обновляем список статусов
      fetchStatuses();
    } catch (error) {
      console.error('Ошибка при добавлении статуса:', error);
    }
  };

  // const handleDelete = async (id) => {
  //   const isConfirmed = window.confirm('Вы уверены, что хотите удалить этот статус?');
  //   if (!isConfirmed) {
  //       return; // Если пользователь отменил действие, выходим из функции
  //   }
  //   try {
  //       await deleteStatus(id);
  //       console.log('Статус успешно удален');
  //       fetchStatuses();
  //   } catch (error) {
  //       console.error('Ошибка при удалении статуса:', error);
  //   }
  // };




  return (
      <div className="status-list">
        <h1 className="status-list-title">Статусы</h1>

        <form className="form-addTrack" onSubmit={handleSubmit}>

          <input
              type="text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="Введите текст статуса"
              className="input-statusAdd"
          />
          <button className="statusAdd-button" type="submit">Добавить</button>
          </form>


        {/* Отображаем список статусов */}
          <div className="statuses">
              {statuses.map(status => (
                  <div key={status._id} className="status-el">
                      <p>{status.statusText}</p>
                      {/* <img src={trash} alt="" className="trash" onClick={() => handleDelete(status._id)}/> */}
                  </div>
              ))}
          </div>

          

          
      </div>
  );
}


export default StatusList;