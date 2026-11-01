const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

const JWT_OPTIONS = {
    algorithm: 'HS256',
    issuer: 'petshouse-api',
    audience: 'petshouse-app',
};

function generateToken({ id, type, role }) {
    return jwt.sign(
        { sub: String(id), type, role },
        process.env.JWT_SECRET,
        { ...JWT_OPTIONS, expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
}

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: [JWT_OPTIONS.algorithm],
            issuer: JWT_OPTIONS.issuer,
            audience: JWT_OPTIONS.audience,
        });
    } catch {
        throw new AppError('Token inválido o expirado', 401);
    }
}

module.exports = { generateToken, verifyToken };