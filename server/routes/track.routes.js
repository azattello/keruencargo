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
      console.log('Request params:', { page, limit, searchQuery, sortByDate, statusFilter, userFilter });
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      let query = {}; // Пустой объект запроса, который будет использоваться для фильтрации
      let filterConditions = [];

      // Если есть поисковый запрос, добавляем его в запрос
      let userIdsForSearch = [];
      let bookmarkTrackNormalizeds = [];
      let statusIdsForSearch = [];
      if (searchQuery) {
          const escapedQuery = escapeRegex(searchQuery);
          const regex = new RegExp(escapedQuery, 'i');
          const digitQuery = searchQuery.replace(/\D/g, '');

          const userSearchConditions = [
            { personalId: { $regex: regex } },
            { name: { $regex: regex } },
            { surname: { $regex: regex } },
            { email: { $regex: regex } }
          ];

          if (digitQuery) {
            const phoneNumber = Number(digitQuery);
            if (!Number.isNaN(phoneNumber)) {
              userSearchConditions.push({ phone: phoneNumber });
            }
          }

          const matchedUsers = await User.find({
            $or: userSearchConditions
          }, '_id bookmarks').lean();

          userIdsForSearch = matchedUsers.map(u => u._id);
          const trackNormalizedSet = new Set();
          matchedUsers.forEach(user => {
            (user.bookmarks || []).forEach(bookmark => {
              const normalizedBookmark = normalizeTrackString(bookmark.trackNormalized || bookmark.trackNumber);
              if (normalizedBookmark) trackNormalizedSet.add(normalizedBookmark);
            });
          });
          bookmarkTrackNormalizeds = [...trackNormalizedSet];

          const matchedStatuses = await Status.find({ statusText: { $regex: regex } }, '_id').lean();
          statusIdsForSearch = matchedStatuses.map(s => s._id);

          const searchConditions = [
            { trackNormalized: { $regex: regex } },
            { track: { $regex: regex } },
            { 'createdBy.name': { $regex: regex } },
            { 'updatedBy.name': { $regex: regex } },
            ...(userIdsForSearch.length ? [{ user: { $in: userIdsForSearch } }] : []),
            ...(statusIdsForSearch.length ? [{ status: { $in: statusIdsForSearch } }] : []),
            ...(bookmarkTrackNormalizeds.length ? [{ trackNormalized: { $in: bookmarkTrackNormalizeds } }] : []),
            ...(digitQuery ? [{ 'createdBy.phone': Number(digitQuery) }, { 'updatedBy.phone': Number(digitQuery) }] : [])
          ];

          if (searchConditions.length) {
            filterConditions.push({ $or: searchConditions });
          }
      }

      // Если есть фильтр по статусу, добавляем его в запрос
      if (statusFilter) {
        try {
          filterConditions.push({ status: new mongoose.Types.ObjectId(statusFilter) });
        } catch (err) {
          console.error('Invalid statusFilter:', statusFilter);
          return res.status(400).json({ message: 'Invalid status ID' });
        }
      }
      
      // Если есть фильтр по наличию пользователя, добавляем его в запрос
      if (userFilter === 'exists') {
        filterConditions.push({ user: { $exists: true } });
      } else if (userFilter === 'notExists') {
        filterConditions.push({ user: { $exists: false } });
      }

      if (filterConditions.length > 1) {
        query = { $and: filterConditions };
      } else if (filterConditions.length === 1) {
        query = filterConditions[0];
      }

      console.log('Built query:', JSON.stringify(query, null, 2));
      
      // Устанавливаем параметры сортировки в зависимости от выбранного типа
      let sortOptions = {};
      if (sortByDate === 'latest') {
          sortOptions = { 'history.date': 'desc' }; // Сортировка по последней дате в истории
      } else if (sortByDate === 'oldest') {
          sortOptions = { 'history.date': 'asc' }; // Сортировка по первой дате в истории
      }

      let tracks = await Track.find(query)
          .sort(sortOptions)
          .limit(limit)
          .skip(startIndex);

      // Для треков с user как string (старые), найти User по id или phone в одной пакетной выборке
      const legacyTracks = tracks.filter(track => track.user && typeof track.user === 'string' && track.user.trim());
      if (legacyTracks.length > 0) {
          const rawUsers = [...new Set(legacyTracks.map(track => track.user.trim()))];
          const ids = [];
          const phones = [];

          rawUsers.forEach(rawUser => {
              if (mongoose.isValidObjectId(rawUser)) {
                  ids.push(rawUser);
                  return;
              }

              const phone = rawUser.replace(/\D/g, '');
              if (phone) {
                  const phoneNumber = Number(phone);
                  if (!Number.isNaN(phoneNumber)) {
                      phones.push(phoneNumber);
                  }
              }
          });

          const userQuery = { $or: [] };
          if (ids.length) userQuery.$or.push({ _id: { $in: ids } });
          if (phones.length) userQuery.$or.push({ phone: { $in: phones } });

          const legacyUsers = userQuery.$or.length > 0
            ? await User.find(userQuery, 'name surname phone personalId').lean()
            : [];

          const usersById = new Map();
          const usersByPhone = new Map();
          legacyUsers.forEach(user => {
              if (user._id) usersById.set(user._id.toString(), user);
              if (typeof user.phone !== 'undefined') usersByPhone.set(String(user.phone), user);
          });

          legacyTracks.forEach(track => {
              const rawUser = track.user.trim();
              if (mongoose.isValidObjectId(rawUser)) {
                  track.user = usersById.get(rawUser) || null;
              } else {
                  const phone = rawUser.replace(/\D/g, '');
                  track.user = phone ? usersByPhone.get(phone) || null : null;
              }
          });
      }

      // Для треков без user, ищем в bookmarks пользователей и сохраняем название продукта
      const tracksWithoutUser = tracks.filter(t => !t.user);
      console.log(`Tracks without user: ${tracksWithoutUser.map(t => normalizeTrackString(t.trackNormalized || t.track)).join(', ')}`);
      const bookmarkProductByTrack = {};
      if (tracksWithoutUser.length > 0) {
          const trackNormalizeds = tracksWithoutUser.map(t => normalizeTrackString(t.trackNormalized || t.track));
          const usersWithBookmarks = await User.find({
              'bookmarks.trackNormalized': { $in: trackNormalizeds }
          }, '_id name surname phone personalId bookmarks.trackNormalized bookmarks.trackNumber bookmarks.description').lean();
          console.log(`Users with bookmarks: ${usersWithBookmarks.length}`);

          const userMap = {};
          usersWithBookmarks.forEach(user => {
              (user.bookmarks || []).forEach(bookmark => {
                  const normalizedBookmark = normalizeTrackString(bookmark.trackNormalized || bookmark.trackNumber);
                  if (trackNormalizeds.includes(normalizedBookmark)) {
                      userMap[normalizedBookmark] = {
                          _id: user._id,
                          name: user.name,
                          surname: user.surname,
                          phone: user.phone,
                          personalId: user.personalId,
                          productName: bookmark.description || null
                      };
                      if (bookmark.description) {
                        bookmarkProductByTrack[normalizedBookmark] = bookmark.description;
                      }
                  }
              });
          });

          tracks.forEach(t => {
              const normalizedTrack = normalizeTrackString(t.trackNormalized || t.track);
              if (!t.user && normalizedTrack && userMap[normalizedTrack]) {
                  t.user = userMap[normalizedTrack];
                  t.productName = userMap[normalizedTrack].productName;
              }
          });
      }

      // Для треков с пользователем — по возможности достаём описание товара из его bookmarks
      const userIdsWithBookmarks = [...new Set(tracks.filter(t => t.user && typeof t.user === 'object' && t.user._id).map(t => String(t.user._id)))];
      const trackProductCacheByUser = {};
      if (userIdsWithBookmarks.length > 0) {
          const usersWithBookmarks = await User.find({ _id: { $in: userIdsWithBookmarks } }, 'bookmarks.trackNormalized bookmarks.trackNumber bookmarks.description').lean();
          usersWithBookmarks.forEach(user => {
              const bookmarkMap = {};
              (user.bookmarks || []).forEach(bookmark => {
                  const normalizedBookmark = normalizeTrackString(bookmark.trackNormalized || bookmark.trackNumber);
                  bookmarkMap[normalizedBookmark] = bookmark.description || null;
              });
              trackProductCacheByUser[user._id.toString()] = bookmarkMap;
          });
      }

      // Теперь populate user, статус и статус в истории
      tracks = await Track.populate(tracks, [
        { path: 'user', select: 'name surname phone personalId' },
        { path: 'status', select: 'statusText' },
        { path: 'history.status', select: 'statusText' }
      ]);

      const totalCount = await Track.countDocuments(query); // Также учитываем query при подсчете общего количества документов

      // Форматируем треки для фронта с последним статусом и оператором
      const normalizeUserObject = (user) => {
          if (!user) return null;
          if (typeof user === 'string') return null;
          if (typeof user === 'object') {
              const innerUser = user.user && typeof user.user === 'object' ? user.user : user;
              return {
                  _id: innerUser._id || null,
                  name: innerUser.name || innerUser.firstName || '',
                  surname: innerUser.surname || innerUser.lastName || '',
                  phone: innerUser.phone || innerUser.phoneNumber || null,
                  personalId: innerUser.personalId || null,
              };
          }
          return null;
      };

      const formattedTracks = tracks.map(track => {
          const lastHistory = Array.isArray(track.history) && track.history.length > 0 ? track.history[track.history.length - 1] : null;
          const lastStatusText = track.status ? track.status.statusText : ((lastHistory?.status?.statusText || lastHistory?.statusText) || 'Неизвестно');
          const lastUpdateDate = lastHistory?.date || track.updatedAt || track.createdAt;
          const operator = track.updatedBy || track.createdBy || null;
          const userObject = normalizeUserObject(track.user);
          const userName = userObject ? [userObject.name, userObject.surname].filter(Boolean).join(' ') : null;
          const normalizedTrack = normalizeTrackString(track.trackNormalized || track.track);
          const productNameForUser = userObject && userObject._id ? trackProductCacheByUser[String(userObject._id)]?.[normalizedTrack] : null;
          const productName = track.productName || productNameForUser || bookmarkProductByTrack[normalizedTrack] || null;
          const history = (track.history || []).map(item => {
              const plainItem = item && item.toObject ? item.toObject() : item;
              return {
                  ...plainItem,
                  statusText: plainItem.status?.statusText || plainItem.statusText || null,
                  status: plainItem.status && typeof plainItem.status === 'object' ? plainItem.status._id : plainItem.status,
                  date: plainItem.date || null
              };
          });

          return {
              track: track.track || 'Без трека',
              userId: userObject ? userObject._id : null,
              personalId: userObject ? userObject.personalId : null,
              user: userName || userObject?.phone || userObject?.personalId || null,
              phone: userObject ? userObject.phone : null,
              productName,
              status: lastStatusText,
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
              history: history,
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

      console.log('Response: totalCount:', totalCount, 'tracks length:', formattedTracks.length);
      res.json(response);
  } catch (error) {
      console.error('Error in /api/track/tracks:', error);
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
