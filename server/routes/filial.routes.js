const express = require('express');
const router = express.Router();
const Filial = require('../models/Filial');
const User = require('../models/User');
const multer = require('multer');

// Конфигурация multer для загрузки контрактов
const contractStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/contracts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const uploadContract = multer({ storage: contractStorage });

// Маршрут для добавления нового филиала
router.post('/addFilial', async (req, res) => {
    try {
      const { filialId, filialText, filialName, userPhone, filialAddress } = req.body;
      
      // Проверяем, существует ли пользователь с указанным номером телефона
      const user = await User.findOne({ phone: userPhone });
      if (!user) {
        return res.status(400).json({ message: 'Пользователь с указанным номером телефона не найден' });
      }
      
       // Проверяем, является ли пользователь администратором
    if (user.role === 'admin') {
        return res.status(400).json({ message: 'Нельзя создать филиал для пользователя с ролью администратора' });
      }

      // Проверяем, существует ли уже филиал для данного пользователя
      const existingFilial = await Filial.findOne({ userId: user._id });
      if (existingFilial) {
        return res.status(400).json({ message: 'У пользователя уже есть филиал' });
      }

      // Присваиваем пользователю роль "filial"
      user.role = 'filial';
      await user.save();
  
      // Создаем новый филиал
      const newFilial = new Filial({ filialId, filialText, filialName: filialName || '', userPhone, filialAddress, userId: user._id  });
      await newFilial.save();
  
      res.status(201).json({ message: 'Филиал успешно добавлен' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Ошибка сервера.');
    }
  });


// Маршрут для получения данных о всех филиалах и их пользователях, отсортированных по дате создания
router.get('/getFilial', async (req, res) => {
    try {
      // Получаем данные о всех филиалах из базы данных, отсортированные по дате создания
      const filials = await Filial.find().sort({ createdAt: 'asc' });
  
      // Создаем массив для хранения данных о филиалах и их пользователях
      const filialData = [];
  
      // Для каждого филиала находим соответствующего пользователя и добавляем данные в массив
      for (const filial of filials) {
        const user = await User.findOne({ phone: filial.userPhone });
        filialData.push({
          filial,
          user
        });
      }

      res.status(200).json(filialData);
    } catch (error) {
      console.log(error);
      res.status(500).send('Ошибка сервера');
    }
  });

// Маршрут для удаления филиала
router.delete('/deleteFilial/:id', async (req, res) => {
  try {
    const filialId = req.params.id;

    // Находим филиал по его идентификатору
    const filial = await Filial.findById(filialId);
    if (!filial) {
      return res.status(404).json({ message: 'Филиал не найден' });
    }

    // Находим пользователя, привязанного к этому филиалу
    const user = await User.findById(filial.userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Изменяем роль пользователя на "client"
    user.role = 'client';
    await user.save();

    // Удаляем филиал
    await Filial.findByIdAndDelete(filialId);

    res.status(200).json({ message: 'Филиал успешно удален' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера.');
  }
});

// Маршрут для обновления филиала
router.put('/updateFilial/:id', async (req, res) => {
  try {
    const filialId = req.params.id;
    const { filialId: newFilialId, filialText, filialName, userPhone, filialAddress } = req.body;

    // Находим филиал по его идентификатору
    const filial = await Filial.findById(filialId);
    if (!filial) {
      return res.status(404).json({ message: 'Филиал не найден' });
    }

    // Обновляем поля филиала
    if (newFilialId) filial.filialId = newFilialId;
    if (filialText) filial.filialText = filialText;
    if (filialName !== undefined) filial.filialName = filialName;
    if (userPhone) filial.userPhone = userPhone;
    if (filialAddress) filial.filialAddress = filialAddress;

    // Сохраняем обновленный филиал
    await filial.save();

    res.status(200).json({ message: 'Филиал успешно обновлен', filial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Маршрут для получения данных о филиале по номеру телефона пользователя
router.get('/getFilialByUserPhone', async (req, res) => {
  const { userPhone } = req.query;

  // Проверка наличия номера телефона
  if (!userPhone) {
    return res.status(400).json({ message: 'Номер телефона не предоставлен' });
  }

  try {
    // Находим филиал по номеру телефона пользователя
    const filial = await Filial.findOne({ userPhone });

    // Проверка, найден ли филиал
    if (!filial) {
      return res.status(404).json({ message: 'Филиал не найден' });
    }

    // Отправка данных о филиале
    res.status(200).json(filial);
  } catch (error) {
    console.error('Ошибка при получении филиала по номеру телефона:', error.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});



// Маршрут для получения пользователей по названию филиала
router.get('/getUsersByFilial', async (req, res) => {
  const { filialText } = req.query;

  try {
    // Поиск пользователей по названию филиала
    const users = await User.find({ selectedFilial: filialText }).lean();

    // Проверка, есть ли пользователи
    if (users.length === 0) {
      return res.status(404).json({ message: 'Пользователи не найдены' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Маршрут для обновления контактов филиала
router.post('/updateFilialContacts', async (req, res) => {
  try {
    const { userId, phone, whatsappPhone, whatsappLink, instagram, telegramId, telegramLink } = req.body;
    const mongoose = require('mongoose');
    const searchUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

    // Находим филиал по userId
    const filial = await Filial.findOne({ userId: searchUserId });
    if (!filial) {
      return res.status(404).json({ message: 'Филиал не найден' });
    }

    // Инициализируем contacts если не существует
    if (!filial.contacts) {
      filial.contacts = {
        phone: '',
        whatsappPhone: '',
        whatsappLink: '',
        instagram: '',
        telegramId: '',
        telegramLink: ''
      };
    }

    // Обновляем контакты
    if (phone !== undefined) filial.contacts.phone = phone;
    if (whatsappPhone !== undefined) filial.contacts.whatsappPhone = whatsappPhone;
    if (whatsappLink !== undefined) filial.contacts.whatsappLink = whatsappLink;
    if (instagram !== undefined) filial.contacts.instagram = instagram;
    if (telegramId !== undefined) filial.contacts.telegramId = telegramId;
    if (telegramLink !== undefined) filial.contacts.telegramLink = telegramLink;

    await filial.save();
    res.status(200).json(filial.contacts);
  } catch (error) {
    console.error('Ошибка при обновлении контактов филиала:', error.message);
    res.status(500).send('Ошибка сервера.');
  }
});

// Маршрут для получения контактов филиала
router.get('/getFilialContacts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const mongoose = require('mongoose');
    const searchUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const filial = await Filial.findOne({ userId: searchUserId });
    if (!filial) {
      return res.status(404).json({ message: 'Филиал не найден' });
    }

    // Инициализируем contacts если не существует
    if (!filial.contacts) {
      filial.contacts = {
        phone: '',
        whatsappPhone: '',
        whatsappLink: '',
        instagram: '',
        telegramId: '',
        telegramLink: ''
      };
      await filial.save(); // Сохраняем инициализированный объект
    }

    res.status(200).json(filial.contacts);
  } catch (error) {
    console.error('Ошибка при получении контактов филиала:', error.message);
    res.status(500).send('Ошибка сервера.');
  }
});

// Маршрут для обновления дополнительной информации филиала
router.post('/updateFilialSettings', async (req, res) => {
  try {
    const { userId, videoLink, chinaAddress, whatsappNumber, aboutUsText, prohibitedItemsText, contractFilePath } = req.body;
    const mongoose = require('mongoose');
    const searchUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

    // Находим филиал по userId
    const filial = await Filial.findOne({ userId: searchUserId });
    if (!filial) {
      return res.status(404).json({ message: 'Филиал не найден' });
    }

    // Инициализируем additionalInfo если не существует
    if (!filial.additionalInfo) {
      filial.additionalInfo = {
        videoLink: '',
        chinaAddress: '',
        whatsappNumber: '',
        aboutUsText: '',
        prohibitedItemsText: '',
        contractFilePath: ''
      };
    }

    // Обновляем доп. информацию
    if (videoLink !== undefined) filial.additionalInfo.videoLink = videoLink;
    if (chinaAddress !== undefined) filial.additionalInfo.chinaAddress = chinaAddress;
    if (whatsappNumber !== undefined) filial.additionalInfo.whatsappNumber = whatsappNumber;
    if (aboutUsText !== undefined) filial.additionalInfo.aboutUsText = aboutUsText;
    if (prohibitedItemsText !== undefined) filial.additionalInfo.prohibitedItemsText = prohibitedItemsText;
    if (contractFilePath !== undefined) filial.additionalInfo.contractFilePath = contractFilePath;

    await filial.save();
    res.status(200).json(filial.additionalInfo);
  } catch (error) {
    console.error('Ошибка при обновлении доп. информации филиала:', error.message);
    res.status(500).send('Ошибка сервера.');
  }
});

// Маршрут для получения дополнительной информации филиала
router.get('/getFilialSettings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const mongoose = require('mongoose');
    const searchUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const filial = await Filial.findOne({ userId: searchUserId });
    if (!filial) {
      return res.status(404).json({ message: 'Пользователь с таким ID не является филиалом' });
    }

    // Инициализируем additionalInfo если не существует
    if (!filial.additionalInfo) {
      filial.additionalInfo = {
        videoLink: '',
        chinaAddress: '',
        whatsappNumber: '',
        aboutUsText: '',
        prohibitedItemsText: '',
        contractFilePath: ''
      };
      await filial.save(); // Сохраняем инициализированный объект
    }

    res.status(200).json(filial.additionalInfo);
  } catch (error) {
    console.error('Ошибка при получении доп. информации филиала:', error.message);
    res.status(500).send('Ошибка сервера.');
  }
});

// Маршрут для получения контактов филиала по названию (для клиентов)
router.get('/getFilialContactsByName/:filialText', async (req, res) => {
  try {
    const { filialText } = req.params;
    const decodedFilialText = decodeURIComponent(filialText);
    console.log('Searching for filial contacts by name:', decodedFilialText);
    
    // Логируем все филиалы для отладки
    const allFilials = await Filial.find({}, 'filialText');
    console.log('All filialTexts in DB:', allFilials.map(f => f.filialText));
    
    const filial = await Filial.findOne({ filialText: decodedFilialText });
    console.log('Found filial:', filial ? filial.filialText : 'not found');
    if (!filial) {
      return res.status(404).json({ message: 'Филиал не найден' });
    }

    // Инициализируем contacts если не существует
    if (!filial.contacts) {
      filial.contacts = {
        phone: '',
        whatsappPhone: '',
        whatsappLink: '',
        instagram: '',
        telegramId: '',
        telegramLink: ''
      };
      await filial.save(); // Сохраняем инициализированный объект
    }

    res.status(200).json(filial.contacts);
  } catch (error) {
    console.error('Ошибка при получении контактов филиала:', error.message);
    res.status(500).send('Ошибка сервера.');
  }
});

// Маршрут для получения настроек филиала по названию (для клиентов)
router.get('/getFilialSettingsByName/:filialText', async (req, res) => {
  try {
    const { filialText } = req.params;
    const decodedFilialText = decodeURIComponent(filialText);
    console.log('Searching for filial settings by name:', decodedFilialText);
    
    // Логируем все филиалы для отладки
    const allFilials = await Filial.find({}, 'filialText');
    console.log('All filialTexts in DB:', allFilials.map(f => f.filialText));
    
    const filial = await Filial.findOne({ filialText: decodedFilialText });
    console.log('Found filial:', filial ? filial.filialText : 'not found');
    if (!filial) {
      return res.status(404).json({ message: 'Филиал не найден' });
    }

    // Инициализируем additionalInfo если не существует
    if (!filial.additionalInfo) {
      filial.additionalInfo = {
        videoLink: '',
        chinaAddress: '',
        whatsappNumber: '',
        aboutUsText: '',
        prohibitedItemsText: '',
        contractFilePath: ''
      };
      await filial.save(); // Сохраняем инициализированный объект
    }

    res.status(200).json(filial.additionalInfo);
  } catch (error) {
    console.error('Ошибка при получении доп. информации филиала:', error.message);
    res.status(500).send('Ошибка сервера.');
  }
});

// Маршрут для получения филиала по userId
router.get('/getFilialByUser/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const mongoose = require('mongoose');
    const searchUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

    const filial = await Filial.findOne({ userId: searchUserId });
    if (!filial) {
      return res.status(404).json({ message: 'Филиал не найден' });
    }

    res.json({
      _id: filial._id,
      filialText: filial.filialText,
      filialName: filial.filialName,
      filialAddress: filial.filialAddress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
