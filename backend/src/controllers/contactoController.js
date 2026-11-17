
const Contacto = require("../models/contactoModel");
const AppError = require("../utils/AppError");

// ==========================================
// VALIDAR DATOS DEL FORMULARIO
// ==========================================

function validateContacto(body) {

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError("Los datos enviados no son válidos", 400);
  }

  const { nombre, correo, motivo, mensaje } = body;

  if (typeof nombre !== "string" || !nombre.trim()) {
    throw new AppError("El nombre es obligatorio", 400);
  }

  if (nombre.trim().length > 100) {
    throw new AppError("El nombre no puede superar 100 caracteres", 400);
  }

  if (
    typeof correo !== "string" ||
    correo.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
  ) {
    throw new AppError("El correo electrónico no es válido", 400);
  }

  const motivosPermitidos = ["servicios", "citas", "otro"];

  if (!motivosPermitidos.includes(motivo)) {
    throw new AppError("El motivo de consulta no es válido", 400);
  }

  if (typeof mensaje !== "string" || !mensaje.trim()) {
    throw new AppError("El mensaje es obligatorio", 400);
  }

  if (mensaje.trim().length > 5000) {
    throw new AppError("El mensaje no puede superar 5000 caracteres", 400);
  }

  return {
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    motivo,
    mensaje: mensaje.trim()
  };
}

// ==========================================
// REGISTRAR MENSAJE
// ==========================================

async function create(req, res, next) {

  try {

    const data = validateContacto(req.body);

    const contacto = await Contacto.create(data);

    res.status(201).json({
      message: "¡Mensaje enviado correctamente! Gracias por contactarnos.",
      contacto
    });

  } catch (error) {
    next(error);
  }

}

module.exports = {
  create
};
