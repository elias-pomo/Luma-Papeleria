const mongoose = require('mongoose');

// Los 9 estados del documento + las salidas. Las transiciones válidas
// viven en services/orderService.js.
const STATUSES = [
  'Solicitado',
  'En revisión',
  'Confirmado',
  'Pendiente de pago',
  'En preparación',
  'Listo para entrega',
  'Enviado',
  'Entregado',
  'Rechazado',
  'Cancelado',
];

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    customization: { type: String, default: '' },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    date: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    deliveryMode: { type: String, enum: ['domicilio', 'retiro'], required: true },
    address: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    shippingCost: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: STATUSES, default: 'Solicitado' },
    rejectReason: { type: String, default: '' },
    history: { type: [historySchema], default: [] },
  },
  { timestamps: true }
);

orderSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Order', orderSchema);
module.exports.STATUSES = STATUSES;
