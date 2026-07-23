import React, { useEffect, useState } from "react";
import './css/admin.css';
import { updatePrice, getPrice, getSettings, updateGlobalBonusPercentage } from '../../action/settings';

const Weight = () => {
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('');
    const [priceMongo, setPriceMongo] = useState({});
    const [settingList, setSettingList] = useState({});
    const [percent, setPercent] = useState('');

    useEffect(() => {
        fetchSettings();
        fetchSettingsBonus();
    }, []);

    const fetchSettings = async () => {
        try {
            const allSettings = await getPrice();
            setPriceMongo(allSettings || {});
        } catch (error) {
            console.error('Ошибка при получении данных о цене:', error);
        }
    };

    const fetchSettingsBonus = async () => {
        try {
            const allSettings = await getSettings();
            setSettingList(allSettings || {});
        } catch (error) {
            console.error('Ошибка при получении данных о настройках:', error);
        }
    };

    useEffect(() => {
        console.log(priceMongo);
    }, [priceMongo]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (price !== '' && currency !== '') {
                await updatePrice(price, currency);
                alert('Данные успешно сохранены');
                setPrice('');
                setCurrency('');
                fetchSettings();
            } else {
                alert('Все поля пустые');
            }
        } catch (error) {
            alert('Ошибка при сохранении данных');
        }
    };

    const handlePercentSubmit = async (event) => {
        event.preventDefault();
        try {
            if (percent !== '') {
                await updateGlobalBonusPercentage(percent);
                alert('Глобальный процент успешно обновлен');
                setPercent('');
                fetchSettingsBonus();
            } else {
                alert('Поле процента пустое');
            }
        } catch (error) {
            alert('Ошибка при сохранении глобального процента');
        }
    };

    const handleCurrencyChange = (selectedCurrency) => {
        setCurrency(selectedCurrency);
    };

    return (
        <div className="status-list">
            <h1 className="status-list-title">Цена за кг</h1>
            <form className="form-filialAdd" onSubmit={handleSubmit}>
                <div className="inputs-wrapper-price">
                    <input
                        className="input-filialAdd"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder=""
                    />
                    <div className="miniButton-container">
                        <div
                            className={`miniButton ${currency === 'tenge' ? 'miniButton-active' : ''}`}
                            onClick={() => handleCurrencyChange('tenge')}
                        >
                            ₸
                        </div>
                        {/* <div
                            className={`miniButton ${currency === 'dollar' ? 'miniButton-active' : ''}`}
                            onClick={() => handleCurrencyChange('dollar')}
                        >
                            $
                        </div> */}
                    </div>
                    <p className="priceCurrency">
                        {priceMongo.price ? `${priceMongo.price}${priceMongo.currency === 'dollar' ? '$' : '₸'}` : ''}
                    </p>
                </div>
                <button className="filialAdd-button" type="submit">Сохранить</button>
            </form>

            <h1 className="title-percent">% Глобальный процент партнера</h1>
            <form className="form-filialAdd" onSubmit={handlePercentSubmit}>
                <div className="inputs-wrapper-price">
                    <input
                        className="input-filialAdd"
                        type="number"
                        value={percent}
                        onChange={(e) => setPercent(e.target.value)}
                        placeholder=""
                    />
                    <p className="priceCurrency">
                        {settingList.globalReferralBonusPercentage}%
                    </p>
                </div>
                <button className="filialAdd-button" type="submit">Обновить процент</button>
            </form>
        </div>
    );
}

export default Weight;
