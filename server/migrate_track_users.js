const mongoose = require('mongoose');
const Track = require('./models/Track');
const User = require('./models/User');

async function migrateTrackUsers() {
  try {
    // Подключаемся к базе данных
    await mongoose.connect('mongodb://localhost:27017/nomadcargo', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Подключено к базе данных');

    // Находим все tracks, где user - строка (телефон)
    const tracks = await Track.find({ user: { $type: 'string' } }).lean();
    console.log(`Найдено ${tracks.length} треков с user как строкой`);

    for (const track of tracks) {
      const phone = String(track.user).replace(/\D/g, ''); // нормализуем телефон
      const user = await User.findOne({ phone }).select('_id').lean();
      if (user) {
        await Track.updateOne({ _id: track._id }, { user: user._id });
        console.log(`Обновлен track ${track.track}: user -> ${user._id}`);
      } else {
        console.log(`Пользователь не найден для телефона ${phone} в track ${track.track}`);
      }
    }

    console.log('Миграция завершена');
  } catch (error) {
    console.error('Ошибка миграции:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateTrackUsers();