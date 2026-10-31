const { Router } = require('express');
const citaController = require('../controllers/citaController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();

router.use(authenticate, authorize('cliente'));

router.get('/', citaController.list);
router.get('/:id', citaController.getById);
router.post('/', citaController.create);
router.patch('/:id/cancel', citaController.cancel);

module.exports = router;