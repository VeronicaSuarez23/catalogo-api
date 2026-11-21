const HttpError = require('../utils/httpError');
const { parseId, validarProducto } = require('../utils/validaciones');
const productosRepo = require('../repositories/productos.repo');

const noEncontrado = () => new HttpError(404, 'PRODUCTO_NO_ENCONTRADO', 'El producto no existe.');

// GET /productos?categoria=...  (público)
function listar(req, res) {
  let { categoria } = req.query;
  if (categoria !== undefined) {
    if (typeof categoria !== 'string' || categoria.trim() === '') {
      throw new HttpError(400, 'CATEGORIA_INVALIDA', 'El filtro "categoria" debe ser un texto no vacío.');
    }
    categoria = categoria.trim();
  }
  res.status(200).json({ ok: true, data: productosRepo.listar(categoria) });
}

// GET /productos/:id  (público)
function obtener(req, res) {
  const producto = productosRepo.buscarPorId(parseId(req.params.id));
  if (!producto) throw noEncontrado();
  res.status(200).json({ ok: true, data: producto });
}

// POST /productos  (administrador)
function crear(req, res) {
  const datos = validarProducto(req.body);
  res.status(201).json({ ok: true, data: productosRepo.crear(datos) });
}

// PUT /productos/:id  (administrador) - reemplazo completo
function actualizar(req, res) {
  const id = parseId(req.params.id);
  const datos = validarProducto(req.body);
  const producto = productosRepo.actualizar(id, datos);
  if (!producto) throw noEncontrado();
  res.status(200).json({ ok: true, data: producto });
}

// DELETE /productos/:id  (administrador). Sus favoritos se borran por ON DELETE CASCADE.
function eliminar(req, res) {
  const eliminado = productosRepo.eliminar(parseId(req.params.id));
  if (!eliminado) throw noEncontrado();
  res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
