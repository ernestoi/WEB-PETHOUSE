const { Router } = require("express");
const authController = require("../controllers/authController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const router = Router();

// Autenticación del ingreso y registro
router.post("/register", authController.registerClient);
router.post("/login", authController.loginClient);
router.post("/admin/login", authController.loginAdmin);
router.get("/total", authController.AllUserActive);

// Perfil del administrador
// Para administradores autenticados
router.get(
  "/admin/profile",
  authenticate,
  authorize("administrador"),
  authController.getAdminProfile,
);

router.put(
  "/admin/profile",
  authenticate,
  authorize("administrador"),
  authController.updateAdminProfile,
);

module.exports = router;
