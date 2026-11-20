require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const User = require('./models/User');
const Product = require('./models/Product');
const ShippingRate = require('./models/ShippingRate');
const Order = require('./models/Order');
const Notification = require('./models/Notification');

// Los productos (con su propiedad `image`) están en src/data/products.js
const products = require('./data/products').map((p) => ({ ...p, imageUrl: '', published: true }));

function inDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

const shippingRates = [
  { cpFrom: 1000, cpTo: 1499, cost: 2500, validUntil: inDays(365) }, // CABA
  { cpFrom: 1600, cpTo: 1899, cost: 3500, validUntil: inDays(365) }, // GBA
  { cpFrom: 1900, cpTo: 1999, cost: 4000, validUntil: inDays(365) }, // La Plata
  { cpFrom: 2000, cpTo: 2199, cost: 6000, validUntil: inDays(365) }, // Rosario
  { cpFrom: 5000, cpTo: 5099, cost: 7000, validUntil: inDays(365) }, // Córdoba
  { cpFrom: 7600, cpTo: 7699, cost: 6500, validUntil: inDays(-30) }, // Mar del Plata (vencida, para probar)
];

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    ShippingRate.deleteMany({}),
    Order.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@papeleria.test';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin1234';
  await User.create({
    name: 'Administrador',
    email,
    phone: '',
    passwordHash: await bcrypt.hash(password, 10),
    role: 'admin',
  });

  await Product.insertMany(products);
  await ShippingRate.insertMany(shippingRates);

  console.log(`Seed listo: admin ${email}, ${products.length} productos, ${shippingRates.length} tarifas.`);
}

seed()
  .catch((err) => {
    console.error('Error en el seed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
