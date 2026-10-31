const { Router } = require('express');
const variantController = require('../controllers/variantController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();

// Públicas
router.get('/', variantController.list);
router.get('/:id', variantController.getById);

// Solo administradores
router.post('/', authenticate, authorize('administrador'), variantController.create);
router.put('/:id', authenticate, authorize('administrador'), variantController.update);
router.delete('/:id', authenticate, authorize('administrador'), variantController.remove);

module.exports = router;