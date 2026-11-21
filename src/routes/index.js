const router = require('express').Router();

router.get('/salud', (req, res) => res.status(200).json({ ok: true, data: { estado: 'activo' } }));
router.use('/auth', require('./auth.routes'));
router.use('/productos', require('./productos.routes'));
router.use('/favoritos', require('./favoritos.routes'));

module.exports = router;
