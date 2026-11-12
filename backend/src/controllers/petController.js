const Pet = require("../models/petModel");
const AppError = require("../utils/AppError");

const fs = require("fs/promises");

const MAX_INT = 2147483647;

// ==========================================
// VALIDAR ID
// ==========================================

function parseId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0 || id > MAX_INT) {
    throw new AppError("El ID de la mascota no es válido", 400);
  }

  return id;
}

// ==========================================
// CONTAR TODAS LAS MASCOTAS
// ==========================================

async function getAllPets(req, res) {
  const total = await Pet.countAllPets();

  return res.json({
    totalPets: total,
  });
}

// ==========================================
// OBTENER DATOS DE LA MASCOTA
// ==========================================

function getPetData(body) {
  const { name, species, breed, birthDate, size, hairType, sex } = body ?? {};

  return {
    name: typeof name === "string" ? name.trim() : null,

    species: typeof species === "string" ? species.trim().toLowerCase() : null,

    breed: breed?.trim() || null,

    birthDate: birthDate || null,

    size: size?.trim().toLowerCase() || null,

    hairType: hairType?.trim().toLowerCase() || null,

    sex: sex?.trim().toLowerCase() || null,
  };
}

// ==========================================
// LISTAR MASCOTAS DEL CLIENTE
// ==========================================

async function list(req, res) {
  const mascotas = await Pet.findAllByClient(req.user.id);

  return res.json(mascotas);
}

// ==========================================
// CONSULTAR MASCOTA POR ID
// ==========================================

async function getById(req, res) {
  const pet = await Pet.findByIdForClient(parseId(req.params.id), req.user.id);

  if (!pet) {
    throw new AppError("Mascota no encontrada", 404);
  }

  return res.json(pet);
}

// ==========================================
// REGISTRAR MASCOTA CON FOTOGRAFÍA
// ==========================================

async function create(req, res) {
  if (!req.file) {
    throw new AppError("Debes subir una fotografía de tu mascota", 400);
  }

  try {
    const data = getPetData(req.body);

    // Validar campos obligatorios
    if (!data.name) {
      throw new AppError("El nombre de la mascota es obligatorio", 400);
    }

    if (!data.species) {
      throw new AppError("Debes seleccionar una especie", 400);
    }

    if (!data.sex) {
      throw new AppError("Debes seleccionar el sexo", 400);
    }

    if (!data.size) {
      throw new AppError("Debes seleccionar el tamaño", 400);
    }

    // Ruta de la fotografía
    const photoUrl = `/uploads/mascotas/${req.file.filename}`;

    // Registrar mascota en PostgreSQL
    const pet = await Pet.create(req.user.id, {
      ...data,
      photoUrl,
    });

    return res.status(201).json({
      message: "Mascota registrada correctamente",
      pet,
    });
  } catch (error) {
    console.error("========== ERROR AL REGISTRAR MASCOTA ==========");
    console.error("Mensaje:", error.message);
    console.error("Código:", error.code);
    console.error("Detalle:", error.detail);
    console.error("Restricción:", error.constraint);
    console.error("Error completo:", error);

    await fs.unlink(req.file.path).catch(() => {});

    throw error;
  }
}

// ==========================================
// ACTUALIZAR MASCOTA
// ==========================================

async function update(req, res) {
  const pet = await Pet.update(
    parseId(req.params.id),
    req.user.id,
    getPetData(req.body),
  );

  if (!pet) {
    throw new AppError("Mascota no encontrada", 404);
  }

  return res.json({
    message: "Mascota actualizada correctamente",
    pet,
  });
}

// ==========================================
// DESACTIVAR MASCOTA
// ==========================================

async function remove(req, res) {
  const deactivated = await Pet.deactivate(parseId(req.params.id), req.user.id);

  if (!deactivated) {
    throw new AppError("Mascota no encontrada", 404);
  }

  return res.status(204).end();
}

// ==========================================
// EXPORTAR CONTROLADORES
// ==========================================

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  getAllPets,
};
