// Crea las tablas (si no existen). Uso: npm run init-db
const { env } = require('../src/config/env');
const db = require('../src/config/db');

console.log(`Base de datos lista en: ${env.dbPath}`);
db.close();
