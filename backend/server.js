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

// importar las rutas de la web
const webRoutes = require("./routes/routes.js");

// creamos la app
const app = express(); // ejecutamos express || el servidor

// middleware -> para poder leer el formato json
app.use(express.json());

//utilizamos las rutas
app.use(webRoutes);

//encendemos el servidor
app.listen(3000, ()=>{
    console.log("El servidor está activo en el puerto 3000.");
});