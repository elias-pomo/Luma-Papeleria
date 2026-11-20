// Personalización guiada: valida los campos de cada producto y arma el texto
// que se guarda en el carrito y en el pedido (una línea por campo).

const MAX_NOTES = 300;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;

function formatDate(text) {
  const m = DATE_RE.exec(text);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : text;
}

function isRealDate(text) {
  const m = DATE_RE.exec(text);
  if (!m) return false;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]);
}

/**
 * Lee los campos `opt_<key>` y `notes` del formulario.
 * Devuelve { customization, errors, values } donde values sirve para volver a
 * llenar el formulario si hay errores.
 */
function parseGuided(product, body) {
  const errors = [];
  const values = { opts: {}, notes: '' };
  const lines = [];

  for (const opt of product.options) {
    const raw = typeof body[`opt_${opt.key}`] === 'string' ? body[`opt_${opt.key}`].trim() : '';
    values.opts[opt.key] = raw;

    if (!raw) {
      if (opt.required) errors.push(`Completá "${opt.label}".`);
      continue;
    }

    if ((opt.type === 'select' || opt.type === 'color') && !opt.choices.includes(raw)) {
      errors.push(`Elegí una opción válida en "${opt.label}".`);
      continue;
    }
    if (opt.type === 'date' && !isRealDate(raw)) {
      errors.push(`Ingresá una fecha válida en "${opt.label}".`);
      continue;
    }
    if (opt.type === 'url' && !URL_RE.test(raw)) {
      errors.push(`"${opt.label}" tiene que ser un link que empiece con https://`);
      continue;
    }
    if ((opt.type === 'text' || opt.type === 'url') && raw.length > (opt.maxLength || 60)) {
      errors.push(`"${opt.label}" puede tener hasta ${opt.maxLength || 60} caracteres.`);
      continue;
    }

    lines.push(`${opt.label}: ${opt.type === 'date' ? formatDate(raw) : raw}`);
  }

  const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
  values.notes = notes;
  if (notes.length > MAX_NOTES) errors.push(`Las aclaraciones pueden tener hasta ${MAX_NOTES} caracteres.`);
  else if (notes) lines.push(`Aclaraciones: ${notes}`);

  if (!errors.length && !lines.length) errors.push('Completá al menos un dato de la personalización.');

  return { customization: lines.join('\n'), errors, values };
}

module.exports = { parseGuided, MAX_NOTES };
