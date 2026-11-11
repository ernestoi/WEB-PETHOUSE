const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Carpeta exclusiva para fotografías de mascotas
const carpetaMascotas = path.resolve(__dirname, "../../uploads/mascotas");

fs.mkdirSync(carpetaMascotas, { recursive: true });

// Almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaMascotas);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomUUID() + extension);
  },
});

// Formatos permitidos
const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP."));
  }
};

// Configuración
const uploadMascota = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = uploadMascota;
