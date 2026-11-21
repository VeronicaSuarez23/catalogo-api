const HttpError = require('../utils/httpError');
const { parseId, validarFavorito } = require('../utils/validaciones');
const productosRepo = require('../repositories/productos.repo');
const favoritosRepo = require('../repositories/favoritos.repo');

// La identidad SIEMPRE sale de req.usuario (token verificado), nunca del cuerpo ni de la URL.

// GET /favoritos
function listar(req, res) {
  res.status(200).json({ ok: true, data: favoritosRepo.listarPorUsuario(req.usuario.id) });
}

// POST /favoritos  { "productoId": 1 }
function agregar(req, res) {
  const { productoId } = validarFavorito(req.body);
  const usuarioId = req.usuario.id;

  if (!productosRepo.buscarPorId(productoId)) {
    throw new HttpError(404, 'PRODUCTO_NO_ENCONTRADO', 'El producto no existe.');
  }
  if (favoritosRepo.obtener(usuarioId, productoId)) {
    throw new HttpError(409, 'FAVORITO_DUPLICADO', 'El producto ya está en tus favoritos.');
  }

  try {
    favoritosRepo.agregar(usuarioId, productoId);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new HttpError(409, 'FAVORITO_DUPLICADO', 'El producto ya está en tus favoritos.');
    }
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      throw new HttpError(404, 'PRODUCTO_NO_ENCONTRADO', 'El producto no existe.');
    }
    throw err;
  }

  res.status(201).json({ ok: true, data: favoritosRepo.obtener(usuarioId, productoId) });
}

// DELETE /favoritos/:productoId
function quitar(req, res) {
  const productoId = parseId(req.params.productoId, 'productoId');
  // Solo borra si el favorito pertenece al usuario del token.
  if (!favoritosRepo.quitar(req.usuario.id, productoId)) {
    throw new HttpError(404, 'FAVORITO_NO_ENCONTRADO', 'Ese producto no está en tus favoritos.');
  }
  res.status(204).send();
}

module.exports = { listar, agregar, quitar };
