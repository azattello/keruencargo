const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const GlobalIdCounterSchema = new Schema({
  // Текущий счетчик (начиная с 10)
  nextId: {
    type: Number,
    default: 10,
    required: true
  },

  // Резервированные ID (глобальные) - когда пользователи удаляются, их номера сюда
  reservedIds: {
    type: [Number],
    default: [],
    required: false
  },

  // Коды 1-9 зарезервированы по умолчанию
  // reservedIds может содержать любые освобожденные коды

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = model('GlobalIdCounter', GlobalIdCounterSchema);
