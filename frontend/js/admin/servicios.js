// ELEMENTOS DEL DOM
const cuerpoServicios = document.getElementById("cuerpo-servicios");
const cuerpoAdicionales = document.getElementById("cuerpo-adicionales");
const URL_API = "http://localhost:3000/api";

// FUNCIÓN PARA PROTEGER EL HTML
function escaparHTML(valor) {
  return String(valor ?? "").replace(
    /[&<>"']/g,
    (caracter) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[caracter],
  );
}

// FORMATO DE PRECIOS
function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(precio));
}

// OBTENER SERVICIOS PRINCIPALES
async function obtenerServiciosPrincipales() {
  try {
    const respuesta = await fetch(`${URL_API}/services`);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const servicios = await respuesta.json();

    console.log("Servicios principales:", servicios);

    mostrarServiciosPrincipales(servicios);
  } catch (error) {
    console.error("Error al obtener servicios principales:", error);

    cuerpoServicios.innerHTML = `
            <tr>
                <td colspan="5">No se pudieron cargar los servicios.</td>
            </tr>
        `;
  }
}

// MOSTRAR SERVICIOS PRINCIPALES
function mostrarServiciosPrincipales(servicios) {
  if (!Array.isArray(servicios) || servicios.length === 0) {
    cuerpoServicios.innerHTML = `
            <tr>
                <td colspan="5">No existen servicios principales registrados.</td>
            </tr>
        `;
    return;
  }

  cuerpoServicios.innerHTML = servicios
    .map(
      (servicio) => `
        <tr data-id="${Number(servicio.id)}" data-tipo="principal">

            <td>${escaparHTML(servicio.name)}</td>

            <td>${escaparHTML(servicio.description || "Sin descripción")}</td>

            <td>—</td>

            <td>
                <span class="etiqueta estado--activo">Activo</span>
            </td>

            <td>
                <button type="button"
                    class="accion accion--editar"
                    data-id="${Number(servicio.id)}"
                    data-tipo="principal"
                    title="Editar servicio">
                    <i class="fas fa-pen"></i>
                </button>

                <button type="button"
                    class="accion accion--eliminar"
                    data-id="${Number(servicio.id)}"
                    data-tipo="principal"
                    title="Eliminar servicio">
                    <i class="fas fa-trash"></i>
                </button>
            </td>

        </tr>
    `,
    )
    .join("");
}

// OBTENER SERVICIOS ADICIONALES
async function obtenerServiciosAdicionales() {
  try {
    const respuesta = await fetch(`${URL_API}/extras`);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const servicios = await respuesta.json();

    console.log("Servicios adicionales:", servicios);

    mostrarServiciosAdicionales(servicios);
  } catch (error) {
    console.error("Error al obtener servicios adicionales:", error);

    cuerpoAdicionales.innerHTML = `
            <tr>
                <td colspan="5">No se pudieron cargar los servicios adicionales.</td>
            </tr>
        `;
  }
}

// MOSTRAR SERVICIOS ADICIONALES
function mostrarServiciosAdicionales(servicios) {
  if (!Array.isArray(servicios) || servicios.length === 0) {
    cuerpoAdicionales.innerHTML = `
            <tr>
                <td colspan="5">No existen servicios adicionales registrados.</td>
            </tr>
        `;
    return;
  }

  cuerpoAdicionales.innerHTML = servicios
    .map(
      (servicio) => `
        <tr data-id="${Number(servicio.id)}" data-tipo="adicional">

            <td>${escaparHTML(servicio.name)}</td>

            <td>${escaparHTML(servicio.description || "Sin descripción")}</td>

            <td>${formatearPrecio(servicio.price)}</td>

            <td>
                <span class="etiqueta estado--activo">Activo</span>
            </td>

            <td>
                <button type="button"
                    class="accion accion--editar"
                    data-id="${Number(servicio.id)}"
                    data-tipo="adicional"
                    title="Editar servicio">
                    <i class="fas fa-pen"></i>
                </button>

                <button type="button"
                    class="accion accion--eliminar"
                    data-id="${Number(servicio.id)}"
                    data-tipo="adicional"
                    title="Eliminar servicio">
                    <i class="fas fa-trash"></i>
                </button>
            </td>

        </tr>
    `,
    )
    .join("");
}

/*
------------------------------------------------------
FORMULARIO PARA EL INGRESO DE SERVICIOS
------------------------------------------------------
*/
// FORMULARIO DE SERVICIOS
const formulario = document.getElementById("form-servicio");
const inputNombre = document.getElementById("servicio-nombre");
const inputDescripcion = document.getElementById("servicio-descripcion");
const inputPrecio = document.getElementById("servicio-precio");
const selectTipo = document.getElementById("servicio-tipo");
const selectEstado = document.getElementById("servicio-estado");

// REGISTRAR SERVICIO
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
    return;
  }

  const tipo = selectTipo.value;
  const esAdicional = tipo === "adicional";

  const nombre = inputNombre.value.trim();
  const descripcion = inputDescripcion.value.trim();
  const precio = inputPrecio.value;

  if (!nombre) {
    alert("Ingresa el nombre del servicio.");
    return;
  }

  if (esAdicional && (!precio || Number(precio) <= 0)) {
    alert("Ingresa un precio válido para el servicio adicional.");
    return;
  }

  const datos = {
    name: nombre,
    description: descripcion || null,
  };

  let endpoint = `${URL_API}/services`;

  if (esAdicional) {
    endpoint = `${URL_API}/extras`;
    datos.price = Number(precio);
  }

  try {
    const respuesta = await fetch(endpoint, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.message || "No se pudo registrar el servicio.");
    }

    alert("¡Servicio registrado correctamente!");

    formulario.reset();

    await Promise.all([
      obtenerServiciosPrincipales(),
      obtenerServiciosAdicionales(),
    ]);
  } catch (error) {
    console.error("Error al registrar servicio:", error);

    alert(error.message);
  }
});

// INICIALIZAR PÁGINA
document.addEventListener("DOMContentLoaded", () => {
  obtenerServiciosPrincipales();
  obtenerServiciosAdicionales();
});
