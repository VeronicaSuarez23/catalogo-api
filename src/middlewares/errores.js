// Manejo global de errores: respuestas claras sin exponer detalles internos.
const HttpError = require('../utils/httpError');

function noEncontrada(req, res, next) {
  next(new HttpError(404, 'RUTA_NO_ENCONTRADA', 'La ruta solicitada no existe.'));
}

// eslint-disable-next-line no-unused-vars
function manejarErrores(err, req, res, next) {
  if (err instanceof HttpError) {
    const error = { codigo: err.codigo, mensaje: err.message };
    if (err.detalles) error.detalles = err.detalles;
    return res.status(err.status).json({ ok: false, error });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, error: { codigo: 'JSON_INVALIDO', mensaje: 'El cuerpo de la petición no es un JSON válido.' } });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ ok: false, error: { codigo: 'CUERPO_MUY_GRANDE', mensaje: 'El cuerpo de la petición es demasiado grande.' } });
  }
  console.error('Error interno:', err.message); // solo en el servidor, nunca en la respuesta
  return res.status(500).json({ ok: false, error: { codigo: 'ERROR_INTERNO', mensaje: 'Error interno del servidor.' } });
}

module.exports = { noEncontrada, manejarErrores };
