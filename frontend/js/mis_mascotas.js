// ==========================================
// PET HOUSE - MIS MASCOTAS
// ==========================================

const API_MASCOTAS = "http://localhost:3000/api/pets";
const URL_SERVIDOR = "http://localhost:3000";

// ELEMENTOS HTML
const listaMascotas = document.getElementById("listaMascotas");

const btnAgregarMascota = document.getElementById("btnAgregarMascota");

const modalAgregarMascota = document.getElementById("modalAgregarMascota");

const formAgregarMascota = document.getElementById("formAgregarMascota");

const btnCerrarMascota = document.getElementById("cerrarModalMascota");
const btnCancelarMascota = document.getElementById("cancelarModalMascota");

const inputFotoMascota = document.getElementById("inputFotoMascota");
const previewFotoMascota = document.getElementById("previewFotoMascota");

let archivoFotoMascota = null;
let urlVistaPrevia = null;

// ==========================================
// OBTENER TOKEN
// ==========================================

function obtenerToken() {
  return localStorage.getItem("token");
}

// ==========================================
// ABRIR MODAL
// ==========================================

function abrirModalMascota() {
  formAgregarMascota.reset();

  archivoFotoMascota = null;

  if (urlVistaPrevia) {
    URL.revokeObjectURL(urlVistaPrevia);
    urlVistaPrevia = null;
  }

  previewFotoMascota.src = "../img/index.png";

  modalAgregarMascota.hidden = false;
}

btnAgregarMascota.addEventListener("click", abrirModalMascota);

// ==========================================
// CERRAR MODAL
// ==========================================

function cerrarModalMascota() {
  modalAgregarMascota.hidden = true;
}

btnCerrarMascota.addEventListener("click", cerrarModalMascota);
btnCancelarMascota.addEventListener("click", cerrarModalMascota);

// ==========================================
// VISTA PREVIA DE FOTOGRAFÍA
// ==========================================

inputFotoMascota.addEventListener("change", () => {
  const archivo = inputFotoMascota.files[0];

  if (!archivo) return;

  const formatos = ["image/jpeg", "image/png", "image/webp"];

  if (!formatos.includes(archivo.type)) {
    alert("Selecciona una imagen JPG, PNG o WEBP.");
    inputFotoMascota.value = "";
    archivoFotoMascota = null;
    return;
  }

  if (archivo.size > 5 * 1024 * 1024) {
    alert("La fotografía no debe superar los 5 MB.");
    inputFotoMascota.value = "";
    archivoFotoMascota = null;
    return;
  }

  archivoFotoMascota = archivo;

  if (urlVistaPrevia) {
    URL.revokeObjectURL(urlVistaPrevia);
  }

  urlVistaPrevia = URL.createObjectURL(archivo);

  previewFotoMascota.src = urlVistaPrevia;
});

// ==========================================
// ESCAPAR TEXTO PARA GENERAR HTML SEGURO
// ==========================================

function escaparHTML(valor) {
  return String(valor ?? "").replace(
    /[&<>"']/g,
    (caracter) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[caracter],
  );
}

// ==========================================
// CALCULAR EDAD
// ==========================================

function calcularEdad(fecha) {
  if (!fecha) return "Fecha no registrada";

  const nacimiento = new Date(fecha + "T00:00:00");
  const hoy = new Date();

  if (Number.isNaN(nacimiento.getTime()) || nacimiento > hoy) {
    return "Fecha no válida";
  }

  let anios = hoy.getFullYear() - nacimiento.getFullYear();

  let meses = hoy.getMonth() - nacimiento.getMonth();

  if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
    anios--;
    meses += 12;
  }

  if (anios > 0) {
    return `${anios} ${anios === 1 ? "año" : "años"}`;
  }

  if (meses > 0) {
    return `${meses} ${meses === 1 ? "mes" : "meses"}`;
  }

  return "Menos de un mes";
}

// ==========================================
// GENERAR TARJETA DE MASCOTA
// ==========================================

function crearTarjetaMascota(mascota) {
  const foto = mascota.photoUrl
    ? `${URL_SERVIDOR}${mascota.photoUrl}`
    : "../img/index.png";

  const sexo = mascota.sex || "No registrado";

  const iconoSexo =
    sexo.toLowerCase() === "macho"
      ? "fa-mars"
      : sexo.toLowerCase() === "hembra"
        ? "fa-venus"
        : "fa-paw";

  return `
    <div class="tarjeta-mascota" data-id="${Number(mascota.id)}">

      <div class="mascota-superior">

        <div class="avatar-container-mediano">

          <img
            src="${escaparHTML(foto)}"
            class="avatar-mascota-mediano"
            alt="${escaparHTML(mascota.name)}"
            onerror="this.onerror=null;this.src='../img/index.png';"
          />

          <span class="icono-patita-mediano">
            <i class="fa-solid fa-paw"></i>
          </span>

        </div>

        <div class="info-mascota-detalle">

          <div class="nombre-y-menu">

            <h3>${escaparHTML(mascota.name)}</h3>

            <button type="button" class="btn-tres-puntos">
              ⋮
            </button>

          </div>

          <p class="raza-texto">
            ${escaparHTML(mascota.breed || mascota.species || "Sin raza registrada")}
          </p>

          <div class="caracteristicas-lista">

            <div class="caracteristica-item">
              <span class="icono-carac">
                <i class="fa-solid fa-hourglass-end"></i>
              </span>
              <span>${escaparHTML(calcularEdad(mascota.birthDate))}</span>
            </div>

            <div class="caracteristica-item">
              <span class="icono-carac">
                <i class="fa-solid ${iconoSexo}"></i>
              </span>
              <span>${escaparHTML(sexo)}</span>
            </div>

            <div class="caracteristica-item">
              <span class="icono-carac">
                <i class="fa-solid fa-ruler-vertical"></i>
              </span>
              <span>Tamaño: ${escaparHTML(mascota.size || "No registrado")}</span>
            </div>

            <button
              type="button"
              class="btn-historial"
              data-id="${Number(mascota.id)}"
            >
              Ver historial
            </button>

          </div>

        </div>

      </div>

    </div>
  `;
}

// ==========================================
// CARGAR MASCOTAS DESDE EL BACKEND
// ==========================================

async function cargarMascotas() {
  try {
    const token = obtenerToken();

    if (!token) {
      window.location.href = "login.html";
      return;
    }

    const respuesta = await fetch(API_MASCOTAS, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar las mascotas.");
    }

    const mascotas = await respuesta.json();

    listaMascotas.innerHTML = "";

    if (!mascotas.length) {
      listaMascotas.innerHTML = `
        <div class="sin-mascotas">
          <i class="fa-solid fa-paw"></i>
          <h3>Aún no tienes mascotas registradas</h3>
          <p>Agrega a tu compañero peludo para comenzar.</p>
        </div>
      `;
      return;
    }

    listaMascotas.innerHTML = mascotas.map(crearTarjetaMascota).join("");

    console.log("Mascotas cargadas:", mascotas);
  } catch (error) {
    console.error("Error al cargar mascotas:", error);
    listaMascotas.innerHTML = `
      <p>No fue posible cargar tus mascotas. Intenta nuevamente.</p>
    `;
  }
}

// ==========================================
// REGISTRAR MASCOTA
// ==========================================

formAgregarMascota.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!archivoFotoMascota) {
    alert("Debes seleccionar una fotografía de tu mascota.");
    return;
  }

  const token = obtenerToken();

  if (!token) {
    alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
    window.location.href = "login.html";
    return;
  }

  const botonGuardar = document.getElementById("guardarMascota");

  try {
    botonGuardar.disabled = true;
    botonGuardar.textContent = "Guardando...";

    const datos = new FormData();

    datos.append("foto", archivoFotoMascota);

    datos.append("name", document.getElementById("mascotaNombre").value.trim());
    datos.append("species", document.getElementById("mascotaEspecie").value);
    datos.append("breed", document.getElementById("mascotaRaza").value.trim());
    datos.append("sex", document.getElementById("mascotaSexo").value);
    datos.append("birthDate", document.getElementById("mascotaFecha").value);
    datos.append("size", document.getElementById("mascotaTamano").value);
    datos.append("hairType", document.getElementById("mascotaPelo").value);

    const respuesta = await fetch(API_MASCOTAS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: datos,
    });

    const resultado = await respuesta.json();
    
    console.log("ESTADO DEL SERVIDOR:", respuesta.status);
    console.log("RESPUESTA DEL SERVIDOR:", resultado);

    if (!respuesta.ok) {
      throw new Error(resultado.message || "No se pudo registrar la mascota.");
    }

    alert("¡Mascota registrada correctamente! 🐾");

    cerrarModalMascota();

    await cargarMascotas();
  } catch (error) {
    console.error("Error al registrar mascota:", error);
    alert(error.message);
  } finally {
    botonGuardar.disabled = false;

    botonGuardar.innerHTML = `
      <i class="fa-solid fa-paw"></i>
      Guardar mascota
    `;
  }
});

// ==========================================
// EVENTO DELEGADO: HISTORIAL
// ==========================================

listaMascotas.addEventListener("click", (event) => {
  const boton = event.target.closest(".btn-historial");

  if (!boton) return;

  const mascotaId = boton.dataset.id;

  console.log("Historial de mascota:", mascotaId);

  // Aquí conectaremos la vista del historial.
});

// ==========================================
// INICIAR MÓDULO
// ==========================================

cargarMascotas();
