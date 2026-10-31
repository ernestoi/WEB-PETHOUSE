const AppError = require('../utils/AppError');

function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Autenticación requerida', 401));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError('No tiene permisos para realizar esta acción', 403));
        }

        next();
    };
}

module.exports = authorize;