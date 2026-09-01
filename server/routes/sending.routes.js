const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Sending = require('../models/Sending');
const Filial = require('../models/Filial');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth.middleware');

const normalizeTrack = (value = '') => String(value).replace(/\s+/g, '').toUpperCase();
const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getOperatorInfo = async (userId) => {
  if (!userId) return null;
  const operator = await User.findById(userId).select('name phone role');
  if (!operator) return null;

  return {
    userId: operator._id,
    name: operator.name || '',
    phone: operator.phone || null,
    role: operator.role || ''
  };
};

router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { track, filial, date } = req.body;

    if (!track || !filial) {
      return res.status(400).json({ message: 'Трек и филиал обязательны' });
    }

    const filialDoc = await Filial.findById(filial);
    if (!filialDoc) {
      return res.status(404).json({ message: 'Филиал не найден' });
    }

    const normalizedTrack = normalizeTrack(track);
    const existing = await Sending.findOne({ trackNormalized: normalizedTrack, filial: filialDoc._id });
    if (existing) {
      return res.status(200).json({ message: 'Трек уже добавлен в отправку', duplicate: true });
    }

    const operatorInfo = await getOperatorInfo(req.user?.id || req.userId);
    const sending = new Sending({
      track: String(track).trim(),
      trackNormalized: normalizedTrack,
      filial: filialDoc._id,
      date: date ? new Date(date) : new Date(),
      source: 'scan',
      createdBy: operatorInfo,
      updatedBy: operatorInfo
    });

    await sending.save();
    return res.status(201).json({ message: 'Трек добавлен в отправку', sending });
  } catch (error) {
    console.error('Ошибка добавления отправки:', error);
    return res.status(500).json({ message: 'Ошибка сервера при добавлении отправки' });
  }
});

router.post('/bulk', authMiddleware, async (req, res) => {
  try {
    const { tracks = [], filial, date } = req.body;

    if (!filial) {
      return res.status(400).json({ message: 'Филиал обязателен' });
    }

    const filialDoc = await Filial.findById(filial);
    if (!filialDoc) {
      return res.status(404).json({ message: 'Филиал не найден' });
    }

    const values = Array.isArray(tracks)
      ? tracks
          .map(item => String(item || '').trim())
          .filter(Boolean)
          .map(item => normalizeTrack(item))
      : [];

    const uniqueValues = [...new Set(values)];
    if (!uniqueValues.length) {
      return res.status(400).json({ message: 'Нет треков для загрузки' });
    }

    const existing = await Sending.find({
      filial: filialDoc._id,
      trackNormalized: { $in: uniqueValues }
    }).select('trackNormalized');

    const existingSet = new Set(existing.map(item => item.trackNormalized));
    const toInsert = uniqueValues
      .filter(item => !existingSet.has(item))
      .map(trackNormalized => ({
        track: trackNormalized,
        trackNormalized,
        filial: filialDoc._id,
        date: date ? new Date(date) : new Date(),
        source: 'bulk',
        createdBy: null,
        updatedBy: null
      }));

    const operatorInfo = await getOperatorInfo(req.user?.id || req.userId);
    if (operatorInfo) {
      toInsert.forEach(item => {
        item.createdBy = operatorInfo;
        item.updatedBy = operatorInfo;
      });
    }

    if (toInsert.length) {
      await Sending.insertMany(toInsert);
    }

    return res.status(200).json({
      message: 'Данные отправки обработаны',
      added: toInsert.length,
      skipped: uniqueValues.length - toInsert.length
    });
  } catch (error) {
    console.error('Ошибка массовой отправки:', error);
    return res.status(500).json({ message: 'Ошибка сервера при массовой отправке' });
  }
});

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 100, search = '', filial = '', date = '' } = req.query;
    const query = {};

    if (filial && filial !== 'all') {
      query.filial = new mongoose.Types.ObjectId(filial);
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lt: end };
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      query.$or = [
        { track: { $regex: regex } },
        { trackNormalized: { $regex: regex } },
        { 'createdBy.name': { $regex: regex } }
      ];
    }

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 100;
    const skip = (pageNumber - 1) * limitNumber;

    const [items, total] = await Promise.all([
      Sending.find(query)
        .populate('filial', 'filialText filialName')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Sending.countDocuments(query)
    ]);

    return res.status(200).json({
      items,
      total,
      page: pageNumber,
      totalPages: Math.max(1, Math.ceil(total / limitNumber))
    });
  } catch (error) {
    console.error('Ошибка получения списка отправок:', error);
    return res.status(500).json({ message: 'Ошибка сервера при получении списка отправок' });
  }
});

module.exports = router;
