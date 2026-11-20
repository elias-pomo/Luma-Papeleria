const mongoose = require('mongoose');

// Campo de personalización que el cliente completa al pedir.
const optionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },          // identificador interno (ej. "nombre")
    label: { type: String, required: true },        // lo que ve el cliente
    type: { type: String, enum: ['text', 'select', 'color', 'date', 'url'], default: 'text' },
    required: { type: Boolean, default: false },
    maxLength: { type: Number, default: 60 },
    choices: { type: [String], default: [] },       // para select y color
    placeholder: { type: String, default: '' },
    hint: { type: String, default: '' },
  },
  { _id: false }
);

// Sin campo stock: el catálogo nunca lo expone.
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    basePrice: { type: Number, required: true, min: 0 },
    // Nombre del archivo en src/public/img/productos/ (ver src/data/products.js)
    image: { type: String, default: '', trim: true },
    // Fotos extra para la galería de la ficha (mismos archivos de la carpeta)
    gallery: { type: [String], default: [] },
    // Alternativa: una URL externa completa
    imageUrl: { type: String, default: '' },
    category: { type: String, required: true, trim: true },
    // Plazo de producción que se muestra en la ficha (ej. "5 a 7 días hábiles")
    productionDays: { type: String, default: '' },
    // Nombres de otros productos para "Combiná con"
    pairsWith: { type: [String], default: [] },
    // Campos de personalización guiada. Vacío = un solo cuadro de texto libre.
    options: { type: [optionSchema], default: [] },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
