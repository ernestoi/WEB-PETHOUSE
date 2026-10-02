const { Pool } = require("pg"); // Trae la herramienta Pool de la librería pg

const pool = new Pool({
  //ESTO crea LA CONFIGURACIÓN DE LA CONEXIÓN A POSTGRESQL, pool será el objeto en el que haremos consultas ejm:
  //pool.query("SELECT * FROM productos");

  user: "postgres",
  host: "localhost",
  database: "db_petshouse",
  password: "admin",
  port: 5432,
});

module.exports = pool; // Este archivo devuelve el objeto pool para que otros archivos puedan usarlo.