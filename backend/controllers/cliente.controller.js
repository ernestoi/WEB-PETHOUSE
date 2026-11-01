const clienteModel = require("../models/cliente.models.js");
const bcrypt = require('bcrypt');
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

function iniciarSesion(req, res) {
  const emailRecibido = req.body.email; //recibe y almacena del frontend el correo

  const passwordRecibido = req.body.password; // recibe y almacena la contraseña del frontend

  console.log("El formulario llegó al controller");

  //Enviamos al modelo el correo recibido para que pueda comprobar en la DB si existe.
  clienteModel.buscarCliente(
    emailRecibido,
    passwordRecibido,
    (error, datosCliente) => { //datosCliente recibe los parámetros de info_cliente del modelo cliente.
      // caso 1: error en la DB
      if (error) {
        return res.status(500).json({
          exito: false,
          mensaje: "Error al buscar al cliente",
        });
      }
      // caso2: No existe datosCleinte o retorna undefined...
      if(datosCliente === undefined || datosCliente === null){
        // Enviamos un mensaje al frontend diciendo que no existe datos en datosCliente.
       return res.json({
          mensaje: "No existe ningún valor en datosCliente."
        });
      }

      // caso3: Si llega acá quiere decir que todo bien, verificaremos que la contraseña que ingresa desde el frontend es la misma que de la base de datos.
      bcrypt.compare(passwordRecibido, datosCliente.contrasena, (error, coinciden) => {
        if(error){
          return res.status(500).json({
            mensaje: "Credenciales incorrectas.."
          });
        }
        if(coinciden === true){ // Contraseña correcta
          const id_cliente = datosCliente.id_cliente;
          //guardamos el inicio de sesión en id_cliente
          req.session.id_cliente = id_cliente;
          console.log("Contraseña correcta, guardando inicio de sesión...")
          console.log({id: datosCliente.id_cliente,
            nombre: datosCliente.nombre,
            correo: datosCliente.email,
            celular: datosCliente.celular})
          return res.status(200).json({
            exito: true,// Enviamos al front para saber que tuvo éxito el envío
            mensaje: "Bienvenido: " + datosCliente.nombre,
            id: datosCliente.id_cliente,
            nombre: datosCliente.nombre,
            correo: datosCliente.email,
            celular: datosCliente.celular
          });
        } else{
          return res.status(401).json({
            exito: false,
            mensaje: "La contraseña es incorrecta"
          });
        }
      });
    },
  );
}

//FUNCION PARA TRAER LA INFORMACIÓN DEL CLIENTE










module.exports = { probarConexion, iniciarSesion };
// fel123@gmail.com cliente 1 - $2b$10$o8v7U0M0Y/x83m2gXU7k9un6D78b9A1C2vW9u3M4N5O6P7Q8R9S2T = clave123
// mire2026@gmail.com cliente 2 -> $2b$10$Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6XyZ01 = holaNodeJS