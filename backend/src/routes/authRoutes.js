const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const AppError = require('../utils/AppError');

const router = Router();

function createLimiter({ windowMinutes, max, message, skipSuccessfulRequests = false }) {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        limit: max,
        skipSuccessfulRequests,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        handler: (req, res, next) => next(new AppError(message, 429)),
    });
}

const loginLimiter = createLimiter({
    windowMinutes: 15,
    max: 5,
    skipSuccessfulRequests: true,
    message: 'Demasiados intentos de inicio de sesión. Intente nuevamente en 15 minutos',
});

const registerLimiter = createLimiter({
    windowMinutes: 60,
    max: 10,
    message: 'Demasiados registros desde esta conexión. Intente nuevamente más tarde',
});

router.post('/register', registerLimiter, authController.registerClient);
router.post('/login', loginLimiter, authController.loginClient);
router.post('/admin/login', loginLimiter, authController.loginAdmin);

module.exports = router;