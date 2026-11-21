// Acceso a datos de productos (consultas parametrizadas).
const db = require('../config/db');

const COLS = `id, nombre, descripcion, categoria, precio,
              creado_en AS creadoEn, actualizado_en AS actualizadoEn`;

const stmtListar = db.prepare(`SELECT ${COLS} FROM productos ORDER BY id`);
const stmtListarCategoria = db.prepare(
  `SELECT ${COLS} FROM productos WHERE categoria = ? COLLATE NOCASE ORDER BY id`
);
const stmtPorId = db.prepare(`SELECT ${COLS} FROM productos WHERE id = ?`);
const stmtPorNombre = db.prepare('SELECT id FROM productos WHERE nombre = ?');
const stmtCrear = db.prepare(
  'INSERT INTO productos (nombre, descripcion, categoria, precio) VALUES (?, ?, ?, ?)'
);
const stmtActualizar = db.prepare(
  `UPDATE productos
      SET nombre = ?, descripcion = ?, categoria = ?, precio = ?, actualizado_en = datetime('now')
    WHERE id = ?`
);
const stmtEliminar = db.prepare('DELETE FROM productos WHERE id = ?');

const listar = (categoria) => (categoria ? stmtListarCategoria.all(categoria) : stmtListar.all());
const buscarPorId = (id) => stmtPorId.get(id);
const existePorNombre = (nombre) => Boolean(stmtPorNombre.get(nombre));

function crear({ nombre, descripcion, categoria, precio }) {
  const info = stmtCrear.run(nombre, descripcion, categoria, precio);
  return buscarPorId(info.lastInsertRowid);
}

function actualizar(id, { nombre, descripcion, categoria, precio }) {
  const info = stmtActualizar.run(nombre, descripcion, categoria, precio, id);
  return info.changes > 0 ? buscarPorId(id) : null;
}

// Los favoritos asociados se eliminan solos por ON DELETE CASCADE.
const eliminar = (id) => stmtEliminar.run(id).changes > 0;

module.exports = { listar, buscarPorId, existePorNombre, crear, actualizar, eliminar };
