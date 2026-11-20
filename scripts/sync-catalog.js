/* eslint-disable no-console */
// Pasa src/data/products.js a la base: actualiza cada producto por su nombre
// (precio, descripción, categoría, fotos, plazo, combinaciones y campos de
// personalización) y crea los que no existan. No borra usuarios, pedidos ni
// productos. Los pedidos ya hechos conservan el precio con el que se pidieron.
//   npm run catalogo      (también: npm run imagenes)
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('../src/db');
const Product = require('../src/models/Product');
const catalog = require('../src/data/products');
const { localImageUrl, PRODUCT_IMAGE_DIR } = require('../src/services/imageService');

const FIELDS = ['description', 'basePrice', 'category', 'image', 'gallery', 'productionDays', 'pairsWith', 'options'];

async function main() {
  await connectDB();
  let updated = 0;
  let created = 0;
  const missingFiles = [];
  const names = new Set(catalog.map((p) => p.name));
  const badPairs = [];

  for (const item of catalog) {
    const set = {};
    FIELDS.forEach((f) => { if (item[f] !== undefined) set[f] = item[f]; });
    const res = await Product.updateOne(
      { name: item.name },
      { $set: set, $setOnInsert: { name: item.name, published: true } },
      { upsert: true, runValidators: true }
    );
    if (res.upsertedCount) created += 1;
    else updated += 1;

    [item.image, ...(item.gallery || [])].filter(Boolean).forEach((file) => {
      if (!localImageUrl(file)) missingFiles.push(file);
    });
    (item.pairsWith || []).forEach((n) => { if (!names.has(n)) badPairs.push(`${item.name} → "${n}"`); });
  }

  console.log(`Productos actualizados: ${updated}. Productos nuevos: ${created}.`);
  if (badPairs.length) {
    console.log('\nEstos "Combiná con" no coinciden con ningún producto (revisá el nombre exacto):');
    badPairs.forEach((b) => console.log(`  - ${b}`));
  }
  if (missingFiles.length) {
    console.log(`\nFaltan ${missingFiles.length} fotos en ${PRODUCT_IMAGE_DIR}:`);
    missingFiles.forEach((f) => console.log(`  - ${f}`));
    console.log('Mientras falten, esos productos se ven con el color de su categoría.');
  } else {
    console.log('Todas las fotos están en la carpeta.');
  }
}

main()
  .catch((err) => {
    console.error('Error:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
