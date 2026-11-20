const Product = require('../models/Product');
const { localImageUrl, productImageUrl } = require('./imageService');
const { findRate, isValidPostalCode } = require('./shippingService');

// Campos públicos de la ficha (sin stock: no existe en el modelo).
const DETAIL_FIELDS = 'name description basePrice image gallery imageUrl category productionDays pairsWith options';
// Campos para las tarjetas de producto (catálogo y "Combiná con").
const CARD_FIELDS = 'name basePrice image imageUrl category';
const RELATED_LIMIT = 4;

// Fotos de la galería que existen en la carpeta, empezando por la principal.
function galleryPhotos(product) {
  const local = [product.image, ...(product.gallery || [])].map(localImageUrl).filter(Boolean);
  const unique = [...new Set(local)];
  if (unique.length) return unique;
  const main = productImageUrl(product);
  return main ? [main] : [];
}

// "Combiná con": primero los elegidos en products.js, después se completa con la misma categoría.
async function relatedProducts(product) {
  const picked = product.pairsWith && product.pairsWith.length
    ? await Product.find({ name: { $in: product.pairsWith }, published: true, _id: { $ne: product._id } }).select(CARD_FIELDS).lean()
    : [];
  const ordered = product.pairsWith ? product.pairsWith.map((n) => picked.find((p) => p.name === n)).filter(Boolean) : [];
  if (ordered.length < RELATED_LIMIT) {
    const exclude = [product._id, ...ordered.map((p) => p._id)];
    const more = await Product.find({ category: product.category, published: true, _id: { $nin: exclude } })
      .select(CARD_FIELDS).limit(RELATED_LIMIT - ordered.length).lean();
    ordered.push(...more);
  }
  return ordered.slice(0, RELATED_LIMIT);
}

// Cotización de envío desde la ficha (?cp=1425). Mismo cálculo que el checkout.
async function shippingQuote(cp) {
  if (typeof cp !== 'string' || !cp.trim()) return null;
  const postalCode = cp.trim();
  if (!isValidPostalCode(postalCode)) return { postalCode, invalid: true };
  const rate = await findRate(postalCode);
  return rate ? { postalCode, cost: rate.cost } : { postalCode, noCoverage: true };
}

/** Datos extra que necesita la vista de la ficha. */
async function productPageLocals(product, query = {}) {
  const photos = galleryPhotos(product);
  const requested = Number.parseInt(query.foto, 10);
  const activePhoto = Number.isInteger(requested) && requested >= 1 && requested <= photos.length ? requested - 1 : 0;
  const [related, quote] = await Promise.all([relatedProducts(product), shippingQuote(query.cp)]);
  return { photos, activePhoto, related, quote };
}

module.exports = { DETAIL_FIELDS, CARD_FIELDS, productPageLocals };
