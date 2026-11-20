const fs = require('fs');
const path = require('path');

// Carpeta donde se copian las fotos de los productos.
const PRODUCT_IMAGE_DIR = path.join(__dirname, '..', 'public', 'img', 'productos');
const PUBLIC_PREFIX = '/img/productos/';
const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Evita rutas raras en el nombre de archivo (solo el nombre, sin carpetas).
function safeName(name) {
  return path.basename(String(name || '').trim());
}

/**
 * Devuelve la URL pública de la foto local del producto, o null si el archivo
 * no está. Si el nombre trae una extensión que no coincide, prueba las otras
 * (agenda.jpg encuentra agenda.webp). Se consulta en cada render, así que una
 * foto nueva aparece apenas se copia a la carpeta.
 */
function localImageUrl(image) {
  const name = safeName(image);
  if (!name) return null;
  const base = name.replace(/\.(jpe?g|png|webp)$/i, '');
  const candidates = [name, ...EXTENSIONS.map((ext) => base + ext)];
  for (const file of candidates) {
    if (fs.existsSync(path.join(PRODUCT_IMAGE_DIR, file))) return PUBLIC_PREFIX + encodeURIComponent(file);
  }
  return null;
}

/**
 * Imagen a mostrar: primero la foto local, después una URL externa válida.
 * Devuelve null cuando no hay foto (la vista usa el color de la categoría).
 */
function productImageUrl(product) {
  if (!product) return null;
  const local = localImageUrl(product.image);
  if (local) return local;
  const url = product.imageUrl || '';
  if (url && !/placehold\.co/.test(url)) return url;
  return null;
}

module.exports = { PRODUCT_IMAGE_DIR, localImageUrl, productImageUrl };
