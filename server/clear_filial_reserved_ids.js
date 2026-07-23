/**
 * Скрипт для очистки списка reservedPersonalIds у всех филиалов.
 *
 * Использование: node clear_filial_reserved_ids.js
 */

const mongoose = require('mongoose');
const config = require('config');
const Filial = require('./models/Filial');
const User = require('./models/User');
const GlobalIdCounter = require('./models/GlobalIdCounter');

async function run() {
  await mongoose.connect(config.get('dbUrl'));

  console.log('Очистка reservedPersonalIds у всех филиалов...');
  const filials = await Filial.find();
  for (const filial of filials) {
    if (filial.reservedPersonalIds && filial.reservedPersonalIds.length > 0) {
      filial.reservedPersonalIds = [];
      await filial.save();
      console.log(` - ${filial.filialId} очищен`);
    }
  }

  // Обновление глобального счётчика: выставляем nextId на максимум +1
  const users = await User.find({ personalId: { $exists: true, $ne: null } }).select('personalId').lean();
  const usedNumbers = new Set();

  users.forEach(u => {
    const match = String(u.personalId).match(/-id-(\d+)$/);
    if (match) {
      usedNumbers.add(parseInt(match[1], 10));
    }
  });

  const counter = await GlobalIdCounter.findOne();
  if (!counter) {
    console.log('GlobalIdCounter не найден, создаём новый.');
  }

  const reserved = new Set((counter?.reservedIds || []).filter(n => Number.isFinite(n) && n >= 10));
  const maxUsed = Math.max(9, ...Array.from(usedNumbers), ...Array.from(reserved));

  const nextId = maxUsed + 1;

  const newCounter = counter || new GlobalIdCounter({ nextId, reservedIds: [] });
  newCounter.nextId = nextId;
  newCounter.reservedIds = Array.from(reserved).sort((a, b) => a - b);

  await newCounter.save();

  console.log(`GlobalIdCounter: nextId=${newCounter.nextId}, reservedIds=[${newCounter.reservedIds.join(', ')}]`);

  await mongoose.disconnect();
  console.log('Готово.');
}

run().catch(err => {
  console.error('Ошибка:', err);
  process.exit(1);
});
