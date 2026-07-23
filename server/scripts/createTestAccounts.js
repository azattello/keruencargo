const mongoose = require('mongoose');
const config = require('config');
const User = require('../models/User');
const Filial = require('../models/Filial');

const usersToCreate = [
  {
    role: 'admin',
    phone: '88000000001',
    password: 'admin123',
    name: 'Админ',
    surname: 'Основной',
    selectedFilial: '',
    personalId: 'ADMIN-01'
  },
  {
    role: 'filial',
    phone: '88000000002',
    password: 'filial123',
    name: 'Филиал',
    surname: 'Первый',
    selectedFilial: 'filial-1',
    personalId: 'F001-01'
  },
  {
    role: 'filial',
    phone: '88000000003',
    password: 'filial123',
    name: 'Филиал',
    surname: 'Второй',
    selectedFilial: 'filial-2',
    personalId: 'F002-01'
  }
];

const filialsToCreate = [
  {
    filialText: 'filial-1',
    filialName: 'Филиал №1',
    filialId: 'F001',
    filialAddress: 'г. Алматы, улица Пушкина, 1',
    contacts: {
      phone: '+77001234567',
      whatsappPhone: '+77001234567',
      whatsappLink: 'https://wa.me/77001234567',
      instagram: 'https://instagram.com/filial1',
      telegramId: '@filial1',
      telegramLink: 'https://t.me/filial1'
    },
    additionalInfo: {
      videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      chinaAddress: 'Китай, Шэньчжэнь, ул. Примерная, 1',
      whatsappNumber: '+77001234567',
      aboutUsText: 'Информация о Филиале №1',
      prohibitedItemsText: 'Запрещенные товары: ...',
      contractFilePath: ''
    }
  },
  {
    filialText: 'filial-2',
    filialName: 'Филиал №2',
    filialId: 'F002',
    filialAddress: 'г. Нур-Султан, проспект Победы, 2',
    contacts: {
      phone: '+77007654321',
      whatsappPhone: '+77007654321',
      whatsappLink: 'https://wa.me/77007654321',
      instagram: 'https://instagram.com/filial2',
      telegramId: '@filial2',
      telegramLink: 'https://t.me/filial2'
    },
    additionalInfo: {
      videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      chinaAddress: 'Китай, Гуанчжоу, ул. Примерная, 2',
      whatsappNumber: '+77007654321',
      aboutUsText: 'Информация о Филиале №2',
      prohibitedItemsText: 'Запрещенные товары: ...',
      contractFilePath: ''
    }
  }
];

async function main() {
  await mongoose.connect(config.get('dbUrl'));
  console.log('Connected to MongoDB');

  // Создаем (или обновляем) админа
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

  // Создаем филиалы для двух филиальных аккаунтов
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
