/**
 * Скрипт для тестирования новой системы personalId
 */

const mongoose = require('mongoose');
const config = require('config');
const User = require('./models/User');
const GlobalIdCounter = require('./models/GlobalIdCounter');

async function test() {
  try {
    await mongoose.connect(config.get('dbUrl'));
    console.log('✓ Подключено к БД\n');

    // Шаг 1: Проверим GlobalIdCounter
    console.log('=== GlobalIdCounter ===');
    let counter = await GlobalIdCounter.findOne();
    if (counter) {
      console.log(`nextId: ${counter.nextId}`);
      console.log(`reservedIds: ${counter.reservedIds.join(', ') || 'нет'}`);
    } else {
      console.log('GlobalIdCounter не найден!');
    }

    // Шаг 2: Посмотрим все personalId пользователей
    console.log('\n=== Пользователи с personalId ===');
    const users = await User.find({ personalId: { $exists: true, $ne: null } })
      .select('phone name personalId selectedFilial')
      .lean();

    users.forEach(u => {
      console.log(`${u.name} (${u.phone}) — ${u.personalId} [${u.selectedFilial}]`);
    });

    // Шаг 3: Новое зарядное
    console.log('\n=== Проверка формата ===');
    const hasNewFormat = users.some(u => u.personalId.includes('-id-'));
    if (hasNewFormat) {
      console.log('✓ Пользователи имеют новый формат (-id-)\n');
    } else {
      console.log('✗ Нет пользователей с новым форматом\n');
    }

    await mongoose.disconnect();
    console.log('✓ Отключено от БД');

  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

test();
