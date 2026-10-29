const express = require("express");
const router = express.Router();

const clienteController = require(
  "../controllers/cliente.controller.js"
);

router.get("/api/prueba-db", clienteController.probarConexion);
router.post("/api/login", clienteController.iniciarSesion);

module.exports = router;