const { Router } = require("express");
const petController = require("../controllers/petController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const { route } = require("./authRoutes");

const router = Router();

router.get("/", authenticate, authorize("cliente"), petController.list);

router.get(
  "/total",
  authenticate,
  authorize("administrador"),
  petController.getAllPets,
);

router.get("/:id", authenticate, authorize("cliente"), petController.getById);
router.post("/", authenticate, authorize("cliente"), petController.create);
router.put("/:id", authenticate, authorize("cliente"), petController.update);
router.delete("/:id", authenticate, authorize("cliente"), petController.remove);

module.exports = router;
