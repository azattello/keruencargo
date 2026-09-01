const express = require('express');
const router = express.Router();
const Track = require('../models/Track');
const Status = require('../models/Status');
const { updateTrack, excelTrack } = require('../middleware/track.middleware');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth.middleware');
const mongoose = require('mongoose');

router.post('/addTrack', authMiddleware, updateTrack );

router.post('/addExcelTrack', authMiddleware, excelTrack );

// Роут для получения всех трек-кодов с пагинацией, поисковым запросом и сортировкой
router.get('/tracks', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const searchQuery = req.query.search || ''; // Получение поискового запроса из параметров запроса
  const sortByDate = req.query.sortByDate || 'latest'; // Получение типа сортировки из параметров запроса
  const statusFilter = req.query.status || ''; // Получение фильтра по статусу из параметров запроса
  const userFilter = req.query.userFilter || ''; // Получение фильтра по наличию пользователя из параметров запроса

  // Функция для экранирования специальных символов в regex
  const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const normalizeTrackString = (value) => {
    return String(value || '').replace(/\s+/g, '').toUpperCase();
  };

  try {
      console.log('📊 Request params:', { page, limit, searchQuery, sortByDate, statusFilter, userFilter });
      const startIndex = (page - 1) * limit;

      let matchStage = {}; // Для $match в aggregation pipeline
      let searchOrConditions = [];

      // Если есть поисковый запрос, добавляем его в запрос
      if (searchQuery) {
          const escapedQuery = escapeRegex(searchQuery);
          const regex = new RegExp(escapedQuery, 'i');
          const digitQuery = searchQuery.replace(/\D/g, '');

          // Основные условия поиска по трекам и операторам
          searchOrConditions = [
            { trackNormalized: { $regex: regex } },
            { track: { $regex: regex } },
            { 'createdBy.name': { $regex: regex } },
            { 'updatedBy.name': { $regex: regex } }
          ];

          // Условия поиска по телефонам
          if (digitQuery) {
            const phoneNumber = Number(digitQuery);
            if (!Number.isNaN(phoneNumber)) {
              searchOrConditions.push({ 'createdBy.phone': phoneNumber });
              searchOrConditions.push({ 'updatedBy.phone': phoneNumber });
            }
          }
      }

      // Добавляем фильтр по статусу
      if (statusFilter) {
        try {
          matchStage.status = new mongoose.Types.ObjectId(statusFilter);
        } catch (err) {
          console.error('Invalid statusFilter:', statusFilter);
          return res.status(400).json({ message: 'Invalid status ID' });
        }
      }
      
      // Добавляем фильтр по наличию пользователя
      if (userFilter === 'exists') {
        matchStage.user = { $exists: true, $ne: null };
      } else if (userFilter === 'notExists') {
        matchStage.user = { $exists: false };
      }

      // Если есть условия поиска, добавляем их к фильтру
      if (searchOrConditions.length > 0) {
        matchStage.$or = searchOrConditions;
      }
      
      console.log('🔍 Match stage:', JSON.stringify(matchStage, null, 2));
      
      // Устанавливаем параметры сортировки в зависимости от выбранного типа
      let sortStage = { updatedAt: -1 }; // Default sort
      if (sortByDate === 'latest') {
          sortStage = { updatedAt: -1 }; // Сортировка по последней дате обновления
      } else if (sortByDate === 'oldest') {
          sortStage = { updatedAt: 1 }; // Сортировка по первой дате обновления
      }

      console.log('⏱️ Starting track query...');
      const query = Track.find(matchStage)
        .sort(sortStage)
        .skip(startIndex)
        .limit(limit)
        .populate('status')
        .populate('history.status')
        .lean();

      const [tracks, totalCount] = await Promise.all([
        query,
        Track.countDocuments(matchStage)
      ]);

      console.log(`✅ Query complete: ${tracks.length} tracks, totalCount: ${totalCount}`);

      // Нормализуем объект пользователя
      const normalizeUserObject = (user) => {
          if (!user) return null;
          if (typeof user === 'string') return null;
          if (typeof user === 'object') {
              return {
                  _id: user._id || null,
                  name: user.name || '',
                  surname: user.surname || '',
                  phone: user.phone || null,
                  personalId: user.personalId || null,
              };
          }
          return null;
      };

      const resolveTrackStatus = (track) => {
          const normalizedHistory = (track.history || [])
            .filter(item => item && item.status)
            .map(item => ({
              ...item,
              statusText: item.status && typeof item.status === 'object' ? item.status.statusText : null,
              statusId: item.status && typeof item.status === 'object' ? item.status._id : item.status
            }))
            .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

          if (normalizedHistory.length === 0) {
              const currentStatus = track.status && typeof track.status === 'object' ? track.status.statusText : 'Неизвестно';
              return {
                  statusText: currentStatus,
                  statusId: track.status && typeof track.status === 'object' ? track.status._id : null,
                  lastUpdateDate: track.updatedAt || track.createdAt || new Date(),
              };
          }

          const lastStatus = normalizedHistory[normalizedHistory.length - 1];
          const previousStatus = normalizedHistory[normalizedHistory.length - 2] || null;

          if (lastStatus?.statusText === 'Получено' && previousStatus?.statusText && previousStatus.statusText.startsWith('Прибыло в филиал ')) {
              return {
                  statusText: previousStatus.statusText,
                  statusId: previousStatus.statusId || null,
                  lastUpdateDate: lastStatus.date || track.updatedAt || track.createdAt || new Date(),
              };
          }

          return {
              statusText: lastStatus?.statusText || 'Неизвестно',
              statusId: lastStatus?.statusId || null,
              lastUpdateDate: lastStatus?.date || track.updatedAt || track.createdAt || new Date(),
          };
      };

      const formattedTracks = tracks.map(track => {
          const resolvedStatus = resolveTrackStatus(track);
          const lastUpdateDate = resolvedStatus.lastUpdateDate;
          const operator = track.updatedBy || track.createdBy || null;
          const userObject = normalizeUserObject(track.user);
          const userName = userObject ? [userObject.name, userObject.surname].filter(Boolean).join(' ') : null;

          return {
              track: track.track || 'Без трека',
              userId: userObject ? userObject._id : null,
              personalId: userObject ? userObject.personalId : null,
              user: userName || userObject?.phone || userObject?.personalId || null,
              phone: userObject ? userObject.phone : null,
              status: resolvedStatus.statusText,
              statusDate: lastUpdateDate,
              operatorName: operator ? operator.name : null,
              operatorPhone: operator ? operator.phone : null,
              operatorRole: operator ? operator.role : null,
              createdBy: track.createdBy ? {
                  name: track.createdBy.name || null,
                  phone: track.createdBy.phone || null,
                  role: track.createdBy.role || null
              } : null,
              updatedBy: track.updatedBy ? {
                  name: track.updatedBy.name || null,
                  phone: track.updatedBy.phone || null,
                  role: track.updatedBy.role || null
              } : null,
              createdAt: track.createdAt,
              updatedAt: track.updatedAt
          };
      });

      const response = {
          totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          tracks: formattedTracks
      };

      console.log(`📤 Response: totalCount: ${totalCount}, tracks: ${formattedTracks.length}, page: ${page}/${response.totalPages}`);
      res.json(response);
  } catch (error) {
      console.error('❌ Error in /api/track/tracks:', error);
      res.status(500).json({ message: 'Ошибка сервера', details: error.message });
  }
});

// Роут для получения всех закладок пользователей, не имеющих статуса
router.get('/getBookmarksWithoutStatus', async (req, res) => {
  try {
    // Получаем всех пользователей
    const users = await User.find();

    // Собираем закладки, у которых отсутствует статус (currentStatus === null), и добавляем информацию о пользователе
    const bookmarksWithoutStatus = users.reduce((acc, user) => {
      if (user.bookmarks && user.bookmarks.length > 0) {
        const userBookmarks = user.bookmarks
          .filter(bookmark => !bookmark.currentStatus) // Проверка, что статус отсутствует
          .map(bookmark => ({
            ...bookmark.toObject(),
            user: {
              userId: user._id,
              name: user.name,
              surname: user.surname,
              phone: user.phone,
              email: user.email
            }
          }));
        return acc.concat(userBookmarks);
      }
      return acc;
    }, []);

    // Возвращаем закладки без статуса вместе с информацией о пользователе
    res.status(200).json(bookmarksWithoutStatus);
  } catch (error) {
    console.error('Ошибка при получении закладок без статуса:', error.message);
    res.status(500).json({ message: 'Произошла ошибка при получении закладок без статуса' });
  }
});

// Роут для получения полной истории трека по трек-номеру
router.get('/history/:trackNumber', async (req, res) => {
  const { trackNumber } = req.params;

  try {
    const formatted = String(trackNumber).replace(/\s+/g, '').toUpperCase();
    let track = await Track.findOne({ trackNormalized: formatted }).populate('status').populate('history.status');

    if (!track) {
      // fallback for legacy documents without normalized field
      track = await Track.findOne({ track: { $regex: new RegExp(formatted, 'i') } }).populate('status').populate('history.status');
    }

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    return res.status(200).json({ trackNumber: track.track, history: track.history, status: track.status });
  } catch (error) {
    console.error('Ошибка при получении истории трека:', error.message);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить трек (только админ)
router.delete('/:trackNumber', authMiddleware, async (req, res) => {
  try {
    const requester = await User.findById(req.user.id);
    if (!requester || requester.role !== 'admin') return res.status(403).json({ message: 'Доступ запрещён' });

    const { trackNumber } = req.params;
    if (!trackNumber) return res.status(400).json({ message: 'Track number required' });

    const formatted = String(trackNumber).replace(/\s+/g, '').toUpperCase();
    const result = await Track.findOneAndDelete({ trackNormalized: formatted });
    if (!result) return res.status(404).json({ message: 'Track not found' });

    return res.json({ message: 'Track deleted' });
  } catch (err) {
    console.error('Ошибка при удалении трека:', err);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
