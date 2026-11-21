const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const HttpError = require('../utils/httpError');
const { validarRegistro, validarLogin } = require('../utils/validaciones');
const usuariosRepo = require('../repositories/usuarios.repo');

// Hash falso para que el tiempo de respuesta sea similar si el correo no existe.
const HASH_FALSO = bcrypt.hashSync('contrasena-falsa-123', env.bcryptRounds);

// POST /auth/registro  -> el rol SIEMPRE es "usuario" (se ignora cualquier "rol" del cuerpo).
async function registro(req, res) {
  const { nombre, correo, password } = validarRegistro(req.body);

  if (usuariosRepo.buscarPorCorreo(correo)) {
    throw new HttpError(409, 'CORREO_DUPLICADO', 'Ya existe un usuario registrado con ese correo.');
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  let usuario;
  try {
    usuario = usuariosRepo.crear({ nombre, correo, passwordHash, rol: 'usuario' });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new HttpError(409, 'CORREO_DUPLICADO', 'Ya existe un usuario registrado con ese correo.');
    }
    throw err;
  }

  res.status(201).json({ ok: true, data: usuario }); // sin contraseña ni hash
}

// POST /auth/login -> emite un JWT con vencimiento.
async function login(req, res) {
  const { correo, password } = validarLogin(req.body);

  const fila = usuariosRepo.buscarPorCorreo(correo);
  const coincide = await bcrypt.compare(password, fila ? fila.password_hash : HASH_FALSO);
  if (!fila || !coincide) {
    // Mensaje genérico: no revela si el correo existe.
    throw new HttpError(401, 'CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.');
  }

  const token = jwt.sign({ rol: fila.rol }, env.jwtSecret, {
    algorithm: 'HS256',
    subject: String(fila.id),
    expiresIn: env.jwtExpiresIn,
  });

  res.status(200).json({
    ok: true,
    data: {
      token,
      tipo: 'Bearer',
      expiraEn: env.jwtExpiresIn,
      usuario: { id: fila.id, nombre: fila.nombre, correo: fila.correo, rol: fila.rol },
    },
  });
}

module.exports = { registro, login };
