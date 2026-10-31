const { Router } = require('express');
const petController = require('../controllers/petController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();

router.use(authenticate, authorize('cliente'));

router.get('/', petController.list);
router.get('/:id', petController.getById);
router.post('/', petController.create);
router.put('/:id', petController.update);
router.delete('/:id', petController.remove);

module.exports = router;