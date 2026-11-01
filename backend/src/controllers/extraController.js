const Extra = require('../models/extraModel');
const AppError = require('../utils/AppError');
//const { parseId } = require('../utils/validation');

function getExtraData(body) {
    const { name, description, price, durationMinutes } = body ?? {};
    return {
        name: name?.trim() || null,
        description: description?.trim() || null,
        price: price ?? null,
        durationMinutes: durationMinutes ?? null,
    };
}

async function list(req, res) {
    res.json(await Extra.findAll());
}

async function getById(req, res) {
    const extra = await Extra.findById(parseId(req.params.id));
    if (!extra) throw new AppError('Servicio adicional no encontrado', 404);
    res.json(extra);
}

async function create(req, res) {
    const extra = await Extra.create(getExtraData(req.body));
    res.status(201).json(extra);
}

async function update(req, res) {
    const extra = await Extra.update(parseId(req.params.id), getExtraData(req.body));
    if (!extra) throw new AppError('Servicio adicional no encontrado', 404);
    res.json(extra);
}

async function remove(req, res) {
    const deactivated = await Extra.deactivate(parseId(req.params.id));
    if (!deactivated) throw new AppError('Servicio adicional no encontrado', 404);
    res.status(204).end();
}

module.exports = { list, getById, create, update, remove };