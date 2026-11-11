const URL_API = "http://localhost:3000/api/auth/admin/profile";

const formulario = document.getElementById("form-perfil");

const inputNombre = document.getElementById("input-nombre");
const inputTelefono = document.getElementById("input-telefono");
const inputCorreo = document.getElementById("input-correo");

const adminNombre = document.getElementById("admin-nombre");
const adminCorreo = document.getElementById("admin-correo");

const btnGuardar = document.getElementById("btn-guardar-perfil");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

let perfilOriginal = null;

// OBTENER TOKEN
function obtenerToken() {
  return localStorage.getItem("token");
}

// CARGAR PERFIL DEL ADMINISTRADOR
async function cargarPerfil() {
  const token = obtenerToken();

  if (!token) {
    alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
    return;
  }

  try {
    const respuesta = await fetch(URL_API, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.message || "No se pudo cargar el perfil.");
    }

    perfilOriginal = datos;

    inputNombre.value = datos.name || "";
    inputTelefono.value = datos.phone || "";
    inputCorreo.value = datos.email || "";

    adminNombre.textContent = datos.name || "Administrador";
    adminCorreo.textContent = datos.email || "";

    console.log("Perfil del administrador:", datos);
  } catch (error) {
    console.error("Error al cargar perfil:", error);
    alert(error.message);
  }
}

// ACTUALIZAR EL PERFIL
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = obtenerToken();

  if (!token) {
    alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
    return;
  }

  const nombre = inputNombre.value.trim();
  const correo = inputCorreo.value.trim();
  const telefono = inputTelefono.value.trim();

  if (!nombre || !correo) {
    alert("El nombre y el correo son obligatorios.");
    return;
  }

  const datos = {
    name: nombre,
    email: correo,
    phone: telefono || null,
  };

  try {
    btnGuardar.disabled = true;

    const respuesta = await fetch(URL_API, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.message || "No se pudo actualizar el perfil.");
      
    }

    const admin = resultado.admin;

    // Actualizar información visible
    perfilOriginal = admin;
    inputNombre.value = admin.name || "";
    inputTelefono.value = admin.phone || "";
    inputCorreo.value = admin.email || "";

    adminNombre.textContent = admin.name;
    adminCorreo.textContent = admin.email;

    // Actualizar nombre almacenado localmente
    localStorage.setItem("nombre", admin.name);

    alert("¡Perfil actualizado correctamente!");

    console.log("Perfil actualizado:", admin);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    alert(error.message);
  } finally {
    btnGuardar.disabled = false;
  }
});

// RESTABLECER FORMULARIO
formulario.addEventListener("reset", (e) => {
  e.preventDefault();

  if (!perfilOriginal) return;

  inputNombre.value = perfilOriginal.name || "";
  inputTelefono.value = perfilOriginal.phone || "";
  inputCorreo.value = perfilOriginal.email || "";
});

// CERRAR SESIÓN
btnCerrarSesion.addEventListener("click", () => {
  const confirmar = confirm("¿Estás seguro de que deseas cerrar sesión?");

  if (!confirmar) return;

  localStorage.removeItem("token");
  localStorage.removeItem("nombre");
  localStorage.removeItem("rol");
  window.location.href = "../cliente/login.html";
});


// INICIALIZAR PÁGINA
document.addEventListener("DOMContentLoaded", () => {
  cargarPerfil();
});
