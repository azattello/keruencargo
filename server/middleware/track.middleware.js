const mongoose = require('mongoose');
const Track = require('../models/Track');
const Settings = require('../models/Settings');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Status = require('../models/Status');
const { sendPushToUser } = require('../utils/pushHelper');

const normalize = (s = '') => String(s).replace(/\s+/g, '').toUpperCase();
const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveStatus = async (statusValue) => {
    if (!statusValue) return null;

    if (mongoose.isValidObjectId(statusValue)) {
        return Status.findById(statusValue);
    }

    const statusText = String(statusValue).trim();
    if (!statusText) return null;

    let statusDoc = await Status.findOne({ statusText }).lean();
    if (!statusDoc) {
        statusDoc = await Status.findOne({
            statusText: { $regex: new RegExp(`^${escapeRegex(statusText)}$`, 'i') }
        }).lean();
    }

    if (!statusDoc) {
        const lastStatus = await Status.findOne().sort({ statusNumber: -1 }).lean();
        const nextStatusNumber = (lastStatus?.statusNumber || 0) + 1;
        statusDoc = await Status.create({ statusText, statusNumber: nextStatusNumber });
    }

    return statusDoc;
};

const updateTrack = async (req, res, next) => {
    try {
        const { track, status, date } = req.body;

        const operator = req.user ? await User.findById(req.user.id).select('name phone role') : null;
        const operatorInfo = operator ? {
            userId: operator._id,
            name: operator.name || '',
            phone: operator.phone || null,
            role: operator.role || ''
        } : null;

        // Получаем объект статуса (поддержка и ObjectId, и названия статуса)
        let statusObj = null;
        let storedStatus = status;
        if (status) {
            statusObj = await resolveStatus(status);
            storedStatus = statusObj?._id || status;
        }

        // Проверяем, существует ли трек с переданным номером
        let existingTrack = await Track.findOne({ track });

        if (!existingTrack) {
            // Если трек не существует, создаем новую запись
            const newTrack = new Track({
                track,
                trackNormalized: normalize(track),
                status: storedStatus,
                history: [{ status: storedStatus, date }],
                createdBy: operatorInfo,
                updatedBy: operatorInfo
            });
            // Сохраняем новый трек
            await newTrack.save();
            return res.status(201).json({ message: 'Новая запись трека успешно создана' });
        } else {
            // Если трек существует, обновляем его данные
            const oldStatus = existingTrack.status;
            existingTrack.status = storedStatus;
            existingTrack.updatedBy = operatorInfo;

            // Добавляем новую запись в историю
            existingTrack.history.push({ status: storedStatus, date });

            // Сохраняем обновленный трек
            await existingTrack.save();

            // Отправляем уведомления пользователям, у которых есть этот трек в закладках
            await sendTrackNotifications(track, statusObj, date);

            return res.status(200).json({ message: 'Данные трека успешно обновлены' });
        }

    } catch (error) {
        console.error('Ошибка при обновлении или создании трека:', error);
        return res.status(500).json({ message: 'Произошла ошибка при обновлении или создании трека' });
        next(error);
    }
};

// Функция для отправки уведомлений пользователям
async function sendTrackNotifications(trackNumber, statusObj, historyDate) {
    try {
        // Проверяем, прошла ли уже дата статуса
        if (historyDate) {
            const statusDate = new Date(historyDate);
            const now = new Date();
            if (statusDate > now) {
                console.log(`⏳ Статус ${statusObj?.statusText} для трека ${trackNumber} имеет будущую дату ${historyDate}, уведомление не отправляется`);
                return; // Не отправляем уведомление, так как дата еще не наступила
            }
        }

        // Находим всех пользователей, у которых этот трек в закладках
        const users = await User.find({ 
            'bookmarks.trackNumber': trackNumber 
        });

        if (!users || users.length === 0) {
            console.log(`🔍 Пользователи с треком ${trackNumber} не найдены`);
            return;
        }

        console.log(`📦 Найдено ${users.length} пользователей с треком ${trackNumber}`);

        const statusText = statusObj?.statusText || 'Статус обновлён';
        const message = `трек ${trackNumber} - добавлен новый статус ${statusText}`;

        for (const user of users) {
            // Создаем уведомление
            const notification = new Notification({
                userId: user._id,
                type: 'parcels',
                title: 'Обновление статуса посылки',
                message,
                isRead: false,
                data: {
                    trackNumber,
                    status: statusText,
                    statusId: statusObj?._id
                }
            });

            await notification.save();
            console.log(`✅ Уведомление создано для пользователя ${user._id}`);
            
            // Отправляем push уведомление
            await sendPushToUser(user, 'Обновление статуса посылки', message, {
                trackNumber,
                status: statusText
            });
        }
    } catch (error) {
        console.error('❌ Ошибка при отправке уведомлений:', error);
    }
}




const excelTrack = async (req, res, next) => {
    try {
        const { tracks, status, date } = req.body;

        const operator = req.user ? await User.findById(req.user.id).select('name phone role') : null;
        const operatorInfo = operator ? {
            userId: operator._id,
            name: operator.name || '',
            phone: operator.phone || null,
            role: operator.role || ''
        } : null;

        console.log(`📊 Массовое обновление треков: ${tracks.length} шт`);

        // Получаем объект статуса (поддержка и ObjectId, и названия статуса)
        let statusObj = null;
        let storedStatus = status;
        if (status) {
            statusObj = await resolveStatus(status);
            storedStatus = statusObj?._id || status;
        }

        // Получаем список уже существующих треков
        const existingTracks = await Track.find({ track: { $in: tracks } });

        // Разделяем массив треков на существующие и новые
        const existingTrackNumbers = existingTracks.map(track => track.track);
        let newTracksData = tracks.filter(track => !existingTrackNumbers.includes(track))
            .map(track => ({
                track,
                trackNormalized: normalize(track),
                status: storedStatus,
                history: [{ status: storedStatus, date }]
            }));

        // Обновляем данные существующих треков
        await Track.updateMany({ track: { $in: existingTrackNumbers } }, {
            $set: { status: storedStatus, updatedBy: operatorInfo },
            $push: { history: { status: storedStatus, date } }
        });

        // Убедимся, что у существующих треков есть поле trackNormalized
        const missingNormalizedTracks = await Track.find({ track: { $in: existingTrackNumbers }, trackNormalized: { $exists: false } }, 'track').lean();
        if (missingNormalizedTracks.length > 0) {
            const normalizeOps = missingNormalizedTracks.map(tr => ({
                updateOne: {
                    filter: { track: tr.track, trackNormalized: { $exists: false } },
                    update: { $set: { trackNormalized: normalize(tr.track) } }
                }
            }));
            await Track.bulkWrite(normalizeOps);
        }

        // Добавляем новые треки
        if (newTracksData.length > 0) {
            // Добавляем данные оператора если есть
            if (operatorInfo) {
                newTracksData = newTracksData.map(track => ({
                    ...track,
                    createdBy: operatorInfo,
                    updatedBy: operatorInfo
                }));
            }
            await Track.insertMany(newTracksData);
        }

        // Отправляем уведомления для обновлённых треков в фоне, не задерживая ответ
        if (existingTrackNumbers.length > 0) {
            (async () => {
                try {
                    console.log(`📬 Фоновая отправка уведомлений для ${existingTrackNumbers.length} треков...`);
                    const notificationPromises = existingTrackNumbers.map(trackNumber => 
                        sendTrackNotifications(trackNumber, statusObj, date).catch(err => {
                            console.error(`❌ Ошибка при отправке уведомлений для трека ${trackNumber}:`, err.message);
                        })
                    );
                    await Promise.all(notificationPromises);
                    console.log(`✅ Фоновые уведомления отправлены`);
                } catch (err) {
                    console.error('❌ Ошибка фоновой отправки уведомлений:', err);
                }
            })();
        }

        return res.status(200).json({ message: 'Данные треков успешно обновлены или созданы' });

    } catch (error) {
        console.error('❌ Ошибка при обновлении или создании треков:', error);
        return res.status(500).json({ message: 'Произошла ошибка при обновлении или создании треков' });
        next(error);
    }
};



module.exports = { updateTrack, excelTrack};
