const { Router } = require("express");

const clientController = require("../controllers/clientController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const uploadCliente = require("../middlewares/uploadMiddleware");

const router = Router();

// Todas las rutas requieren un cliente autenticado
router.use(authenticate, authorize("cliente"));

// Consultar perfil propio
router.get("/profile", clientController.getMyProfile);

// Actualizar perfil propio
router.put("/profile", clientController.updateMyProfile);

// Actualizar fotografía del cliente
router.put(
  "/profile/photo",
  uploadCliente.single("foto"),
  clientController.updateMyPhoto,
);

module.exports = router;
