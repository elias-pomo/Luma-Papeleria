const mongoose = require('mongoose');

// Tarifa por rango de código postal (cpFrom..cpTo inclusive).
const shippingRateSchema = new mongoose.Schema(
  {
    cpFrom: { type: Number, required: true, min: 0 },
    cpTo: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    validUntil: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShippingRate', shippingRateSchema);
