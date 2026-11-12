/*const { Router } = require("express");
const petController = require("../controllers/petController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const uploadMascota = require("../middlewares/mascotapet");
const router = Router();

router.get("/", authenticate, authorize("cliente"), petController.list);

router.get(
  "/total",
  authenticate,
  authorize("administrador"),
  petController.getAllPets,
);
router.post(
  "/",
  authenticate,
  authorize("cliente"),
  uploadMascota.single("foto"),
  petController.create
);

router.get("/:id", authenticate, authorize("cliente"), petController.getById);
router.post("/", authenticate, authorize("cliente"), petController.create);
router.put("/:id", authenticate, authorize("cliente"), petController.update);
router.delete("/:id", authenticate, authorize("cliente"), petController.remove);

module.exports = router;
*/

const { Router } = require("express");

const petController = require("../controllers/petController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const uploadMascota = require("../middlewares/uploadMascotaMiddleware");

const router = Router();

// ==========================================
// LISTAR MASCOTAS DEL CLIENTE
// ==========================================

router.get(
  "/",
  authenticate,
  authorize("cliente"),
  petController.list
);

// ==========================================
// TOTAL DE MASCOTAS (ADMINISTRADOR)
// ==========================================

router.get(
  "/total",
  authenticate,
  authorize("administrador"),
  petController.getAllPets
);

// ==========================================
// REGISTRAR MASCOTA CON FOTOGRAFÍA
// ==========================================

router.post(
  "/",
  authenticate,
  authorize("cliente"),
  uploadMascota.single("foto"),
  petController.create
);

// ==========================================
// CONSULTAR MASCOTA POR ID
// ==========================================

router.get(
  "/:id",
  authenticate,
  authorize("cliente"),
  petController.getById
);

// ==========================================
// ACTUALIZAR MASCOTA
// ==========================================

router.put(
  "/:id",
  authenticate,
  authorize("cliente"),
  petController.update
);

// ==========================================
// DESACTIVAR MASCOTA
// ==========================================

router.delete(
  "/:id",
  authenticate,
  authorize("cliente"),
  petController.remove
);

module.exports = router;
