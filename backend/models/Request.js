const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  status: { type: String, enum: ['pending', 'approved', 'collected', 'denied', 'returned'], default: 'pending' },
  requestDate: { type: Date, default: Date.now },
  issueDate: { type: Date },
  dueDate: { type: Date },
  returnDate: { type: Date },
  penalty: { type: Number, default: 0 },
  penaltyPaid: { type: Boolean, default: false },
  receipt: { type: String }, // URL or path to return receipt
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
