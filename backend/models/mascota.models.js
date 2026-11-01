const pool = require("../db/conexion.js");

// Consulta directa en el pool.query con sintaxis nativa de PostgreSQL
function obtenerMascotasPorCliente(id_cliente, alTerminar) {
  pool.query(
    "SELECT id_mascota, nombre, raza, edad FROM public.mascota WHERE id_cliente = $1::integer ORDER BY id_mascota ASC;", 
    [id_cliente], 
    (error, respuesta) => {
      // Caso 1: Error nativo de Postgres
      if (error) {
        console.error("Fallo en PostgreSQL (Código " + error.code + "):", error.message);
        alTerminar(error);
        return;
      }
      
      // Caso 2: Éxito en la consulta
      if (respuesta) {
        console.log("Registros obtenidos de Postgres:", respuesta.rowCount);
        alTerminar(null, respuesta.rows);
      }
    }
  );
}

module.exports = { obtenerMascotasPorCliente };