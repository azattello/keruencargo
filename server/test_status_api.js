const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');

(async () => {
  try {
    await mongoose.connect(config.get('dbUrl'));
    const User = require('./models/User');
    const Status = require('./models/Status');
    
    // Найдём филиала
    const user = await User.findOne({ phone: 87714574157, role: 'filial' }).lean();
    if (!user) {
      console.log('❌ Пользователь не найден');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ Филиал найден:', user.name, '(' + user.phone + ')');
    console.log('   selectedFilial:', user.selectedFilial);
    
    // Сгенерируем токен
    const token = jwt.sign({ 
      id: user._id.toString(), 
      role: user.role, 
      selectedFilial: user.selectedFilial 
    }, config.get('secretKey'));
    
    console.log('✅ Токен сгенерирован');
    
    // Проверим, существует ли статус
    const expectedStatusText = 'Прибыло в филиал ' + user.selectedFilial;
    const existingStatus = await Status.findOne({ statusText: expectedStatusText }).lean();
    
    console.log('\nСтатус "' + expectedStatusText + '":');
    if (existingStatus) {
      console.log('  ✅ Существует в БД (ID:', existingStatus._id + ')');
    } else {
      console.log('  ❌ НЕ существует в БД (будет создан при первом запросе)');
    }
    
    // Получим все статусы
    console.log('\nВсе статусы в БД:');
    const allStatuses = await Status.find().select('statusText').sort({ createdAt: 1 }).lean();
    allStatuses.forEach(s => {
      console.log('  -', s.statusText);
    });
    
    console.log('\n\n📝 Тестовый токен для API:');
    console.log('Authorization: Bearer ' + token);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Ошибка:', err.message);
  }
})();
