const express = require("express");
const router = express.Router();

const clienteController = require(
  "../controllers/cliente.controller.js"
);
const mascotaController = require("../controllers/mascota_controller.js");


router.get("/api/prueba-db", clienteController.probarConexion);
router.post("/api/login", clienteController.iniciarSesion);
router.get("/api/mis-mascotas", mascotaController.listarMisMascotas);

router.get("/api/sesion", (req, res) => {
  res.json({
    id_cliente: req.session.id_cliente ?? null
  });
});
module.exports = router;