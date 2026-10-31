const { Router } = require('express');
const serviceController = require('../controllers/serviceController');
const authorize = require('../middlewares/authorize');
const authenticate = require('../middlewares/authenticate');

const router = Router();

router.get('/', serviceController.list);
router.get('/:id', serviceController.getById);


router.post('/', authenticate, authorize('administrador'), serviceController.create);
router.put('/:id', authenticate, authorize('administrador'), serviceController.update);
router.delete('/:id', authenticate, authorize('administrador'), serviceController.remove);

module.exports = router;