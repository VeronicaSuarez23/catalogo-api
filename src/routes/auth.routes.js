const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ctrl = require('../controllers/auth.controller');

router.post('/registro', asyncHandler(ctrl.registro));
router.post('/login', asyncHandler(ctrl.login));

module.exports = router;
