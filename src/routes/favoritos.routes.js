const router = require('express').Router();
const ctrl = require('../controllers/favoritos.controller');
const { autenticar } = require('../middlewares/auth');

router.use(autenticar); // todas las rutas de favoritos requieren token válido

router.get('/', ctrl.listar);
router.post('/', ctrl.agregar);
router.delete('/:productoId', ctrl.quitar);

module.exports = router;
