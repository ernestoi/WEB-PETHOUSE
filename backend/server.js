/*
Los códigos HTTP más comunes:
200 → Todo correcto
201 → Creado correctamente
400 → Error del cliente
404 → No encontrado
500 → Error interno del servidor
*/

const express = require("express");
const cors = require("cors");
const session = require("express-session");// inicio de sesión
const crypto = require("node:crypto");

const webRoutes = require("./routes/routes.js");

const app = express();

app.use(session({
  secret: "pethouse_clave_secreta_2026",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // para desarrollo local
    maxAge: 24 * 60 * 60 * 1000 // 1 día
  }
}));

app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true
}));

app.use(express.json());

app.use(webRoutes);

app.listen(3000, () => {
  console.log("El servidor está activo en el puerto 3000.");
});