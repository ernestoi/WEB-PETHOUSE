// ==========================================
// PET HOUSE - MIDDLEWARE DE IMÁGENES
// ==========================================

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Carpeta de almacenamiento
const carpetaClientes = path.join(__dirname, "../../uploads/clientes");

// Crear carpeta automáticamente si no existe
if (!fs.existsSync(carpetaClientes)) {
  fs.mkdirSync(carpetaClientes, { recursive: true });
}

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaClientes);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const nombreUnico = crypto.randomUUID() + extension;

    cb(null, nombreUnico);
  },
});

// Tipos de imágenes permitidos
const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

// Filtrar archivos
const fileFilter = (req, file, cb) => {
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato no permitido. Utiliza JPG, PNG o WEBP."));
  }
};

// Configuración final de Multer
const uploadCliente = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});



module.exports = uploadCliente;
