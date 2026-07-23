const express = require('express');
const router = express.Router();
const Status = require('../models/Status');
const {check, validationResult} = require("express-validator")

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
    // Получаем все статусы из базы данных
    const statuses = await Status.find().sort({ createdAt: -1 });
    console.log('Statuses found:', statuses.length);

    // Получаем количество треков для каждого статуса
    let statusCounts = [];
    try {
      statusCounts = await Status.aggregate([
        {
          $lookup: {
            from: 'tracks',
            localField: '_id',
            foreignField: 'status',
            as: 'tracks'
          }
        },
        {
          $project: {
            _id: 1,
            statusText: 1,
            count: { $size: '$tracks' }
          }
        }
      ]);
      console.log('Status counts:', statusCounts);
    } catch (aggError) {
      console.error('Aggregation error:', aggError);
      // Fallback: count manually
      statusCounts = [];
      for (const status of statuses) {
        const count = await Track.countDocuments({ status: status._id });
        statusCounts.push({ _id: status._id, statusText: status.statusText, count });
      }
    }

    // Объединяем статусы с counts
    const statusesWithCounts = statuses.map(status => {
      const countData = statusCounts.find(sc => sc._id.toString() === status._id.toString());
      return {
        ...status.toObject(),
        count: countData ? countData.count : 0
      };
    });

    // Отправляем список статусов в ответ на запрос
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
