const mongoose = require('mongoose');
const config = require('config');
const User = require('../models/User');
const Filial = require('../models/Filial');
const GlobalIdCounter = require('../models/GlobalIdCounter');

const usersToCreate = [
  {
    role: 'admin',
    phone: '87478649337',
    password: 'qwerty04',
    name: 'Admin',
    surname: 'User',
    selectedFilial: '',
    personalId: 'ADMIN-01'
  },
  {
    role: 'filial',
    phone: '87770000001',
    password: 'filial123',
    name: 'Филиал',
    surname: 'Тестовый',
    selectedFilial: 'test-filial',
    personalId: 'TEST-01'
  }
];

const filialsToCreate = [
  {
    filialText: 'test-filial',
    filialName: 'Тестовый Филиал',
    filialId: 'TEST',
    filialAddress: 'г. Алматы, Тестовый адрес, 1',
    contacts: {
      phone: '+77001234567',
      whatsappPhone: '+77001234567',
      whatsappLink: 'https://wa.me/77001234567',
      instagram: 'https://instagram.com/testfilial',
      telegramId: '@testfilial',
      telegramLink: 'https://t.me/testfilial'
    },
    additionalInfo: {
      videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      chinaAddress: 'Китай, Тестовый адрес',
      whatsappNumber: '+77001234567',
      aboutUsText: 'Информация о тестовом филиале',
      prohibitedItemsText: 'Запрещенные товары: тестовые',
      contractFilePath: ''
    }
  }
];

async function main() {
  await mongoose.connect(config.get('dbUrl'));
  console.log('Connected to MongoDB');

  // Создаем глобальный счетчик, если его нет
  let globalCounter = await GlobalIdCounter.findOne();
  if (!globalCounter) {
    globalCounter = new GlobalIdCounter({
      nextId: 10,
      reservedIds: []
    });
    await globalCounter.save();
    console.log('Created GlobalIdCounter');
  }

  // Создаем (или обновляем) пользователей
  for (const u of usersToCreate) {
    const normalizedPhone = parseInt(String(u.phone).replace(/\D/g, ''));
    let user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      user = new User({
        phone: normalizedPhone,
        password: u.password,
        name: u.name,
        surname: u.surname,
        role: u.role,
        selectedFilial: u.selectedFilial,
        personalId: u.personalId
      });
      await user.save();
      console.log(`Created user ${u.role} (${normalizedPhone})`);
    } else {
      // Обновляем роль/филиал при необходимости
      user.role = u.role;
      user.selectedFilial = u.selectedFilial;
      user.personalId = u.personalId;
      if (user.password !== u.password) {
        user.password = u.password;
      }
      await user.save();
      console.log(`Updated user ${u.role} (${normalizedPhone})`);
    }
  }

  // Создаем филиалы
  for (const f of filialsToCreate) {
    const filial = await Filial.findOne({ filialText: f.filialText });

    // Найдем пользователя, который привязан к филиалу
    const user = await User.findOne({ selectedFilial: f.filialText });

    if (!user) {
      console.warn(`User for filialText=${f.filialText} not found. Skipping filial creation.`);
      continue;
    }

    if (!filial) {
      const newFilial = new Filial({
        filialText: f.filialText,
        filialName: f.filialName,
        userPhone: user.phone,
        filialId: f.filialId,
        filialAddress: f.filialAddress,
        userId: user._id,
        contacts: f.contacts,
        additionalInfo: f.additionalInfo
      });
      await newFilial.save();
      console.log(`Created filial ${f.filialText} for user ${user.phone}`);
    } else {
      // Обновляем данные филиала
      filial.filialName = f.filialName;
      filial.userPhone = user.phone;
      filial.filialId = f.filialId;
      filial.filialAddress = f.filialAddress;
      filial.userId = user._id;
      filial.contacts = f.contacts;
      filial.additionalInfo = f.additionalInfo;
      await filial.save();
      console.log(`Updated filial ${f.filialText}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});