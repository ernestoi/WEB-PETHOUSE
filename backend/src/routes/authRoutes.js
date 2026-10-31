const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.post('/register', authController.registerClient);
router.post('/login', authController.loginClient);
router.post('/admin/login', authController.loginAdmin);

module.exports = router;