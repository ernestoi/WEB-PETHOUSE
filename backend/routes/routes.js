// ESTE ARCHIVO SIRVE PARA MANEJAR LAS DIRECCIONES DE NUESTRA API
// CREO RUTAS Y LUEGO EXPORTO LAS RUTAS
const express = require("express");

const router = express.Router(); // almacenar las rutas aquí
router.get("/cliente/", crearCliente);

module.exports = router; // exportar las rutas, para poder usar en otros archivos