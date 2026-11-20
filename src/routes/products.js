const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { DETAIL_FIELDS, productPageLocals } = require('../services/productPageService');

const router = express.Router();

// Campos que se muestran al público. No hay stock en el modelo, y por las
// dudas tampoco se expone nada que no esté en esta lista.
const PUBLIC_FIELDS = 'name description basePrice image imageUrl category';

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------- Catálogo con buscador (CU01) ----------

router.get('/', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const categoria = typeof req.query.categoria === 'string' ? req.query.categoria.trim() : '';

  const filter = { published: true };
  if (q) filter.name = { $regex: escapeRegex(q), $options: 'i' };
  if (categoria) filter.category = categoria;

  const [products, categories] = await Promise.all([
    Product.find(filter).select(PUBLIC_FIELDS).sort({ category: 1, name: 1 }).lean(),
    Product.distinct('category', { published: true }),
  ]);

  res.render('catalogo', {
    title: 'Catálogo',
    products,
    categories: categories.sort((a, b) => a.localeCompare(b, 'es')),
    q,
    categoria,
  });
});

// ---------- Ficha de producto ----------

router.get('/productos/:id', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next(); // cae en el 404

  const product = await Product.findOne({ _id: req.params.id, published: true })
    .select(DETAIL_FIELDS)
    .lean();
  if (!product) return next();

  const extra = await productPageLocals(product, req.query);
  res.render('producto', { title: product.name, product, ...extra, errors: [], values: {} });
});

module.exports = router;
