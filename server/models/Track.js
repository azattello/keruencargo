const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trackSchema = new Schema({
  track: { type: String, required: true },          // оригинальный трек номер
  trackNormalized: { type: String, required: true, index: true }, // для поиска
  status: { type: Schema.Types.ObjectId, ref: 'Status', required: true },
  filial: { type: mongoose.Types.ObjectId, ref: 'Filial' },
  user: { type: Schema.Types.ObjectId, ref: 'User' }, // ссылка на пользователя
  history: {
    type: [{
      _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
      status: { type: Schema.Types.ObjectId, ref: 'Status' },
      date: { type: Date, default: Date.now }
    }],
    default: []
  },
  notifiedHistoryIds: { type: [Schema.Types.ObjectId], default: [] }, // для отслеживания уведомленных статусов
  price: { type: Number, default: 0 },   // если нужно для фронта
  weight: { type: Number, default: 0 },
  createdBy: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    name: { type: String, required: false },
    phone: { type: Number, required: false },
    role: { type: String, required: false }
  },
  updatedBy: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    name: { type: String, required: false },
    phone: { type: Number, required: false },
    role: { type: String, required: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook для автоматической нормализации трека
trackSchema.pre('save', function(next) {
  if (this.track) {
    this.trackNormalized = this.track.replace(/\s+/g, '').toUpperCase();
  }
  this.updatedAt = new Date();
  next();
});

// Индексы для оптимизации поиска и фильтрации
trackSchema.index({ trackNormalized: 1 }, { unique: true, sparse: true });
trackSchema.index({ status: 1 });
trackSchema.index({ user: 1 });
trackSchema.index({ filial: 1 });
trackSchema.index({ 'history.status': 1 });
trackSchema.index({ createdAt: -1 });
trackSchema.index({ updatedAt: -1 });
trackSchema.index({ 'createdBy.phone': 1 });
trackSchema.index({ 'updatedBy.phone': 1 });

const Track = mongoose.model('Track', trackSchema);

module.exports = Track;
