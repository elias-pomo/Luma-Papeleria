const mongoose = require('mongoose');

// Sin campo stock: el catálogo nunca lo expone.
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    basePrice: { type: Number, required: true, min: 0 },
    // Nombre del archivo en src/public/img/productos/ (ver src/data/products.js)
    image: { type: String, default: '', trim: true },
    // Alternativa: una URL externa completa
    imageUrl: { type: String, default: '' },
    category: { type: String, required: true, trim: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
