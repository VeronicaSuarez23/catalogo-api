// Carga las variables de entorno desde .env y las expone en un único objeto.
const path = require('path');
require('dotenv').config();

const env = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  dbPath: path.resolve(process.env.DB_PATH || './data/catalogo.db'),
  bcryptRounds: 10,
};

// Se llama al arrancar el servidor: sin un secreto robusto no se debe iniciar.
function validarEntorno() {
  if (!env.jwtSecret || env.jwtSecret.length < 32) {
    console.error(
      'ERROR: JWT_SECRET no está definido o tiene menos de 32 caracteres. Revisa tu archivo .env (ver .env.example).'
    );
    process.exit(1);
  }
}

module.exports = { env, validarEntorno };
