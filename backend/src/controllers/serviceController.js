const Service = require('../models/serviceModel');
const AppError = require('../utils/AppError');

const MAX_INT = 2147483647;

// ---------- Validation ----------

function parseId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0 || id > MAX_INT) {
        throw new AppError('El id no es válido', 400);
    }
    return id;
}

function validateService(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new AppError('Los datos enviados no son válidos', 400);
    }

    const { name, description } = body;

    if (typeof name !== 'string' || name.trim() === '') {
        throw new AppError('El nombre es obligatorio', 400);
    }
    if (name.trim().length > 50) {
        throw new AppError('El nombre no puede superar los 50 caracteres', 400);
    }

    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            throw new AppError('La descripción debe ser texto', 400);
        }
        if (description.trim().length > 500) {
            throw new AppError('La descripción no puede superar los 500 caracteres', 400);
        }
    }

    return {
        name: name.trim(),
        description: description?.trim() || null,
    };
}

// ---------- Actions ----------

async function list(req, res) {
    const services = await Service.findAll();
    res.json(services);
}

async function getById(req, res) {
    const id = parseId(req.params.id);
    const service = await Service.findById(id);
    if (!service) throw new AppError('Servicio no encontrado', 404);
    res.json(service);
}

async function create(req, res) {
    const data = validateService(req.body);
    const service = await Service.create(data);
    res.status(201).json(service);
}

async function update(req, res) {
    const id = parseId(req.params.id);
    const data = validateService(req.body);
    const service = await Service.update(id, data);
    if (!service) throw new AppError('Servicio no encontrado', 404);
    res.json(service);
}

async function remove(req, res) {
    const id = parseId(req.params.id);
    const deactivated = await Service.deactivate(id);
    if (!deactivated) throw new AppError('Servicio no encontrado', 404);
    res.status(204).end();
}

module.exports = { list, getById, create, update, remove };