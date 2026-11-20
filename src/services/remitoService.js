const PDFDocument = require('pdfkit');

const BUSINESS_NAME = process.env.BUSINESS_NAME || 'Luma papelería personalizada';

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Escribe el remito del pedido (CU08) como PDF en un stream (ej. la
 * respuesta HTTP). Se genera al vuelo desde el pedido: no se guarda.
 * order debe venir con client poblado (name, email, phone).
 */
function writeRemito(order, stream) {
  const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: `Remito pedido ${order.number}` } });
  doc.pipe(stream);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const width = right - left;

  // Encabezado
  doc.font('Helvetica-Bold').fontSize(18).text(BUSINESS_NAME, left, 50);
  doc.font('Helvetica').fontSize(9).fillColor('#555').text('Documento no válido como factura', left, 74);
  doc.fillColor('#000').font('Helvetica-Bold').fontSize(16).text('REMITO', left, 50, { width, align: 'right' });
  doc.font('Helvetica').fontSize(10)
    .text(`N° ${String(order.number).padStart(6, '0')}`, left, 72, { width, align: 'right' })
    .text(`Fecha: ${formatDate(new Date())}`, { width, align: 'right' });
  doc.moveTo(left, 105).lineTo(right, 105).stroke('#999');

  // Datos del cliente y la entrega
  let y = 118;
  const client = order.client || {};
  const rows = [
    ['Cliente', client.name || '—'],
    ['Email', client.email || '—'],
    ['Teléfono', client.phone || '—'],
    ['Pedido', `#${order.number} del ${formatDate(order.createdAt)}`],
    ['Entrega', order.deliveryMode === 'retiro' ? 'Retiro en el local' : `Envío a domicilio: ${order.address} (CP ${order.postalCode})`],
  ];
  rows.forEach(([label, value]) => {
    doc.font('Helvetica-Bold').fontSize(10).text(`${label}:`, left, y, { width: 80 });
    doc.font('Helvetica').text(value, left + 80, y, { width: width - 80 });
    y = doc.y + 4;
  });

  // Tabla de productos
  y += 12;
  const col = { qty: left, desc: left + 60 };
  doc.rect(left, y, width, 20).fill('#eee');
  doc.fillColor('#000').font('Helvetica-Bold').fontSize(10)
    .text('Cant.', col.qty + 6, y + 6)
    .text('Descripción', col.desc, y + 6);
  y += 26;

  doc.font('Helvetica').fontSize(10);
  order.items.forEach((item) => {
    if (y > doc.page.height - 160) {
      doc.addPage();
      y = 50;
    }
    doc.text(String(item.qty), col.qty + 6, y, { width: 50 });
    doc.font('Helvetica-Bold').text(item.name, col.desc, y, { width: right - col.desc });
    doc.font('Helvetica').fillColor('#444')
      .text(`Personalización: ${item.customization || '—'}`, col.desc, doc.y + 2, { width: right - col.desc });
    doc.fillColor('#000');
    y = doc.y + 8;
    doc.moveTo(left, y - 4).lineTo(right, y - 4).stroke('#ddd');
  });

  const units = order.items.reduce((sum, i) => sum + i.qty, 0);
  doc.font('Helvetica-Bold').text(`Total de unidades: ${units}`, left, y + 4);

  // Firma
  const signY = Math.max(doc.y + 70, doc.page.height - 140);
  doc.moveTo(left, signY).lineTo(left + 200, signY).stroke('#000');
  doc.moveTo(right - 200, signY).lineTo(right, signY).stroke('#000');
  doc.font('Helvetica').fontSize(9)
    .text('Firma y aclaración de quien recibe', left, signY + 5, { width: 200, align: 'center' })
    .text('Fecha de recepción', right - 200, signY + 5, { width: 200, align: 'center' });

  doc.end();
}

module.exports = { writeRemito };
