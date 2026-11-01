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
    password: contraseña,
  };

  // Preparamos los datos en formato JSON para enviar al backend mediante fetch
  const cuerpo = JSON.stringify(datosLogin);//Toma el objeto con el correo y contraseña y lo convierte en un formato a JSON
  fetch("http://localhost:3000/api/login", {
    method: "POST",
    credentials: "include", //para la sesion
    headers: {
      "Content-Type": "application/json", //Le avisamos al servidor que le enviamos archivo JSON
    },
    body: cuerpo // Los datos ya tratados
  })
    .then((respuesta) => {//llega la respuesta del servidor
      return respuesta.json(); //posterior lo abrimos para leer el contenido
    })
    .then((datosLimpios) => { //ya abierto, recibe lo que retorna respuesta .then, el contenido listo
      if (datosLimpios.exito) { // exito=true: fue exitoso
        //guardamos los datos en el navegador
        localStorage.setItem("nombre", datosLimpios.nombre);
        localStorage.setItem("correo", datosLimpios.correo);
        localStorage.setItem("celular", datosLimpios.celular);
        alert(datosLimpios.mensaje); // mostramos el saludo y
        window.location.href = "perfil_cliente.html";// se envia al perfil
      } else{
        alert(datosLimpios.mensaje || "Error al iniciar sesión");
      }
    });
});
