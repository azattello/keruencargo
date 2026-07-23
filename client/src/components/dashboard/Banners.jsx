import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config"; // Импорт конфигурации с apiUrl

const Banners = () => {
    const [banners, setBanners] = useState([]); // Массив для хранения баннеров
    const [activeIndex, setActiveIndex] = useState(0);

    // Функция для получения существующих баннеров с сервера
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/upload/getBanners`);
                const bannerPaths = response.data.banners || [];

                // Если меньше трех баннеров, дополняем пустыми элементами для удобства загрузки
                const updatedBanners = [...bannerPaths];
                while (updatedBanners.length < 3) {
                    updatedBanners.push(null);
                }
                setBanners(updatedBanners);
                setActiveIndex(0);
            } catch (error) {
                console.error("Ошибка при получении баннеров:", error);
            }
        };

        fetchBanners();
    }, []);

    // Авто-переключение
    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners]);

    // Функция для загрузки нового баннера
    const handleBannerClick = (index) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/png, image/jpeg"; // Только PNG и JPEG файлы

        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('banner', file); // Добавляем файл в FormData

                try {
                    const response = await axios.post(`${config.apiUrl}/api/upload/uploadBanner`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    console.log('Успешная загрузка баннера:', response.data);

                    const newBanners = [...banners];
                    newBanners[index] = response.data.url; // Сохраняем URL загруженного баннера
                    setBanners(newBanners);
                } catch (error) {
                    console.error('Ошибка при загрузке баннера:', error);
                }
            }
        };
        input.click(); // Имитируем клик для открытия диалога выбора файла
    };

    // Функция для удаления баннера
    const handleDeleteBanner = async (url) => {
        try {
            const response = await axios.delete(`${config.apiUrl}/api/upload/deleteBanner`, { data: { url } });
            console.log('Баннер успешно удалён:', response.data);

            // Обновляем список баннеров после удаления
            setBanners(banners.filter(banner => banner !== url));
        } catch (error) {
            console.error('Ошибка при удалении баннера:', error);
        }
    };
    
    

    const handlePrev = () => {
        setActiveIndex(prev => (prev - 1 + banners.length) % banners.length);
    };

    const handleNext = () => {
        setActiveIndex(prev => (prev + 1) % banners.length);
    };

    return (
        <div className="banner-list">
            <h1 className="status-list-title">Баннеры</h1>

            {banners.length === 0 ? (
                <div className="banner-empty">Баннеров нет. Загрузите первый баннер.</div>
            ) : (
                <div className="banner-slider">
                    {banners.map((banner, index) => {
                        const isActive = index === activeIndex;
                        return (
                            <div
                                key={index}
                                className={`banner-slide ${isActive ? 'active' : 'inactive'}`}
                                onClick={() => banner === null && handleBannerClick(index)}
                                style={{ cursor: banner === null ? 'pointer' : 'default' }}
                            >
                                {banner ? (
                                    <>
                                        <img src={`${config.apiUrl}${banner}`} alt={`banner-${index}`} className="banner-img" />
                                        <button
                                            className="banner-delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteBanner(banner);
                                            }}
                                        >
                                            Удалить
                                        </button>
                                    </>
                                ) : (
                                    <div className="banner-placeholder">Нажмите, чтобы загрузить баннер</div>
                                )}
                            </div>
                        );
                    })}

                    <button className="banner-control prev" onClick={handlePrev}>
                        ‹
                    </button>
                    <button className="banner-control next" onClick={handleNext}>
                        ›
                    </button>

                    <div className="banner-indicators">
                        {banners.map((_, index) => (
                            <span
                                key={`${index}-${activeIndex}`}
                                className={`banner-dot ${index === activeIndex ? 'active' : ''}`}
                                onClick={() => setActiveIndex(index)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Banners;
