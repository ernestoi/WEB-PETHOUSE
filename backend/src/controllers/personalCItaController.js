const personalCita = require('../models/personalCitaModel');
const AppError = require('../utils/AppError');

async function list(req, res) {
    const { estado, desde, hasta } = req.query;
    res.json(await personalCita.findAll({ estado, desde, hasta }));
}

async function getById(req, res) {
    const appointment = await personalCita.findById(req.params.id);
    if (!appointment) throw new AppError('Cita no encontrada', 404);
    res.json(appointment);
}

async function changeStatus(req, res) {
    const { id } = req.params;
    const { estado, observacion_profesional } = req.body ?? {};

    const updated = await personalCita.changeStatus(id, req.user.id, {
        estado,
        observacion_profesional:
            typeof observacion_profesional === 'string' ? observacion_profesional.trim() || null : null,
    });

    if (!updated) throw new AppError('Cita no encontrada', 404);

    res.json(await personalCita.findById(id));
}

module.exports = { list, getById, changeStatus };