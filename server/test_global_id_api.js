/**
 * Тестовый скрипт для проверки API эндпоинтов глобального счётчика ID.
 * Использование: node test_global_id_api.js <token>
 * 
 * token - JWT токен админа (можно достать из локального хранилища клиента при входе)
 */

const args = process.argv.slice(2);
const token = args[0];

if (!token) {
  console.log('Использование: node test_global_id_api.js <token>');
  console.log('Где token - JWT токен админа');
  process.exit(1);
}

async function testApi() {
  try {
    // Тест 1: Просмотр статуса счётчика
    console.log('\n=== Тест 1: GET /api/auth/global-id-counter ===');
    let res = await fetch('http://localhost:3001/api/auth/global-id-counter', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    let data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(JSON.stringify(data, null, 2));

    // Тест 2: Добавить номер в резерв
    console.log('\n=== Тест 2: POST /api/auth/global-id-counter/reserve ===');
    res = await fetch('http://localhost:3001/api/auth/global-id-counter/reserve', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ number: 15 })
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(JSON.stringify(data, null, 2));

    // Тест 3: Проверить обновленный статус
    console.log('\n=== Тест 3: GET /api/auth/global-id-counter (обновленный) ===');
    res = await fetch('http://localhost:3001/api/auth/global-id-counter', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    console.error('Ошибка:', err);
  }
}

testApi();
