const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  link: { type: String, default: '' }, // página a la que lleva (ej. el pedido)
  read: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
