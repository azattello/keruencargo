/**
 * Скрипт для ручного добавления освобождённого номера в глобальный пул (reservedIds)
 * Используйте для проверки, что следующий зарегистрированный пользователь получит этот номер.
 */

const mongoose = require('mongoose');
const config = require('config');
const GlobalIdCounter = require('./models/GlobalIdCounter');

async function run() {
  await mongoose.connect(config.get('dbUrl'));

  const counter = await GlobalIdCounter.findOne();
  if (!counter) {
    console.log('GlobalIdCounter не найден, создаю новый.');
    const newCounter = new GlobalIdCounter({ nextId: 10, reservedIds: [14] });
    await newCounter.save();
    console.log('Добавлен номер 14 в reservedIds.');
    await mongoose.disconnect();
    return;
  }

  counter.reservedIds = counter.reservedIds || [];
  if (!counter.reservedIds.includes(14)) {
    counter.reservedIds.push(14);
    console.log('Добавил 14 в reservedIds.');
  } else {
    console.log('Номер 14 уже в reservedIds.');
  }

  await counter.save();
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
