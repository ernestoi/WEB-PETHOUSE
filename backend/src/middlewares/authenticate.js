const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/token');

function authenticate(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return next(new AppError('Autenticación requerida', 401));
    }

    const token = header.slice(7).trim();
    if (!token) {
        return next(new AppError('Autenticación requerida', 401));
    }

    const payload = verifyToken(token);

    req.user = {
        id: Number(payload.sub),
        type: payload.type,
        role: payload.role,
    };

    next();
}

module.exports = authenticate;