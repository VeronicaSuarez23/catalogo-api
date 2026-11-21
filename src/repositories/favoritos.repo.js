// Acceso a datos de favoritos. SIEMPRE se filtra por usuario_id (el del token).
const db = require('../config/db');

const SELECT = `SELECT f.producto_id AS productoId, p.nombre, p.descripcion, p.categoria, p.precio,
                       f.creado_en AS agregadoEn
                  FROM favoritos f
                  JOIN productos p ON p.id = f.producto_id`;

const stmtListar = db.prepare(`${SELECT} WHERE f.usuario_id = ? ORDER BY f.id`);
const stmtObtener = db.prepare(`${SELECT} WHERE f.usuario_id = ? AND f.producto_id = ?`);
const stmtAgregar = db.prepare('INSERT INTO favoritos (usuario_id, producto_id) VALUES (?, ?)');
const stmtQuitar = db.prepare('DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?');

const listarPorUsuario = (usuarioId) => stmtListar.all(usuarioId);
const obtener = (usuarioId, productoId) => stmtObtener.get(usuarioId, productoId);
const agregar = (usuarioId, productoId) => stmtAgregar.run(usuarioId, productoId);
const quitar = (usuarioId, productoId) => stmtQuitar.run(usuarioId, productoId).changes > 0;

module.exports = { listarPorUsuario, obtener, agregar, quitar };
