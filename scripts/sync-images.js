/* eslint-disable no-console */
// Copia la propiedad `image` de src/data/products.js a los productos de la
// base (los busca por nombre). No borra usuarios, pedidos ni nada más.
//   npm run imagenes
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('../src/db');
const Product = require('../src/models/Product');
const catalog = require('../src/data/products');
const { localImageUrl, PRODUCT_IMAGE_DIR } = require('../src/services/imageService');

async function main() {
  await connectDB();
  let updated = 0;
  const missingFiles = [];
  const notInDb = [];

  for (const item of catalog) {
    const res = await Product.updateOne({ name: item.name }, { $set: { image: item.image || '' } });
    if (res.matchedCount === 0) notInDb.push(item.name);
    else updated += 1;
    if (item.image && !localImageUrl(item.image)) missingFiles.push(item.image);
  }

  console.log(`Productos actualizados: ${updated} de ${catalog.length}.`);
  if (notInDb.length) console.log(`No están en la base (corré "npm run seed" si es una base nueva): ${notInDb.join(', ')}`);
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
