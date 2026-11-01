const Pet = require('../models/petModel');
const AppError = require('../utils/AppError');


function getPetData(body) {
    const { name, species, breed, birthDate, size, hairType } = body ?? {};
    return {
        name: typeof name === 'string' ? name.trim() || null : null,
        species: species ?? null,
        breed: breed || null,
        birthDate: birthDate || null,
        size: size || null,
        hairType: hairType || null,
    };
}

async function list(req, res) {
    res.json(await Pet.findAllByClient(req.user.id));
}

async function getById(req, res) {
    const pet = await Pet.findByIdForClient(parseId(req.params.id), req.user.id);
    if (!pet) throw new AppError('Mascota no encontrada', 404);
    res.json(pet);
}

async function create(req, res) {
    const pet = await Pet.create(req.user.id, getPetData(req.body));
    res.status(201).json(pet);
}

async function update(req, res) {
    const pet = await Pet.update(parseId(req.params.id), req.user.id, getPetData(req.body));
    if (!pet) throw new AppError('Mascota no encontrada', 404);
    res.json(pet);
}

async function remove(req, res) {
    const deactivated = await Pet.deactivate(parseId(req.params.id), req.user.id);
    if (!deactivated) throw new AppError('Mascota no encontrada', 404);
    res.status(204).end();
}

module.exports = { list, getById, create, update, remove };