const mongoose = require('mongoose');

const FilialSchema = new mongoose.Schema({
  filialText: { type: String, required: true },
  filialName: { type: String, default: '' }, // Новое поле - отображаемое имя филиала
  userPhone: { type: Number, required: true },
  filialId: { type: String, required: true },
  filialAddress : { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Ссылка на пользователя
  createdAt: { type: Date, default: Date.now },
  userCount: { type: Number, default: 0 }, // Новое поле
  // Контактная информация филиала
  contacts: {
    phone: { type: String, default: '' },
    whatsappPhone: { type: String, default: '' },
    whatsappLink: { type: String, default: '' },
    instagram: { type: String, default: '' },
    telegramId: { type: String, default: '' },
    telegramLink: { type: String, default: '' }
  },
  // Дополнительная информация филиала
  additionalInfo: {
    videoLink: { type: String, default: '' },
    chinaAddress: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    aboutUsText: { type: String, default: '' },
    prohibitedItemsText: { type: String, default: '' },
    contractFilePath: { type: String, default: '' }
  },
  // Резервные личные коды (personalId) для последующего распределения
  reservedPersonalIds: {
    type: [String],
    default: []
  }
});

const Filial = mongoose.model('Filial', FilialSchema);

module.exports = Filial;
