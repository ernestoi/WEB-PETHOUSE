const Auth = require('../models/authModel');
const AppError = require('../utils/AppError');
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateToken } = require('../utils/token');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^09\d{8}$/;
const PASSWORD_MIN_LENGTH = 5;
const PASSWORD_MAX_LENGTH = 128;

// ---------- Validacion ----------

function ensureObject(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new AppError('Los datos enviados no son válidos', 400);
    }
}

function validateLogin(body, field) {
    ensureObject(body);
    const login = body[field];
    const { password } = body;

    if (typeof login !== 'string' || login.trim() === '' || login.length > 250 ||
        typeof password !== 'string' || password === '' || password.length > PASSWORD_MAX_LENGTH) {
        throw new AppError('Credenciales inválidas', 401);
    }

    return { login: login.trim(), password };
}

function validateRegistration(body) {
    ensureObject(body);
    const { name, email, password, phone } = body;

    if (typeof name !== 'string' || name.trim() === '' || name.trim().length > 250) {
        throw new AppError('El nombre es obligatorio y no puede superar los 250 caracteres', 400);
    }
    if (typeof email !== 'string' || email.length > 250 || !EMAIL_REGEX.test(email.trim())) {
        throw new AppError('El email no es válido', 400);
    }
    if (typeof password !== 'string' ||
        password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
        throw new AppError(
            `La contraseña debe tener entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres`, 400
        );
    }
    if (phone !== undefined && phone !== null && (typeof phone !== 'string' || !PHONE_REGEX.test(phone))) {
        throw new AppError('El celular debe tener 10 dígitos y empezar con 09', 400);
    }

    return {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone || null,
    };
}

// ---------- Utiles ----------

async function authenticate(user, password) {
    if (!user || !(await verifyPassword(user.passwordHash, password))) {
        throw new AppError('Credenciales inválidas', 401);
    }
}

function buildSession(user, type, role) {
    const token = generateToken({ id: user.id, type, role });
    return {
        token,
        user: { id: user.id, name: user.name, type, role },
    };
}

// ---------- Acciones ----------

async function registerClient(req, res) {
    const data = validateRegistration(req.body);
    const passwordHash = await hashPassword(data.password);

    const client = await Auth.createClient({
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
    });

    res.status(201).json(client);
}

async function loginClient(req, res) {
    const { login, password } = validateLogin(req.body, 'email');
    const client = await Auth.findClientForLogin(login);

    await authenticate(client, password);

    res.json(buildSession(client, 'client', 'cliente'));
}

async function loginAdmin(req, res) {
    const { login, password } = validateLogin(req.body, 'username');
    const admin = await Auth.findAdminForLogin(login);

    await authenticate(admin, password);

    res.json(buildSession(admin, 'admin', admin.role));
}

module.exports = { registerClient, loginClient, loginAdmin };