const pool = require("../db/conexion.js");

async function probarConexion() {
  const resultado = await pool.query(
    "SELECT CURRENT_DATABASE() AS base_de_datos"
  );

  return resultado.rows[0];
}

function buscarCliente(email, alTerminar){
  pool.query("SELECT * FROM cliente WHERE email=$1",[email], (error, respuesta) =>{
    if (error){
      console.log("Fallo la consulta.");
      alTerminar(error);
      return;
    }
    if(respuesta){
      console.log("La consulta se realizó con éxito");
      const cliente = respuesta.rows[0];
      //console.log("Cantidad de clientes encontrados:", respuesta.rows.length);
      console.log("Se econtró algún cliente?",cliente !== undefined);
      alTerminar(null, cliente);
    }
  })
}

module.exports = { probarConexion, buscarCliente };