const pool = require("../db/conexion.js");

async function probarConexion() {
  const resultado = await pool.query(
    "SELECT CURRENT_DATABASE() AS base_de_datos"
  );

  return resultado.rows[0];
}

function buscarCliente(email, contraseña, alTerminar){
  pool.query("SELECT * FROM cliente WHERE email=$1",[email], (error, respuesta) =>{
    if (error){
      console.log("Fallo la consulta.");
      alTerminar(error);
      return;
    }
    if(respuesta){
      console.log("La consulta se realizó con éxito");
      // Guardamos todos los datos en clienteEncontrado
      const clienteEncontrado = respuesta.rows[0];
      
      console.log("Se econtró algún cliente?",clienteEncontrado !== undefined);
      //devolvemos el objeto limpio sin la contraseña
      alTerminar(null, clienteEncontrado);
    }
  });
}

module.exports = { probarConexion, buscarCliente };