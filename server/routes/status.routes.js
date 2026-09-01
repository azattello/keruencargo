const express = require('express');
const router = express.Router();
const Status = require('../models/Status');
const User = require('../models/User');
const Filial = require('../models/Filial');
const {check, validationResult} = require("express-validator")
const jwt = require('jsonwebtoken');
const config = require('config');

// Маршрут для создания нового статуса
router.post('/addStatus', [check('statusText', 'Минимум 2 буквы').isLength({min: 2})], 
async (req, res) => {
  try {
    const { statusText } = req.body;
    const errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({message: "Неверный запрос", errors})
  }
    // Находим последний статус в базе данных для определения порядкового номера нового статуса
    const lastStatus = await Status.findOne().sort({ statusNumber: -1 });

    let newStatusNumber = 1; // Порядковый номер нового статуса по умолчанию

    // Если есть последний статус, увеличиваем его порядковый номер на 1 для нового статуса
    if (lastStatus) {
      newStatusNumber = lastStatus.statusNumber + 1;
    }

    // Создаем новый статус с полученным порядковым номером и текстом
    const newStatus = new Status({ statusNumber: newStatusNumber, statusText });
    await newStatus.save();

    res.status(201).json({ message: 'Статус успешно добавлен' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера.');
  }
});


// Маршрут для получения всех статусов
router.get('/getStatus', async (req, res) => {
  try {
    let currentUser = null;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, config.get('secretKey'));
        currentUser = await User.findById(decoded.id).lean();
      }
    } catch (tokenErr) {
      console.log('⚠️ No valid token for status request');
    }

    const receivedStatus = await Status.findOne({ statusText: 'Получено' }).lean();
    const receivedStatusNumber = receivedStatus?.statusNumber || 999;

    const getFilialArrivalStatusText = (filialName) => {
      const text = String(filialName || '').trim();
      return text ? `Прибыло в филиал ${text}` : null;
    };

    const ensureFilialArrivalStatus = async (filialName) => {
      const statusText = getFilialArrivalStatusText(filialName);
      if (!statusText) return null;

      let statusDoc = await Status.findOne({ statusText }).lean();
      if (!statusDoc) {
        const lastStatus = await Status.findOne().sort({ statusNumber: -1 }).lean();
        const nextStatusNumber = (lastStatus?.statusNumber || 0) + 1;
        statusDoc = await Status.create({ statusText, statusNumber: nextStatusNumber });
      }

      return statusDoc;
    };

    let userFilialStatus = null;
    if (currentUser && ['filial', 'client'].includes(currentUser.role)) {
      const ownFilialName = String(currentUser.selectedFilial || '').trim();
      if (ownFilialName) {
        userFilialStatus = await ensureFilialArrivalStatus(ownFilialName);
      }
    }

    let statuses = await Status.find().sort({ statusNumber: 1 }).lean();

    if (currentUser && currentUser.role === 'filial') {
      statuses = [userFilialStatus, receivedStatus].filter(Boolean);
    } else if (currentUser && currentUser.role === 'client') {
      const visibleStatuses = statuses.filter(s => {
        if (s.statusText && s.statusText.startsWith('Прибыло в филиал ')) {
          return false;
        }
        return s.statusNumber <= receivedStatusNumber;
      });

      if (userFilialStatus) {
        const filteredVisible = visibleStatuses.filter(s => s._id.toString() !== userFilialStatus._id.toString());
        const receivedIndex = filteredVisible.findIndex(s => s._id.toString() === receivedStatus?._id.toString());

        if (receivedIndex >= 0) {
          filteredVisible.splice(receivedIndex, 0, userFilialStatus);
          statuses = filteredVisible;
        } else {
          statuses = [...filteredVisible, userFilialStatus];
        }
      } else {
        statuses = visibleStatuses;
      }
    } else if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'china')) {
      statuses = statuses.filter(s => !/^Прибыло в филиал\s/.test(s.statusText || ''));
    }

    let statusCounts = [];
    try {
      const statusIds = statuses.map(s => s._id);
      statusCounts = await Status.aggregate([
        { $match: { _id: { $in: statusIds } } },
        { $lookup: { from: 'tracks', localField: '_id', foreignField: 'status', as: 'tracks' } },
        { $project: { _id: 1, statusText: 1, count: { $size: '$tracks' } } }
      ]);
    } catch (aggError) {
      console.error('❌ Aggregation error:', aggError);
      statusCounts = [];
      for (const status of statuses) {
        const Track = require('../models/Track');
        const count = await Track.countDocuments({ status: status._id });
        statusCounts.push({ _id: status._id, statusText: status.statusText, count });
      }
    }

    const countMap = new Map(statusCounts.map(sc => [sc._id.toString(), sc.count]));
    const statusesWithCounts = statuses.map(status => ({
      ...status,
      count: countMap.get(status._id.toString()) || 0
    }));

    res.status(200).json(statusesWithCounts);
  } catch (error) {
    console.error('Error in /api/status/getStatus:', error);
    res.status(500).send('Ошибка сервера.');
  }
});


// Маршрут для удаления статуса по идентификатору
router.delete('/deleteStatus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Находим статус по его идентификатору и удаляем его
    await Status.findByIdAndDelete(id);
    res.status(200).json({ message: 'Статус успешно удален' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера.');
  }
});



module.exports = router;
