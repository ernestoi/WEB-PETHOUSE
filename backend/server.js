/*
Los códigos HTTP más comunes:
200 → Todo correcto
201 → Creado correctamente
400 → Error del cliente
404 → No encontrado
500 → Error interno del servidor
*/

// importar express
const express = require("express");
//
const cors = require("cors");

// importar las rutas de la web
const webRoutes = require("./routes/routes.js");

// creamos la app
const app = express(); // ejecutamos express || el servidor

// Esto permite que la página de Live Server lea las respuestas del backend hasta mientras.
app.use(cors({
    origin: "http://127.0.0.1:5500"
}));

// middleware -> para poder leer el formato json
app.use(express.json());

//utilizamos las rutas
app.use(webRoutes);

//encendemos el servidor
app.listen(3000, ()=>{
    console.log("El servidor está activo en el puerto 3000.");
});