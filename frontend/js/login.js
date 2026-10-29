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
    }
    // Preparamos los datos en formato JSON para enviar al backend mediante fetch
    const cuerpo = JSON.stringify(datosLogin);
    console.log(cuerpo);
})