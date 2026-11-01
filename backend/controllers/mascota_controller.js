const mascotaModel = require("../models/mascota.models.js");

function listarMisMascotas(req, res) {
  // 1. Extraemos el ID del cliente guardado en la sesión de Express
  const idClienteSesion = req.session.id_cliente;

  console.log("El frontend solicitó las mascotas del cliente logueado");

  // 2. Validamos si el usuario realmente ha iniciado sesión
  if (idClienteSesion === undefined || idClienteSesion === null) {
    return res.status(401).json({
      exito: false,
      mensaje: "No autorizado. Por favor, inicia sesión primero.",
    });
  }

  // 3. Llamamos al modelo pasándole el ID de la sesión y el callback tradicional
  mascotaModel.obtenerMascotasPorCliente(idClienteSesion, (error, filasMascotas) => {
    // Caso 1: Error interno de PostgreSQL
    if (error) {
      return res.status(500).json({
        exito: false,
        mensaje: "Error al consultar las mascotas en la base de datos.",
      });
    }

    // Caso 2: El cliente no tiene ninguna mascota registrada aún
    if (filasMascotas.length === 0) {
      return res.status(200).json({
        exito: true,
        mensaje: "El cliente no tiene mascotas registradas.",
        mascotas: [] // Mandamos el arreglo vacío para que el frontend sepa qué mostrar
      });
    }

    // Caso 3: Todo salió bien, devolvemos las mascotas reales obtenidas de Postgres
    return res.status(200).json({
      exito: true,
      mensaje: "Mascotas recuperadas correctamente.",
      mascotas: filasMascotas // Aquí viaja el array de objetos [{id_mascota, nombre, raza, edad}, ...]
    });
  });
}

module.exports = { listarMisMascotas };
