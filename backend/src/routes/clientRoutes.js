const { Router } = require("express");
const clientController = require("../controllers/clientController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const router = Router();

// Todas las rutas requieren administrador autenticado
router.use(authenticate, authorize("administrador"));

router.get("/", clientController.list);
router.get("/:id", clientController.getById);
router.put("/:id", clientController.update);
router.get("/:id/pets", clientController.listPets);
router.delete("/:id/pets/:petId", clientController.deactivatePet);

module.exports = router;
