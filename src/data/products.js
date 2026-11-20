// Catálogo de productos de Luma.
//
// IMÁGENES: cada producto tiene la propiedad `image` con el nombre del archivo
// que tiene que estar en  src/public/img/productos/
//
//   1. Copiá la foto a esa carpeta con el nombre que figura abajo
//      (o cambiá el nombre acá para que coincida con tu archivo).
//   2. Sirven .jpg, .jpeg, .png y .webp. Si el archivo se llama igual pero
//      con otra extensión, la app lo encuentra igual.
//   3. Si es la primera vez o cambiaste algún nombre acá, corré:
//        npm run imagenes
//      (actualiza los productos en la base sin borrar usuarios ni pedidos).
//
// Mientras falte la foto, el producto se muestra con el color de su categoría.
// Recomendado: fotos de 1200 × 900 px (proporción 4:3) y menos de 400 KB.

module.exports = [
  { name: 'Agenda personalizada A5', category: 'Agendas', basePrice: 12000, image: 'agenda-personalizada-a5.jpg', description: 'Agenda anual con tapa dura y nombre en la portada.' },
  { name: 'Agenda semanal A6', category: 'Agendas', basePrice: 8500, image: 'agenda-semanal-a6.jpg', description: 'Agenda de bolsillo, vista semanal, tapa a elección.' },
  { name: 'Planner mensual', category: 'Agendas', basePrice: 9500, image: 'planner-mensual.jpg', description: 'Planner anillado con vista mensual y hojas de notas.' },
  { name: 'Cuaderno anillado A4', category: 'Cuadernos', basePrice: 7000, image: 'cuaderno-anillado-a4.jpg', description: 'Cuaderno de 100 hojas con tapa personalizada.' },
  { name: 'Cuaderno A5 tapa dura', category: 'Cuadernos', basePrice: 6500, image: 'cuaderno-a5-tapa-dura.jpg', description: 'Cuaderno cosido, hojas rayadas o lisas.' },
  { name: 'Libreta de bolsillo', category: 'Cuadernos', basePrice: 3000, image: 'libreta-de-bolsillo.jpg', description: 'Libreta A7 con iniciales grabadas.' },
  { name: 'Stickers personalizados x20', category: 'Stickers', basePrice: 2500, image: 'stickers-personalizados-x20.jpg', description: 'Plancha de 20 stickers con tu diseño.' },
  { name: 'Etiquetas escolares x50', category: 'Stickers', basePrice: 3500, image: 'etiquetas-escolares-x50.jpg', description: 'Etiquetas con nombre para útiles escolares.' },
  { name: 'Tarjetas de invitación x10', category: 'Tarjetería', basePrice: 5000, image: 'tarjetas-de-invitacion-x10.jpg', description: 'Invitaciones impresas para cumpleaños o eventos.' },
  { name: 'Tarjetas personales x100', category: 'Tarjetería', basePrice: 9000, image: 'tarjetas-personales-x100.jpg', description: 'Tarjetas de presentación en papel ilustración.' },
  { name: 'Señaladores x10', category: 'Tarjetería', basePrice: 2000, image: 'senaladores-x10.jpg', description: 'Señaladores con frase o nombre.' },
  { name: 'Calendario de escritorio', category: 'Calendarios', basePrice: 6000, image: 'calendario-de-escritorio.jpg', description: 'Calendario anual con fotos propias.' },
  { name: 'Calendario de pared A3', category: 'Calendarios', basePrice: 8000, image: 'calendario-de-pared-a3.jpg', description: 'Calendario mensual de pared con fotos.' },
  { name: 'Bolsitas de regalo x10', category: 'Packaging', basePrice: 4500, image: 'bolsitas-de-regalo-x10.jpg', description: 'Bolsitas de papel con logo o nombre.' },
  { name: 'Cajita para souvenir x10', category: 'Packaging', basePrice: 5500, image: 'cajita-para-souvenir-x10.jpg', description: 'Cajitas armables personalizadas.' },
];
