const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sendingSchema = new Schema({
  track: { type: String, required: true, trim: true },
  trackNormalized: { type: String, required: true, index: true },
  filial: { type: Schema.Types.ObjectId, ref: 'Filial', required: true },
  date: { type: Date, required: true, default: Date.now },
  source: { type: String, enum: ['scan', 'bulk'], default: 'scan' },
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

sendingSchema.pre('save', function(next) {
  if (this.track) {
    this.trackNormalized = String(this.track).replace(/\s+/g, '').toUpperCase();
  }
  this.updatedAt = new Date();
  next();
});

const Sending = mongoose.model('Sending', sendingSchema);

module.exports = Sending;
