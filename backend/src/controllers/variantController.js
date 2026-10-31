const Variant = require('../models/variantModel');
const AppError = require('../utils/AppError');
const { parseId } = require('../utils/validation');

function getVariantData(body) {
    const { serviceId, species, size, hairType, price, durationMinutes } = body ?? {};
    return {
        serviceId: parseId(serviceId, 'servicio'),
        species: species ?? null,
        size: size || null,
        hairType: hairType || null,
        price: price ?? null,
        durationMinutes: durationMinutes ?? null,
    };
}

async function list(req, res) {
    const { serviceId } = req.query;
    const filterId = serviceId === undefined ? null : parseId(serviceId, 'servicio');
    res.json(await Variant.findAll(filterId));
}

async function getById(req, res) {
    const variant = await Variant.findById(parseId(req.params.id));
    if (!variant) throw new AppError('Variante no encontrada', 404);
    res.json(variant);
}

async function create(req, res) {
    const variant = await Variant.create(getVariantData(req.body));
    res.status(201).json(variant);
}

async function update(req, res) {
    const variant = await Variant.update(parseId(req.params.id), getVariantData(req.body));
    if (!variant) throw new AppError('Variante no encontrada', 404);
    res.json(variant);
}

async function remove(req, res) {
    const deactivated = await Variant.deactivate(parseId(req.params.id));
    if (!deactivated) throw new AppError('Variante no encontrada', 404);
    res.status(204).end();
}

module.exports = { list, getById, create, update, remove };