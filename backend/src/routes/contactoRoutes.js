
const { Router } = require("express");
const contactoController = require("../controllers/contactoController");

const router = Router();

// Registrar mensaje de contacto
router.post("/", contactoController.create);

module.exports = router;