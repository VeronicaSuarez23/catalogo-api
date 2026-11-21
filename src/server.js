const { env, validarEntorno } = require('./config/env');
validarEntorno();

const db = require('./config/db');
const app = require('./app');

const servidor = app.listen(env.port, () => {
  console.log(`API de catálogo escuchando en http://localhost:${env.port}/api`);
});

function cerrar() {
  servidor.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);
