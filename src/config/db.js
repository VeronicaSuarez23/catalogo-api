// Conexión a SQLite (better-sqlite3) y creación del esquema.
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { env } = require('./env');

fs.mkdirSync(path.dirname(env.dbPath), { recursive: true });

const db = new Database(env.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON'); // imprescindible en SQLite para que funcionen las FK y el CASCADE

db.exec(fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8'));

module.exports = db;
