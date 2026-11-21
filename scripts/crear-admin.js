// Crea (o actualiza) el administrador usando las variables ADMIN_* del archivo .env.
// Uso: npm run admin
const bcrypt = require('bcryptjs');
const { env } = require('../src/config/env');
const db = require('../src/config/db');
const usuariosRepo = require('../src/repositories/usuarios.repo');

const nombre = (process.env.ADMIN_NOMBRE || 'Administrador').trim();
const correo = (process.env.ADMIN_CORREO || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';

if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
  console.error('ERROR: define un ADMIN_CORREO válido en .env');
  process.exit(1);
}
if (password.length < 8 || password.length > 72 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
  console.error('ERROR: ADMIN_PASSWORD debe tener 8-72 caracteres, con letras y números (defínela en .env).');
  process.exit(1);
}

const passwordHash = bcrypt.hashSync(password, env.bcryptRounds);
const existente = usuariosRepo.buscarPorCorreo(correo);

if (existente) {
  usuariosRepo.promoverAAdmin(existente.id, nombre, passwordHash);
  console.log(`Administrador actualizado: ${correo}`);
} else {
  usuariosRepo.crear({ nombre, correo, passwordHash, rol: 'administrador' });
  console.log(`Administrador creado: ${correo}`);
}
db.close();
