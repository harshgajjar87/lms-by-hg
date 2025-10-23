const mongoose = require('mongoose');

const penaltySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  date: { type: Date, default: Date.now },
  paid: { type: Boolean, default: false },
  paidDate: { type: Date },
  receipt: { type: String }, // URL or path to receipt
}, { timestamps: true });

module.exports = mongoose.model('Penalty', penaltySchema);
