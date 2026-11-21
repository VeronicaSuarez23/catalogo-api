const router = require('express').Router();
const ctrl = require('../controllers/productos.controller');
const { autenticar, requerirRol } = require('../middlewares/auth');

const soloAdmin = [autenticar, requerirRol('administrador')];

// Públicas
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);

// Solo administrador
router.post('/', soloAdmin, ctrl.crear);
router.put('/:id', soloAdmin, ctrl.actualizar);
router.delete('/:id', soloAdmin, ctrl.eliminar);

module.exports = router;
