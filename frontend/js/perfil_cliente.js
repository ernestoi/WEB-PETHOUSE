// referencia HTML
const user_options = document.querySelectorAll(".user");
const btn_misCitas = document.getElementById("btnIrMisCitas");
const btn_Citas = document.getElementById("btn_MisCitas");
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

// VISTA PARA ver mis CITA
const vista_mis_citas = document.querySelector(".vista_mis-citas");
const btn_mis_citas = document.querySelector(".cont_btn-appointments a");

// VISTA Y BOTONES DE MIS DATOS
const btnMisDatos = document.querySelector(".personal-information a");

// CERRAR SESIÓN
const btnCerrarSesion = document.querySelector(".close_sesion");

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
function activarBoton(opcionSeleccionada) {
  btn_vistaMascotas.classList.remove("active");
  btn_vistaPerfil.classList.remove("active");
  btn_vistaAgendarCita.classList.remove("active");
  btn_mis_citas.classList.remove("active");

  if (opcionSeleccionada) {
    opcionSeleccionada.classList.add("active");
  }
}

// Mostrar la vista de Mis Mascotas
function mostrarVista(nombreVista) {
  vista_perfil.hidden = nombreVista !== "perfil";
  vista_mis_mascotas.hidden = nombreVista !== "mascotas";
  vista_agendar_cita.hidden = nombreVista !== "reservarCita";
  vista_mis_citas.hidden = nombreVista !== "mis_citas";
}

btn_vistaMascotas.addEventListener("click", () => {
  mostrarVista("mascotas");
  activarBoton(btn_vistaMascotas);
});
btn_vistaAgendarCita.addEventListener("click", () => {
  mostrarVista("reservarCita");
  activarBoton(btn_vistaAgendarCita);
});
btn_mis_citas.addEventListener("click", () => {
  mostrarVista("mis_citas");
  activarBoton(btn_mis_citas);
});
// IR A MIS CITAS DESDE LA CONFIRMACIÓN
btn_Citas.addEventListener("click", () => {
  mostrarVista("mis_citas");
  activarBoton(btn_Citas);
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

// ==========================================
// CARGAR PERFIL DEL CLIENTE
// ==========================================

async function cargarPerfil() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const respuesta = await fetch("http://localhost:3000/api/client/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los datos del perfil");
    }

    const cliente = await respuesta.json();

    document.querySelector(".name_user").textContent = cliente.name || "";
    document.querySelector(".email_user").textContent = cliente.email || "";
    document.querySelector(".phone_user").textContent = cliente.phone || "";

    localStorage.setItem("nombre", cliente.name || "");
    localStorage.setItem("correo", cliente.email || "");
    localStorage.setItem("celular", cliente.phone || "");

    // Actualizar fotografía del perfil
    if (cliente.photoUrl) {
      const foto = document.querySelector(".cont-img img");

      if (foto) {
        foto.src = `http://localhost:3000${cliente.photoUrl}`;
      }

      if (previewFotoPerfil) {
        previewFotoPerfil.src = `http://localhost:3000${cliente.photoUrl}`;
      }
    }

    return cliente;
  } catch (error) {
    console.error("Error al cargar perfil:", error);
    throw error;
  }
}

// Cargar perfil al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarPerfil().catch((error) => {
    console.error(error);
  });
});

// ==========================================
// CERRAR SESIÓN
// ==========================================

btnCerrarSesion.addEventListener("click", () => {
  const confirmar = confirm("¿Deseas cerrar sesión?");

  if (!confirmar) return;

  localStorage.removeItem("token");
  localStorage.removeItem("nombre");
  localStorage.removeItem("correo");
  localStorage.removeItem("celular");
  localStorage.removeItem("rol");

  window.location.href = "login.html";
});

// ==========================================
// MODAL MIS DATOS
// ==========================================

const modalMisDatos = document.getElementById("modalMisDatos");
const formMisDatos = document.getElementById("formMisDatos");

function cerrarModalPerfil() {
  modalMisDatos.hidden = true;
}

async function abrirModalPerfil() {
  try {
    const token = localStorage.getItem("token");

    const respuesta = await fetch("http://localhost:3000/api/client/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los datos");
    }

    const cliente = await respuesta.json();

    document.getElementById("perfilNombre").value = cliente.name || "";
    document.getElementById("perfilCorreo").value = cliente.email || "";
    document.getElementById("perfilCelular").value = cliente.phone || "";
    document.getElementById("perfilDireccion").value = cliente.address || "";

    modalMisDatos.hidden = false;
  } catch (error) {
    console.error("Error al abrir Mis Datos:", error);
    alert("No se pudo cargar tu información.");
  }
}

if (btnMisDatos) {
  btnMisDatos.addEventListener("click", (event) => {
    event.preventDefault();
    abrirModalPerfil();
  });
}

document
  .getElementById("cerrarModalPerfil")
  .addEventListener("click", cerrarModalPerfil);

document
  .getElementById("cancelarModalPerfil")
  .addEventListener("click", cerrarModalPerfil);

// Guardar cambios

// ==========================================
// GUARDAR DATOS Y FOTOGRAFÍA DEL CLIENTE
// ==========================================

formMisDatos.addEventListener("submit", async (event) => {
  event.preventDefault();
  console.log("SE EJECUTÓ EL EVENTO SUBMIT");
  console.log("FOTO ANTES DE ENVIAR:", archivoFotoSeleccionado);
  try {
    const token = localStorage.getItem("token");

    const datos = {
      name: document.getElementById("perfilNombre").value.trim(),
      email: document.getElementById("perfilCorreo").value.trim(),
      phone: document.getElementById("perfilCelular").value.trim(),
      address: document.getElementById("perfilDireccion").value.trim(),
    };

    // 1. Actualizar información personal
    const respuesta = await fetch("http://localhost:3000/api/client/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.message || "Error al actualizar los datos");
    }

    // 2. Subir fotografía si se seleccionó una nueva
    console.log("FOTO ANTES DE ENVIAR:", archivoFotoSeleccionado);
    if (archivoFotoSeleccionado) {
      const formularioFoto = new FormData();

      formularioFoto.append("foto", archivoFotoSeleccionado);

      const respuestaFoto = await fetch(
        "http://localhost:3000/api/client/profile/photo",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formularioFoto,
        },
      );

      const resultadoFoto = await respuestaFoto.json();

      if (!respuestaFoto.ok) {
        throw new Error(
          resultadoFoto.message || "No se pudo actualizar la fotografía",
        );
      }
    }

    // 3. Actualizar información visual
    archivoFotoSeleccionado = null;
    inputFotoPerfil.value = "";

    await cargarPerfil();

    alert("¡Tus datos y fotografía se actualizaron correctamente!");

    cerrarModalPerfil();
  } catch (error) {
    console.error("Error al guardar perfil:", error);
    alert(error.message);
  }
});

// ==========================================
// VISTA PREVIA DE FOTOGRAFÍA
// ==========================================

const inputFotoPerfil = document.getElementById("inputFotoPerfil");
const previewFotoPerfil = document.getElementById("previewFotoPerfil");

let archivoFotoSeleccionado = null;

inputFotoPerfil.addEventListener("change", () => {
  const archivo = inputFotoPerfil.files[0];

  if (!archivo) return;

  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

  if (!tiposPermitidos.includes(archivo.type)) {
    alert("Selecciona una imagen JPG, PNG o WEBP.");
    inputFotoPerfil.value = "";
    return;
  }

  if (archivo.size > 2 * 1024 * 1024) {
    alert("La fotografía no debe superar los 2 MB.");
    inputFotoPerfil.value = "";
    return;
  }

  archivoFotoSeleccionado = archivo;
  console.log("FOTO SELECCIONADA:", archivoFotoSeleccionado);

  previewFotoPerfil.src = URL.createObjectURL(archivo);
});
