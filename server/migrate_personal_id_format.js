/**
 * Скрипт миграции personalId с формата "F002-10" на "F002-id-10"
 * Использование: node migrate_personal_id_format.js
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const GlobalIdCounter = require('./models/GlobalIdCounter');
const config = require('config');

const dbUrl = config.get('dbUrl');

async function migrate() {
  try {
    await mongoose.connect(dbUrl);
    console.log('✓ Подключено к БД');

    // Вся миграция в одной транзакции с сессией (если возможно)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Шаг 1: Найти всех пользователей со старым форматом personalId
      const usersWithOldFormat = await User.find({
        personalId: { $exists: true, $ne: null }
      }).select('_id personalId selectedFilial').session(session);

      console.log(`\nНайдено пользователей с personalId: ${usersWithOldFormat.length}`);

      let migratedCount = 0;
      let maxIdNumber = 10;

      // Шаг 2: Преобразовать формат personalId
      for (const user of usersWithOldFormat) {
        const oldId = user.personalId;
        
        // Проверяем, уже ли в новом формате (содержит "-id-")
        if (oldId.includes('-id-')) {
          console.log(`[SKIP] ${oldId} — уже в новом формате`);
          
          // Извлекаем номер для отслеживания максимума
          const match = oldId.match(/-id-(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxIdNumber) {
              maxIdNumber = num;
            }
          }
          continue;
        }

        let newId = null;

        // Паттерн 1: "AST01-10" (филиал-число)
        const match1 = oldId.match(/^([A-Z]{3}\d{2})-(\d+)$/);
        if (match1) {
          const filialId = match1[1];
          const numStr = match1[2];
          const num = parseInt(numStr, 10);
          
          newId = `${filialId}-id-${num}`;
          
          // Отслеживаем максимум
          if (num > maxIdNumber) {
            maxIdNumber = num;
          }
        } else if (oldId === 'ADMIN-01') {
          // Админ остается как есть (не мигрируется)
          console.log(`[SKIP] ${oldId} — это админ, оставляем как есть`);
          continue;
        } else {
          // Если не удалось распознать формат
          console.log(`[ERROR] Не могу распознать формат: ${oldId}`);
          continue;
        }

        // Обновляем пользователя
        user.personalId = newId;
        await user.save({ session });
        migratedCount++;
        console.log(`[MIGRATE] ${oldId} → ${newId}`);
      }

      console.log(`\n✓ Мигрировано пользователей: ${migratedCount}`);
      console.log(`✓ Максимальный ID номер: ${maxIdNumber}`);

      // Шаг 3: Инициализировать или обновить GlobalIdCounter
      let globalCounter = await GlobalIdCounter.findOne().session(session);
      
      if (!globalCounter) {
        // Следующий ID должен быть maxIdNumber + 1
        globalCounter = new GlobalIdCounter({
          nextId: maxIdNumber + 1,
          reservedIds: []
        });
        console.log(`\n[CREATE] GlobalIdCounter с nextId=${maxIdNumber + 1}`);
      } else {
        // Если счетчик уже существует, обновляем nextId если нужно
        if (globalCounter.nextId <= maxIdNumber) {
          globalCounter.nextId = maxIdNumber + 1;
          console.log(`\n[UPDATE] GlobalIdCounter.nextId обновлен на ${maxIdNumber + 1}`);
        }
      }

      await globalCounter.save({ session });

      // Коммитим транзакцию
      await session.commitTransaction();
      console.log('\n✓ Миграция успешно завершена!');

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('\n✗ Ошибка при миграции:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Отключено от БД');
  }
}

migrate();
