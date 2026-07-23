const mongoose = require('mongoose');
const config = require('config');
const User = require('./models/User');
const Filial = require('./models/Filial');

async function createTestClient() {
  await mongoose.connect(config.get('dbUrl'));
  console.log('Connected to MongoDB');

  // Создаем тестового клиента
  const testClient = {
    phone: 88000000004,
    password: 'test123',
    name: 'TEST-01',
    surname: 'Клиент',
    role: 'client',
    selectedFilial: 'filial-1',
    personalId: 'T001-01'
  };

  let user = await User.findOne({ phone: testClient.phone });
  if (!user) {
    user = new User(testClient);
    await user.save();
    console.log(`Created test client: ${testClient.name} (${testClient.phone})`);
  } else {
    console.log(`Test client already exists: ${testClient.name}`);
  }

  await mongoose.disconnect();
  console.log('Done');
}

createTestClient().catch(console.error);