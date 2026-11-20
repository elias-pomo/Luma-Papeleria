const ShippingRate = require('../models/ShippingRate');

const CP_RE = /^\d{4}$/;

function isValidPostalCode(postalCode) {
  return CP_RE.test(postalCode);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Busca la tarifa vigente para un código postal (CU04).
 * Vigente = el CP está en el rango [cpFrom, cpTo] y validUntil es hoy o
 * después (la tarifa vale todo el día de vencimiento).
 * Si hay varias que se superponen, gana la cargada más recientemente.
 * Devuelve la tarifa o null si no hay cobertura.
 */
async function findRate(postalCode) {
  if (!isValidPostalCode(postalCode)) return null;
  const cp = Number(postalCode);
  return ShippingRate.findOne({
    cpFrom: { $lte: cp },
    cpTo: { $gte: cp },
    validUntil: { $gte: startOfToday() },
  })
    .sort({ createdAt: -1 })
    .lean();
}

module.exports = { findRate, isValidPostalCode };
