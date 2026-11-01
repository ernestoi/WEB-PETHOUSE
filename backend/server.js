require('dotenv').config();

///<<<<<<< HEAD
const express = require("express");
const cors = require("cors");
const session = require("express-session");// inicio de sesión
const crypto = require("node:crypto");

const webRoutes = require("./routes/routes.js");

//const app = express();
/*
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
*/
//=======
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET no está definido o es demasiado corto');
    process.exit(1);
}

const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 3000;

pool.query('SELECT 1')
    .then(() => {
        console.log('Conectado a la base de datos');
        app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
    })
    .catch((error) => {
        console.error('Error al conectar a la base de datos:', error.message);
        process.exit(1);
    });
//>>>>>>> 163b3d60a49a001d4f7ea053b1ad2de0afef9d37
