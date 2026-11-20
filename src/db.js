const dns = require('dns');
const mongoose = require('mongoose');

// En algunos Windows, Node toma 127.0.0.1 como servidor DNS y falla la
// búsqueda SRV de las URIs mongodb+srv:// de Atlas (querySrv ECONNREFUSED).
// En ese caso usamos DNS públicos (o los de DNS_SERVERS en el .env).
function fixDnsForSrv() {
  if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
    return;
  }
  const onlyLoopback = dns.getServers().every((s) => s.startsWith('127.') || s === '::1');
  if (onlyLoopback) dns.setServers(['8.8.8.8', '1.1.1.1']);
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/papeleria';
  if (uri.startsWith('mongodb+srv://')) fixDnsForSrv();
  // Si la URI no trae nombre de base, usamos "papeleria" (y no "test").
  const hasDbName = new URL(uri).pathname.length > 1;
  await mongoose.connect(uri, hasDbName ? {} : { dbName: 'papeleria' });
  console.log(`MongoDB conectado: ${mongoose.connection.name}`);
}

module.exports = connectDB;
