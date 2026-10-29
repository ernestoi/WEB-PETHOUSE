const clienteModel = require("../models/cliente.models.js");

// Revisar la conexión con la DB
async function probarConexion(req, res) {
  try {
    const datos = await clienteModel.probarConexion();
    console.log("Resultado del modelo: ", datos);
    res.status(200).json({
      mensaje: "Conexión con PostgreSQL correcta",
      base_de_datos: datos.base_de_datos,
    });
  } catch (error) {
    console.error("Error de conexión:", error.message);

    res.status(500).json({
      mensaje: "No se pudo conectar con PostgreSQL",
    });
  }
}

function iniciarSesion(req, res){
  const email = req.body.email;
  clienteModel.buscarCliente(email, (error, cliente) =>{
    if(error){
      return res.status(500).json({
        mensaje: "Ocurrió un error al iniciar sesión."
      });
    }
  });
  console.log(email);
}

module.exports = { probarConexion, iniciarSesion }