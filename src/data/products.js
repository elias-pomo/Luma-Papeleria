// Catálogo de productos de Luma.
//
// Después de cambiar algo acá, corré:   npm run catalogo
// (actualiza los productos en la base sin borrar usuarios ni pedidos).
//
// PROPIEDADES DE CADA PRODUCTO
//
// image          Foto principal: nombre del archivo en src/public/img/productos/
//                Sirven .jpg, .jpeg, .png y .webp (si la extensión no coincide,
//                la app encuentra el archivo igual). Sin foto, se ve el color
//                de la categoría. Recomendado: 1200 × 900 px o más.
// gallery        Fotos extra para la galería de la ficha (misma carpeta).
//                Ej.: ['agenda-personalizada-a5-2.jpg', 'agenda-personalizada-a5-3.jpg']
// productionDays Plazo de producción que se muestra en la ficha.
//                ⚠ VALORES DE EJEMPLO: reemplazalos por los plazos reales.
// pairsWith      Nombres exactos de otros productos para "Combiná con".
// options        Campos que completa el cliente al pedir. Tipos:
//                  text   texto corto (maxLength = largo máximo)
//                  select una opción de la lista `choices`
//                  color  una opción de `choices`, mostrada como muestras de color
//                  date   una fecha
//                  url    un link (para logos o fotos: no se suben archivos)
//                `required: true` lo hace obligatorio. Además de estos campos,
//                siempre hay un cuadro opcional de "Algo más que tengamos que saber".
//                ⚠ CAMPOS DE EJEMPLO: ajustalos a lo que ofrece cada producto.

const COLORES_TAPA = ['Verde', 'Rosa', 'Azul', 'Negro', 'Lila', 'Amarillo'];
const COLORES_DETALLE = ['Dorado', 'Plateado', 'Rosa', 'Azul', 'Verde', 'Negro'];
const HOJAS = ['Rayadas', 'Cuadriculadas', 'Lisas', 'Punteadas'];

const nombreTapa = (label = 'Nombre en la tapa') => ({
  key: 'nombre', label, type: 'text', required: true, maxLength: 30, placeholder: 'Ej.: Sofía González',
});
const colorTapa = { key: 'color', label: 'Color de tapa', type: 'color', required: true, choices: COLORES_TAPA };
const linkLogo = {
  key: 'logo', label: 'Link a tu logo o diseño', type: 'url', maxLength: 200,
  placeholder: 'https://drive.google.com/…', hint: 'Subilo a Drive, Dropbox o similar y pegá el link compartido.',
};

module.exports = [
  {
    name: 'Agenda personalizada A5', category: 'Agendas', basePrice: 12000,
    image: 'agenda-personalizada-a5.jpg', gallery: [],
    description: 'Agenda anual con tapa dura y nombre en la portada.',
    productionDays: '7 a 10 días hábiles',
    pairsWith: ['Señaladores x10', 'Etiquetas escolares x50', 'Libreta de bolsillo'],
    options: [
      nombreTapa(),
      colorTapa,
      { key: 'interior', label: 'Interior', type: 'select', required: true, choices: ['Semana a la vista', 'Día por página'] },
      { key: 'letras', label: 'Color de las letras', type: 'color', choices: COLORES_DETALLE },
    ],
  },
  {
    name: 'Agenda semanal A6', category: 'Agendas', basePrice: 8500,
    image: 'agenda-semanal-a6.jpg', gallery: [],
    description: 'Agenda de bolsillo, vista semanal, tapa a elección.',
    productionDays: '7 a 10 días hábiles',
    pairsWith: ['Señaladores x10', 'Libreta de bolsillo', 'Stickers personalizados x20'],
    options: [nombreTapa(), colorTapa],
  },
  {
    name: 'Planner mensual', category: 'Agendas', basePrice: 9500,
    image: 'planner-mensual.jpg', gallery: [],
    description: 'Planner anillado con vista mensual y hojas de notas.',
    productionDays: '7 a 10 días hábiles',
    pairsWith: ['Calendario de escritorio', 'Señaladores x10', 'Stickers personalizados x20'],
    options: [
      nombreTapa(),
      colorTapa,
      { key: 'inicio', label: 'Mes de inicio', type: 'select', required: true,
        choices: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] },
    ],
  },
  {
    name: 'Cuaderno anillado A4', category: 'Cuadernos', basePrice: 7000,
    image: 'cuaderno-anillado-a4.jpg', gallery: [],
    description: 'Cuaderno de 100 hojas con tapa personalizada.',
    productionDays: '5 a 7 días hábiles',
    pairsWith: ['Etiquetas escolares x50', 'Cuaderno A5 tapa dura', 'Señaladores x10'],
    options: [
      nombreTapa('Texto de la tapa'),
      colorTapa,
      { key: 'hojas', label: 'Hojas', type: 'select', required: true, choices: HOJAS },
    ],
  },
  {
    name: 'Cuaderno A5 tapa dura', category: 'Cuadernos', basePrice: 6500,
    image: 'cuaderno-a5-tapa-dura.jpg', gallery: [],
    description: 'Cuaderno cosido, hojas rayadas o lisas.',
    productionDays: '5 a 7 días hábiles',
    pairsWith: ['Libreta de bolsillo', 'Señaladores x10', 'Etiquetas escolares x50'],
    options: [
      nombreTapa('Texto de la tapa'),
      colorTapa,
      { key: 'hojas', label: 'Hojas', type: 'select', required: true, choices: ['Rayadas', 'Lisas'] },
    ],
  },
  {
    name: 'Libreta de bolsillo', category: 'Cuadernos', basePrice: 3000,
    image: 'libreta-de-bolsillo.jpg', gallery: [],
    description: 'Libreta A7 con iniciales grabadas.',
    productionDays: '5 a 7 días hábiles',
    pairsWith: ['Agenda personalizada A5', 'Señaladores x10', 'Bolsitas de regalo x10'],
    options: [
      { key: 'iniciales', label: 'Iniciales', type: 'text', required: true, maxLength: 4, placeholder: 'Ej.: SG' },
      colorTapa,
    ],
  },
  {
    name: 'Stickers personalizados x20', category: 'Stickers', basePrice: 2500,
    image: 'stickers-personalizados-x20.jpg', gallery: [],
    description: 'Plancha de 20 stickers con tu diseño.',
    productionDays: '3 a 5 días hábiles',
    pairsWith: ['Bolsitas de regalo x10', 'Tarjetas personales x100', 'Cajita para souvenir x10'],
    options: [
      { key: 'texto', label: 'Texto o nombre', type: 'text', maxLength: 40, placeholder: 'Ej.: Gracias por tu compra' },
      { key: 'forma', label: 'Forma', type: 'select', required: true, choices: ['Redondos', 'Cuadrados', 'Rectangulares', 'Troquelados a la forma del diseño'] },
      linkLogo,
    ],
  },
  {
    name: 'Etiquetas escolares x50', category: 'Stickers', basePrice: 3500,
    image: 'etiquetas-escolares-x50.jpg', gallery: [],
    description: 'Etiquetas con nombre para útiles escolares.',
    productionDays: '3 a 5 días hábiles',
    pairsWith: ['Cuaderno anillado A4', 'Agenda personalizada A5', 'Señaladores x10'],
    options: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 25, placeholder: 'Ej.: Valentín Pérez' },
      { key: 'grado', label: 'Grado o sala', type: 'text', maxLength: 20, placeholder: 'Ej.: 3.º B' },
      { key: 'color', label: 'Color', type: 'color', required: true, choices: ['Azul', 'Rosa', 'Verde', 'Amarillo', 'Lila', 'Naranja'] },
    ],
  },
  {
    name: 'Tarjetas de invitación x10', category: 'Tarjetería', basePrice: 5000,
    image: 'tarjetas-de-invitacion-x10.jpg', gallery: [],
    description: 'Invitaciones impresas para cumpleaños o eventos.',
    productionDays: '3 a 5 días hábiles',
    pairsWith: ['Bolsitas de regalo x10', 'Cajita para souvenir x10', 'Stickers personalizados x20'],
    options: [
      { key: 'evento', label: 'Evento', type: 'select', required: true, choices: ['Cumpleaños', 'Bautismo', 'Comunión', 'Casamiento', 'Baby shower', 'Otro'] },
      { key: 'agasajado', label: 'Nombre de quien festeja', type: 'text', required: true, maxLength: 40 },
      { key: 'fecha', label: 'Fecha del evento', type: 'date', required: true },
      { key: 'lugar', label: 'Lugar y hora', type: 'text', maxLength: 80, placeholder: 'Ej.: Salón Arcoíris, 17 h' },
      { key: 'color', label: 'Color principal', type: 'color', choices: ['Rosa', 'Azul', 'Verde', 'Amarillo', 'Lila', 'Dorado'] },
    ],
  },
  {
    name: 'Tarjetas personales x100', category: 'Tarjetería', basePrice: 9000,
    image: 'tarjetas-personales-x100.jpg', gallery: [],
    description: 'Tarjetas de presentación en papel ilustración.',
    productionDays: '3 a 5 días hábiles',
    pairsWith: ['Stickers personalizados x20', 'Bolsitas de regalo x10', 'Libreta de bolsillo'],
    options: [
      { key: 'nombre', label: 'Nombre o marca', type: 'text', required: true, maxLength: 40 },
      { key: 'rubro', label: 'Cargo o rubro', type: 'text', maxLength: 40, placeholder: 'Ej.: Pastelería artesanal' },
      { key: 'contacto', label: 'Datos de contacto', type: 'text', required: true, maxLength: 100, placeholder: 'Teléfono, mail o redes' },
      linkLogo,
    ],
  },
  {
    name: 'Señaladores x10', category: 'Tarjetería', basePrice: 2000,
    image: 'senaladores-x10.jpg', gallery: [],
    description: 'Señaladores con frase o nombre.',
    productionDays: '3 a 5 días hábiles',
    pairsWith: ['Agenda personalizada A5', 'Libreta de bolsillo', 'Cuaderno A5 tapa dura'],
    options: [
      { key: 'frase', label: 'Frase o nombre', type: 'text', required: true, maxLength: 60 },
      { key: 'color', label: 'Color', type: 'color', choices: ['Rosa', 'Azul', 'Verde', 'Amarillo', 'Lila', 'Negro'] },
    ],
  },
  {
    name: 'Calendario de escritorio', category: 'Calendarios', basePrice: 6000,
    image: 'calendario-de-escritorio.jpg', gallery: [],
    description: 'Calendario anual con fotos propias.',
    productionDays: '7 a 10 días hábiles',
    pairsWith: ['Planner mensual', 'Calendario de pared A3', 'Señaladores x10'],
    options: [
      { key: 'anio', label: 'Año', type: 'select', required: true, choices: ['2026', '2027'] },
      { key: 'fotos', label: 'Link a tus fotos', type: 'url', required: true, maxLength: 200,
        placeholder: 'https://photos.google.com/…', hint: 'Una carpeta compartida con 12 fotos, una por mes.' },
      { key: 'titulo', label: 'Título de la tapa', type: 'text', maxLength: 40, placeholder: 'Ej.: Familia Gómez 2027' },
    ],
  },
  {
    name: 'Calendario de pared A3', category: 'Calendarios', basePrice: 8000,
    image: 'calendario-de-pared-a3.jpg', gallery: [],
    description: 'Calendario mensual de pared con fotos.',
    productionDays: '7 a 10 días hábiles',
    pairsWith: ['Calendario de escritorio', 'Planner mensual', 'Bolsitas de regalo x10'],
    options: [
      { key: 'anio', label: 'Año', type: 'select', required: true, choices: ['2026', '2027'] },
      { key: 'fotos', label: 'Link a tus fotos', type: 'url', required: true, maxLength: 200,
        placeholder: 'https://photos.google.com/…', hint: 'Una carpeta compartida con 12 fotos, una por mes.' },
      { key: 'titulo', label: 'Título de la tapa', type: 'text', maxLength: 40 },
    ],
  },
  {
    name: 'Bolsitas de regalo x10', category: 'Packaging', basePrice: 4500,
    image: 'bolsitas-de-regalo-x10.jpg', gallery: [],
    description: 'Bolsitas de papel con logo o nombre.',
    productionDays: '5 a 7 días hábiles',
    pairsWith: ['Stickers personalizados x20', 'Tarjetas personales x100', 'Cajita para souvenir x10'],
    options: [
      { key: 'texto', label: 'Texto o nombre', type: 'text', maxLength: 40 },
      { key: 'papel', label: 'Papel', type: 'select', required: true, choices: ['Kraft', 'Blanco'] },
      linkLogo,
    ],
  },
  {
    name: 'Cajita para souvenir x10', category: 'Packaging', basePrice: 5500,
    image: 'cajita-para-souvenir-x10.jpg', gallery: [],
    description: 'Cajitas armables personalizadas.',
    productionDays: '5 a 7 días hábiles',
    pairsWith: ['Tarjetas de invitación x10', 'Stickers personalizados x20', 'Bolsitas de regalo x10'],
    options: [
      { key: 'texto', label: 'Texto de la cajita', type: 'text', required: true, maxLength: 40, placeholder: 'Ej.: Gracias por venir, Mía' },
      { key: 'color', label: 'Color', type: 'color', required: true, choices: ['Rosa', 'Azul', 'Verde', 'Amarillo', 'Lila', 'Blanco'] },
    ],
  },
];
