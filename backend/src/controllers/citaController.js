const Cita = require("../models/citaModel");
const AppError = require("../utils/AppError");

// VALIDAR IDENTIFICADORES

function parseId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("El identificador no es válido", 400);
  }

  return id;
}

// VALIDAR DATOS DE LA CITA

function getCitaData(body) {
  const { petId, variantId, startAt, extraIds = [], notes } = body ?? {};

  if (!Array.isArray(extraIds)) {
    throw new AppError(
      "Los servicios adicionales deben enviarse como una lista",
      400,
    );
  }

  if (!(new Date(startAt) > new Date())) {
    throw new AppError("La fecha de la cita debe ser futura", 400);
  }

  return {
    petId: parseId(petId),
    variantId: parseId(variantId),
    startAt,
    extraIds: [...new Set(extraIds.map((id) => parseId(id)))],
    notes: typeof notes === "string" ? notes.trim() || null : null,
  };
}

// CONSULTAR CITAS

async function list(req, res) {
  res.json(await Cita.findAllByClient(req.user.id));
}

// CONSULTAR DISPONIBILIDAD

async function availability(req, res) {
  const { date } = req.query;

  if (!date) {
    throw new AppError("Debes seleccionar una fecha", 400);
  }

  let result;

  try {
    result = await Cita.getAvailability(date);
  } catch (error) {
    if (error.message === "INVALID_DATE") {
      throw new AppError("La fecha seleccionada no es válida", 400);
    }

    throw error;
  }

  res.json(result);
}

// CONSULTAR CITA POR ID

async function getById(req, res) {
  const citaEncontrada = await Cita.findByIdForClient(
    parseId(req.params.id),
    req.user.id,
  );

  if (!citaEncontrada) {
    throw new AppError("Cita no encontrada", 404);
  }

  res.json(citaEncontrada);
}

// REGISTRAR CITA

async function create(req, res) {
  const data = getCitaData(req.body);

  let citaId;

  try {
    citaId = await Cita.create(req.user.id, data);
  } catch (error) {
    if (error.message === "INVALID_EXTRAS") {
      throw new AppError(
        "Uno de los servicios adicionales no existe o no está disponible",
        400,
      );
    }

    if (error.message === "SLOT_TAKEN") {
      throw new AppError(
        "El horario seleccionado ya está ocupado. Selecciona otro horario.",
        409,
      );
    }

    if (error.message === "PET_ALREADY_BOOKED") {
      throw new AppError(
        "Esta mascota ya tiene una cita agendada para este día. Selecciona otra fecha.",
        409,
      );
    }

    if (error.message === "INVALID_SLOT") {
      throw new AppError("El horario seleccionado no es válido", 400);
    }

    if (error.message === "INVALID_SERVICE_OR_PET") {
      throw new AppError(
        "La mascota o el servicio no son válidos para esta cita",
        400,
      );
    }

    throw error;
  }

  if (!citaId) {
    throw new AppError(
      "La mascota o el servicio no son válidos para esta cita",
      400,
    );
  }

  const citaCreada = await Cita.findByIdForClient(citaId, req.user.id);

  res.status(201).json(citaCreada);
}

// CANCELAR CITA

async function cancel(req, res) {
  const result = await Cita.cancel(parseId(req.params.id), req.user.id);

  if (!result.found) {
    throw new AppError("Cita no encontrada", 404);
  }

  if (!result.cancelled) {
    throw new AppError("Esta cita ya no se puede cancelar", 409);
  }

  res.status(204).end();
}

// EXPORTAR FUNCIONES

module.exports = {
  list,
  availability,
  getById,
  create,
  cancel,
};
