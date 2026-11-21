// Envuelve controladores async para enviar los errores al manejador global (Express 4).
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
