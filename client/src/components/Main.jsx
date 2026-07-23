import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './styles/main2.css';
import Tab from './Tab';
import config from '../config';

// icons
import archiveIcon from '../assets/icons/newicons/archive.png';
import filialsIcon from '../assets/icons/newicons/filials.png';
import invoiceIcon from '../assets/icons/newicons/invoice.png';
import chinaIcon from '../assets/icons/newicons/chinaadress.png';
import qrIcon from '../assets/icons/newicons/qr.png';
import dogovorIcon from '../assets/icons/newicons/dogovor.png';
import contactsIcon from '../assets/icons/newicons/contacts2.png';
import MainBookmarks from './MainBookmarks';

const Main = () => {
    const [banner, setBanner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/upload/getBanners`);
                const banners = response.data.banners || [];
                
                // Берем первый баннер из массива
                if (banners && banners.length > 0) {
                    setBanner(banners[0]);
                }
            } catch (error) {
                console.error('Ошибка при загрузке баннера:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanner();
    }, []);

    return (
        <div className="main">
            
            <header className='header-main'>
                <h1 className='text-header'>Главная</h1>
            </header>   


            <div className="section-main">

                {banner && (
                    <div className="banner-wrapper">
                        <img 
                            src={`${config.apiUrl}${banner}`} 
                            alt="Баннер" 
                            style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.3s ease' }}
                        />
                    </div>
                )}

                <div className="menu-section">
                    <Link className="menu-item-wrapper" to="/filials">
                        <img src={filialsIcon} alt="" />
                        <p>Филиалы</p>
                    </Link>
                    
                    <Link className="menu-item-wrapper" to="/invoices">
                        <img src={invoiceIcon} alt="" />
                        <p>Счета</p>
                    </Link>
                    
                    <Link className="menu-item-wrapper" to="/warehouse">
                        <img src={chinaIcon} alt="" />
                        <p>Склад</p>
                    </Link>
                    
                    <Link className="menu-item-wrapper" to="/qr">
                        <img src={qrIcon} alt="" />
                        <p>QR</p>
                    </Link>
                    
                    <Link className="menu-item-wrapper" to="/terms">
                        <img src={dogovorIcon} alt="" />
                        <p>Условия</p>
                    </Link>
                    
                    <Link className="menu-item-wrapper" to="/contacts">
                        <img src={contactsIcon} alt="" />
                        <p>Контакты</p>
                    </Link>

                    <Link className="menu-item-wrapper" to="/parcels">
                        <img src={archiveIcon} alt="" />
                        <p>Посылки</p>
                    </Link>

                    <Link className="menu-item-wrapper" to="/archive">
                        <img src={archiveIcon} alt="" />
                        <p>Архив</p>
                    </Link>
                </div>


            </div>

            <MainBookmarks/>
            <div className="area"></div>
            <Tab className="TabMain" />
        </div>
    );
};

export default Main;
