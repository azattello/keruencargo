/**
 * Скрипт для тестирования регистрации нового пользователя через API.
 * Запускается как: node test_register.js
 */

async function run() {
  const url = 'http://localhost:3001/api/auth/registration';
  const body = {
    phone: '87000000003',
    password: 'test123',
    name: 'Test',
    surname: 'User',
    selectedFilial: 'Филиал на Айнакол',
    isChecked: 'true'
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log('status', res.status);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Ошибка запроса', err);
  }
}

run();
