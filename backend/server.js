// importar express
const express = require("express");

// importar las rutas de la web
const webRoutes = require("./routes/routes.js");

// creamos la app
const app = express(); // ejecutamos express || el servidor

// middleware -> poder leer el formato json
app.use(express.json());

//usar las rutas
app.use(webRoutes);

//encender el servidor
app.listen(3000, ()=>{
    console.log("El servidor está activo en el puerto 3000.");
});