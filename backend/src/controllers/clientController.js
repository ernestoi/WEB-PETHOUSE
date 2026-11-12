const Client = require("../models/clientModel");
const AppError = require("../utils/AppError");
const Pet = require("../models/petModel");

const MAX_INT = 2147483647;

// ==========================================
// VALIDAR ID
// ==========================================

function parseId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0 || id > MAX_INT) {
    throw new AppError("El ID del cliente no es válido", 400);
  }

  return id;
}

// ==========================================
// VALIDAR DATOS DEL CLIENTE
// ==========================================

function validateClientData(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError("Los datos enviados no son válidos", 400);
  }

  const { name, email, phone, address } = body;

  if (typeof name !== "string" || !name.trim()) {
    throw new AppError("El nombre es obligatorio", 400);
  }

  if (name.trim().length > 250) {
    throw new AppError("El nombre es demasiado largo", 400);
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw new AppError("El correo electrónico no es válido", 400);
  }

  if (phone && !/^09\d{8}$/.test(phone)) {
    throw new AppError(
      "El teléfono debe tener 10 dígitos y comenzar con 09",
      400,
    );
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone || null,
    address: address?.trim() || null,
  };
}

// ==========================================
// LISTAR Y BUSCAR CLIENTES
// ==========================================

async function list(req, res) {
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";

  const clients = await Client.findAll(search);

  res.json({
    total: clients.length,
    clients,
  });
}

// ==========================================
// CONSULTAR CLIENTE POR ID
// ==========================================

async function getById(req, res) {
  const id = parseId(req.params.id);

  const client = await Client.findById(id);

  if (!client) {
    throw new AppError("Cliente no encontrado", 404);
  }

  res.json(client);
}

// ==========================================
// ACTUALIZAR CLIENTE
// ==========================================

async function update(req, res) {
  const id = parseId(req.params.id);
  const data = validateClientData(req.body);

  const client = await Client.update(id, data);

  if (!client) {
    throw new AppError("Cliente no encontrado", 404);
  }

  res.json({
    message: "Cliente actualizado correctamente",
    client,
  });
}

// ==========================================
// LISTAR MASCOTAS DE UN CLIENTE (ADMIN)
// ==========================================

async function listPets(req, res) {
  const clientId = parseId(req.params.id);

  const client = await Client.findById(clientId);

  if (!client) {
    throw new AppError("Cliente no encontrado", 404);
  }

  const pets = await Pet.findAllByClient(clientId);

  res.json({
    total: pets.length,
    pets,
  });
}

// ==========================================
// DESACTIVAR MASCOTA (ADMIN)
// ==========================================

async function deactivatePet(req, res) {
  const clientId = parseId(req.params.id);
  const petId = parseId(req.params.petId);

  const client = await Client.findById(clientId);

  if (!client) {
    throw new AppError("Cliente no encontrado", 404);
  }

  const deactivated = await Pet.deactivate(petId, clientId);

  if (!deactivated) {
    throw new AppError("Mascota no encontrada o ya está desactivada", 404);
  }

  res.json({
    message: "Mascota desactivada correctamente",
  });
}

// ==========================================
// CONSULTAR PERFIL DEL CLIENTE
// ==========================================

async function getMyProfile(req, res) {
  const client = await Client.findById(parseId(req.user.id));

  if (!client) {
    throw new AppError("Perfil de cliente no encontrado", 404);
  }

  res.json(client);
}

// ==========================================
// ACTUALIZAR PERFIL DEL CLIENTE
// ==========================================

async function updateMyProfile(req, res) {
  const data = validateClientData(req.body);

  const client = await Client.update(parseId(req.user.id), data);

  if (!client) {
    throw new AppError("Perfil de cliente no encontrado", 404);
  }

  res.json({
    message: "Perfil actualizado correctamente",
    client,
  });
}

// ==========================================
// ACTUALIZAR FOTOGRAFÍA DEL CLIENTE
// ==========================================

/*
async function updateMyPhoto(req, res) {
  if (!req.file) {
    throw new AppError("Debes seleccionar una fotografía", 400);
  }

  const photoUrl = `/uploads/clientes/${req.file.filename}`;

  const client = await Client.updatePhoto(parseId(req.user.id), photoUrl);

  if (!client) {
    throw new AppError("Perfil de cliente no encontrado", 404);
  }

  res.json({
    message: "Fotografía actualizada correctamente",
    client,
  });
}*/
async function updateMyPhoto(req, res) {

  console.log("ARCHIVO RECIBIDO:", req.file);

  if (!req.file) {
    throw new AppError("Debes seleccionar una fotografía", 400);
  }

  console.log("RUTA DEL ARCHIVO:", req.file.path);

  const photoUrl = `/uploads/clientes/${req.file.filename}`;

  const client = await Client.updatePhoto(
    parseId(req.user.id),
    photoUrl
  );

  if (!client) {
    throw new AppError("Perfil de cliente no encontrado", 404);
  }

  res.json({
    message: "Fotografía actualizada correctamente",
    client
  });
}



module.exports = {
  list,
  getById,
  update,
  listPets,
  deactivatePet,
  validateClientData,
  getMyProfile,
  updateMyProfile,
  updateMyPhoto
};
