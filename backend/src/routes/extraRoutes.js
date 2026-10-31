const { Router } = require('express');
const extraController = require('../controllers/extraController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();

router.get('/', extraController.list);
router.get('/:id', extraController.getById);

router.post('/', authenticate, authorize('administrador'), extraController.create);
router.put('/:id', authenticate, authorize('administrador'), extraController.update);
router.delete('/:id', authenticate, authorize('administrador'), extraController.remove);

module.exports = router;