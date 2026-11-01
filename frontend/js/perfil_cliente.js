// referencia HTML
const user_options = document.querySelectorAll(".user");

// VISTA DEL PERFIL
const vista_perfil = document.querySelector(".vista_perfil-cliente");
const btn_vistaPerfil = document.querySelector(".cont_btn-profile a");
console.log(user_options);

// VISTA DE MIS MASCOTAS
const vista_mis_mascotas = document.querySelector(".vista_mis-mascotas");
const btn_vistaMascotas = document.querySelector(".btn_ver-mascotas");

// VISTA PARA AGENDAR CITA
const vista_agendar_cita = document.querySelector(".vista_agendar_cita");
const btn_vistaAgendarCita = document.querySelector(".cont_btn-reserve a");

// Opciones del menú ..!!
const btns_menu = document.querySelectorAll(".content-menu .btn");
console.log(btns_menu);

/*
// Manejamos el color de los botones al hacer click
user_options.forEach((option, indice) =>{
    option.addEventListener("click", ()=>{
        user_options.forEach((tarjeta) => {
            tarjeta.classList.remove("active");
        })
        option.classList.add("active");
        console.log("presioando exitosamente..");
    })
});
*/

// MOSTRAR BOTON SELECCIONADO
function activarBoton(opcion_selecionada) {
  btn_vistaMascotas.classList.remove("active");
  btn_vistaPerfil.classList.remove("active");
  btn_vistaAgendarCita.classList.remove("active");
  opcion_selecionada.classList.add("active");
}

// Mostrar la vista de Mis Mascotas
function mostrarVista(nombreVista) {
  vista_perfil.hidden = nombreVista !== "perfil";
  vista_mis_mascotas.hidden = nombreVista !== "mascotas";
  vista_agendar_cita.hidden = nombreVista !== "reservarCita";
}

btn_vistaMascotas.addEventListener("click", () => {
  mostrarVista("mascotas");
  activarBoton(btn_vistaMascotas);
});
btn_vistaAgendarCita.addEventListener("click", () => {
  mostrarVista("reservarCita");
  activarBoton(btn_vistaAgendarCita);
});

// Mostrar la vista del perfil
btn_vistaPerfil.addEventListener("click", (event) => {
  event.preventDefault();
  mostrarVista("perfil");
  activarBoton(btn_vistaPerfil);
});

// MANTENER PRECIONADO BOTON DEL MENÚ
btns_menu.forEach((btn) => {
  btn.addEventListener("click", () => {
    btns_menu.forEach((otrobtn) => {
      otrobtn.classList.remove("active");
    });
    btn.classList.add("active");
    console.log(btn.className);
  });
});

// ESPERAMOS a que la página termine de cargar TODO antes de hacer algo
document.addEventListener("DOMContentLoaded", () => {
//LEEMOS los datos que guardamos desde el inicio de sesión
  const nombre = localStorage.getItem("nombre");
  const correo = localStorage.getItem("correo");
  const celular = localStorage.getItem("celular");
  // si no hay nombre = nadie inició sesión
  if (!nombre) {
    // si nombre no existe, redirecciono al login y corto ejecucion del código
    window.location.href = "login.html";
    return;
  }
  // mostramos los datos dinámicamente al frontend al HTML
  document.querySelector(".name_user").textContent = nombre;
  document.querySelector(".email_user").textContent = correo;
  document.querySelector(".phone_user").textContent = celular;
});
