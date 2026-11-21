const express = require('express');
const routes = require('./routes');
const { noEncontrada, manejarErrores } = require('./middlewares/errores');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.use('/api', routes);

app.use(noEncontrada);
app.use(manejarErrores);

module.exports = app;
