// const axios = require('axios');

// export const sendArchiveRequest = async (userId, filteredBookmarks) => {
//   try {
//     const response = await axios.post(`/api/${userId}/archive`, { filteredBookmarks });
//     return response.data;
//   } catch (error) {
//       // Если есть ошибка валидации, отображаем сообщение об ошибке
//       if (error.response && error.response.status === 400) {
//         const { message, errors } = error.response.data;
//         console.log('Validation errors:', errors);
//         alert(message);
//       } else {
//         // Если произошла другая ошибка, выводим сообщение об ошибке в консоль
//         console.error('Error:', error.message);
//       }
//   }
// };

