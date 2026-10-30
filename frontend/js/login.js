//const { json } = require("node:stream/consumers");

console.log("login.js con exito");

// referenciar el html
const formulario = document.getElementById("form-login");
const email = document.getElementById("email");
const input_password = document.getElementById("password");

// lógica
formulario.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("formulario detectado");
    const correo = email.value;
    const contraseña = input_password.value;

    // El objeto con los datos del login
    const datosLogin = {
        email: correo,
        password: contraseña 
    };

    // Preparamos los datos en formato JSON para enviar al backend mediante fetch
    const cuerpo = JSON.stringify(datosLogin);
    fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" //Le avisamos al servidor que le enviamos archivo JSON
        },
        // Los datos ya tratados
        body: cuerpo
    })
    .then(respuesta => {
        if(respuesta.status === 200){
            window.location.href="perfil_cliente.html";
            return respuesta.json({
                mensaje: "Acceso exitoso.."
            });
        }
        return respuesta.json();//limpiamos el paquete de datos
    })
    .then(datosLimpios => {
        if(datosLimpios && datosLimpios.mensaje){
            alert(datosLimpios.mensaje)
        }
    });
});