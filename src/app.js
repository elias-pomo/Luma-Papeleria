require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectDB = require('./db');
const { loadUser } = require('./middleware/auth');
const { loadCartCount } = require('./services/cartService');
const { loadNotifications } = require('./routes/notifications');

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el .env');
  process.exit(1);
}

const app = express();

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
// Sesión solo para el carrito (la autenticación va por JWT). Se guarda en
// memoria: alcanza para el proyecto, pero el carrito se pierde al reiniciar.
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' },
  })
);
app.use(loadUser);
app.use(loadCartCount);
app.use(loadNotifications);
app.use((req, res, next) => {
  res.locals.currentPath = req.method === 'GET' ? req.originalUrl : '/'; // para volver después de un POST
  res.locals.navPath = req.originalUrl; // para marcar la sección activa del menú
  next();
});

// Helper para las vistas: 12000 -> "$ 12.000"
const priceFormat = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
app.locals.formatPrice = (n) => priceFormat.format(n);
const dateFormat = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });
app.locals.formatDate = (d) => dateFormat.format(new Date(d));
app.locals.businessName = process.env.BUSINESS_NAME || 'Luma papelería personalizada';
// Cada categoría tiene su color de vinilo; las nuevas toman uno fijo según su nombre.
const TONES = { Agendas: 'cobalt', Cuadernos: 'pink', Stickers: 'lemon', 'Tarjetería': 'mint', Calendarios: 'orange', Packaging: 'kraft' };
const TONE_LIST = ['cobalt', 'pink', 'lemon', 'mint', 'orange', 'kraft'];
app.locals.categoryTone = (cat = '') =>
  `tone-${TONES[cat] || TONE_LIST[[...cat].reduce((h, c) => h + c.charCodeAt(0), 0) % TONE_LIST.length]}`;
// Forma de troquel según la categoría (proporción de la foto y del sticker).
const SHAPES = { Agendas: 'shape-portrait', Cuadernos: 'shape-portrait', 'Tarjetería': 'shape-card', Stickers: 'shape-round', Packaging: 'shape-square' };
app.locals.categoryShape = (cat = '') => SHAPES[cat] || 'shape-landscape';
// Foto del producto (archivo en public/img/productos o URL externa); null = sin foto.
const { productImageUrl } = require('./services/imageService');
app.locals.productImage = productImageUrl;
// "En revisión" -> "en-revision" (para la clase CSS del estado)
app.locals.statusClass = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '-');

app.use('/', require('./routes/auth'));
app.use('/', require('./routes/products'));
app.use('/carrito', require('./routes/cart'));
app.use('/mis-pedidos', require('./routes/orders'));
app.use('/notificaciones', require('./routes/notifications'));
app.use('/admin', require('./routes/admin'));

app.use((req, res) => {
  res.status(404).render('error', { title: 'No encontrado', message: 'La página que buscás no existe.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Error', message: 'Ocurrió un error inesperado.' });
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('No se pudo conectar a MongoDB:', err.message);
    process.exit(1);
  });
