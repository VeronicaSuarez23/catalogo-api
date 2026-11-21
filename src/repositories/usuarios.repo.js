// Acceso a datos de usuarios. Todas las consultas están parametrizadas.
const db = require('../config/db');

const COLUMNAS_PUBLICAS = 'id, nombre, correo, rol, creado_en AS creadoEn';

const stmtCrear = db.prepare(
  'INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?)'
);
const stmtPorCorreo = db.prepare('SELECT * FROM usuarios WHERE correo = ?'); // incluye hash: solo uso interno
const stmtPorId = db.prepare(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = ?`);
const stmtActualizarAdmin = db.prepare(
  "UPDATE usuarios SET nombre = ?, password_hash = ?, rol = 'administrador' WHERE id = ?"
);

const buscarPorCorreo = (correo) => stmtPorCorreo.get(correo);
const buscarPorId = (id) => stmtPorId.get(id);

function crear({ nombre, correo, passwordHash, rol = 'usuario' }) {
  const info = stmtCrear.run(nombre, correo, passwordHash, rol);
  return buscarPorId(info.lastInsertRowid);
}

const promoverAAdmin = (id, nombre, passwordHash) => stmtActualizarAdmin.run(nombre, passwordHash, id);

module.exports = { crear, buscarPorCorreo, buscarPorId, promoverAAdmin };
