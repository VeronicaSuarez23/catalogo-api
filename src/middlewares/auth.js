// Autenticación (JWT) y autorización por rol.
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const HttpError = require('../utils/httpError');
const usuariosRepo = require('../repositories/usuarios.repo');

// Verifica firma y expiración del token. La identidad (req.usuario) sale del token verificado.
function autenticar(req, res, next) {
  const [esquema, token] = (req.headers.authorization || '').split(' ');
  if (esquema !== 'Bearer' || !token) {
    throw new HttpError(401, 'TOKEN_REQUERIDO', 'Se requiere un token en el encabezado Authorization: Bearer <token>.');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new HttpError(401, 'TOKEN_VENCIDO', 'El token ha vencido. Inicia sesión nuevamente.');
    }
    throw new HttpError(401, 'TOKEN_INVALIDO', 'El token no es válido.');
  }

  // Se consulta el usuario real en BD: el rol vigente sale de la base, no de lo que diga el cliente.
  const usuario = usuariosRepo.buscarPorId(Number(payload.sub));
  if (!usuario) {
    throw new HttpError(401, 'TOKEN_INVALIDO', 'El token no es válido.');
  }

  req.usuario = usuario;
  next();
}

// Debe usarse DESPUÉS de autenticar.
const requerirRol = (...rolesPermitidos) => (req, res, next) => {
  if (!rolesPermitidos.includes(req.usuario.rol)) {
    throw new HttpError(403, 'ACCESO_DENEGADO', 'No tienes permisos para realizar esta acción.');
  }
  next();
};

module.exports = { autenticar, requerirRol };
