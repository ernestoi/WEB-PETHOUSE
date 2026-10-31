const cita = require('../models/citaModel');
const AppError = require('../utils/AppError');
const { parseId } = require('../utils/validation');

function getCitaData(body) {
    const { petId, variantId, startAt, extraIds = [], notes } = body ?? {};

    if (!Array.isArray(extraIds)) {
        throw new AppError('Los servicios adicionales deben enviarse como una lista', 400);
    }
    if (!(new Date(startAt) > new Date())) {
        throw new AppError('La fecha de la cita debe ser futura', 400);
    }

    return {
        petId: parseId(petId, 'mascota'),
        variantId: parseId(variantId, 'servicio'),
        startAt,
        extraIds: [...new Set(extraIds.map((id) => parseId(id, 'servicio adicional')))],
        notes: typeof notes === 'string' ? notes.trim() || null : null,
    };
}

async function list(req, res) {
    res.json(await cita.findAllByClient(req.user.id));
}

async function getById(req, res) {
    const cita = await cita.findByIdForClient(parseId(req.params.id), req.user.id);
    if (!cita) throw new AppError('Cita no encontrada', 404);
    res.json(cita);
}

async function create(req, res) {
    const data = cita(req.body);

    let citaId;
    try {
        citaId = await cita.create(req.user.id, data);
    } catch (error) {
        if (error.message === 'INVALID_EXTRAS') {
            throw new AppError('Uno de los servicios adicionales no existe o no está disponible', 400);
        }
        throw error;
    }

    if (!citaId) {
        throw new AppError('La mascota o el servicio no son válidos para esta cita', 400);
    }

    const cita = await cita.findByIdForClient(citaId, req.user.id);
    res.status(201).json(cita);
}

async function cancel(req, res) {
    const result = await cita.cancel(parseId(req.params.id), req.user.id);
    if (!result.found) throw new AppError('Cita no encontrada', 404);
    if (!result.cancelled) throw new AppError('Esta cita ya no se puede cancelar', 409);
    res.status(204).end();
}

module.exports = { list, getById, create, cancel };