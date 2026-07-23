import React, { useEffect, useState } from "react";
import './css/newTrack.css';
import circleStatus from "../../assets/img/circleStatus.png";
import { getStatus } from "../../action/status";
import { addTrack} from "../../action/track";
import loadingPNG from "../../assets/img/loading.png";
import check from "../../assets/img/check.png";


const NewTrackChange = ({track, onClose, textComponent}) => {
    const [statuses, setStatuses] = useState([]);
    const [status, setStatus] = useState();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [statusText, setStatusText] = useState("Выберите статус");
    const [success, setSuccess] = useState(false);
    const [date, setDate] = useState();
    const [loading, setLoading] = useState(false);

    const resetSuccess = () => {
        setTimeout(() => {
          setSuccess(false);
        }, 1500);
    };


    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            setLoading(true);
    
            try {
                // Проверка на пустой track до вызова replace
                if (!track || !status || !date || !track.trim()) {
                    setLoading(false);
                    return alert('Необходимо заполнить все поля');
                }
    
                const newTrack = track.replace(/\s/g, ''); // Убираем пробелы
    
                // Дополнительная проверка на пустую строку после очистки пробелов
                if (!newTrack) {
                    setLoading(false);
                    return alert('Поле трек не может быть пустым');
                }
    
                await addTrack(newTrack, status, date);
                setSuccess(true); // Устанавливаем флаг успешной загрузки
            } catch (error) {
                console.error('Ошибка при обновлении треков:', error);
                alert(error.response?.data?.message || 'Произошла ошибка при добавлении трека');
            } finally {
                setLoading(false); // Сбрасываем флаг загрузки после завершения запроса
            }
        }
        resetSuccess();
        onClose();
    };


    const role = localStorage.getItem('role');

    const fetchStatuses = async () => {
        try {
            const statusesData = await getStatus();
            setStatuses(statusesData);
            console.log(statusesData);
        } catch (error) {
            console.error('Ошибка при получении статусов:', error);
        }
    };

    useEffect(() => {
        fetchStatuses();
    }, []);


    const handleStatusClick = (statusId, statusText) => {
        // Добавляем китайский перевод для статусов
        setStatus(statusId);
        setStatusText(statusText);
        setIsPopupOpen(false);
    };


    const handleAdd = () => {
        onClose(); // Закрыть модальное окно
      };

      const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    const handleDateChange = (event) => {
        const newDate = event.target.value; // Получаем новое значение из поля ввода
        const formattedDate = new Date(newDate).toISOString().slice(0, 10); // Преобразуем дату и обрезаем до 10 символов
        setDate(formattedDate); // Устанавливаем новое значение в состояние
    };


    const handleClick = () => {
        // Вызов функции handleKeyDown напрямую
        handleKeyDown({ key: 'Enter' });
    };
    


    return (
        <>
         {loading && <div className="loading modal-load"><img src={loadingPNG} alt="" /><p>Загрузка...</p></div>}
         {success && <div className="success modal-load"><img src={check} alt="" /><p>Успешно загружено!!</p></div>}
        <div class="modal-overlay"></div>
        <div className="modal-track">
           
            <div className="modal-header">
                <h2>{textComponent}</h2>
                <div className="close" onClick={handleAdd}></div>
            </div>
            <div className="track-text">
                Трек номер: <span>{track}</span>
            </div>
            <div className="date-container">
                <h3 className="h3-date">Выберите дату</h3>
                <input 
                    type="date" 
                    className="date-block" 
                    value={date} 
                    onChange={handleDateChange} 
                />

            </div>

            <div className="status-block status-block-new" onClick={togglePopup}>
                <p>{statusText}</p>
                <img src={circleStatus} alt="" />
            </div>
            <div className="statuses">
                {role !== 'filial' && isPopupOpen && (
                    statuses
                        .map(status => (
                            <div key={status._id} className="status-el status-pop" onClick={() => handleStatusClick(status._id, status.statusText)} >
                                <p>{status.statusText}</p>
                            </div>
                        ))
                )}
                
            </div>

            <button className="buttonExcel" onClick={handleClick}>Загрузить</button>

        </div>
        </>
    )
}

export default NewTrackChange;