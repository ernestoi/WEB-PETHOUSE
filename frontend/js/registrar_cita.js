const API_URL = "http://localhost:3000/api";

// CONFIGURACIÓN

const DURACION_CITA = 90;

const HORARIOS = ["09:00", "10:30", "12:00", "13:30", "15:00"];

// ELEMENTOS HTML

const paso_1 = document.getElementById("reservaMascota");
const paso_2 = document.getElementById("reservaServicios");
const paso_3 = document.getElementById("reservaHorario");
const paso_4 = document.getElementById("reservaRevision");
const paso_5 = document.getElementById("reservaResultado");

const siguienteMascota = document.getElementById("btnMascotaSiguiente");
const siguienteServicio = document.getElementById("btnServiciosSiguiente");
const siguienteHorario = document.getElementById("btnHorarioSiguiente");
const confirmarCita = document.getElementById("btnConfirmarCita");

const contenedorMascotas = document.querySelector(".seleccion-mascotas");
const contenedorServicios = document.getElementById("serviciosDisponibles");
const contenedorAdicionales = document.getElementById("serviciosAdicionales");
const contenedorHorarios = document.getElementById("horariosDisponibles");

const fechaCita = document.getElementById("fechaCita");

// DATOS DE LA RESERVA

let mascotas = [];
let variantes = [];
let adicionales = [];

let mascotaSeleccionada = null;
let servicioSeleccionado = null;
let adicionalesSeleccionados = [];
let horarioSeleccionado = null;

// FUNCIONES GENERALES

function obtenerToken() {
  return localStorage.getItem("token");
}

async function consultarAPI(ruta, opciones = {}) {
  const token = obtenerToken();

  if (!token) {
    throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...opciones.headers,
    },
  });

  const datos = respuesta.status === 204 ? null : await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos?.message || "No se pudo completar la operación.");
  }

  return datos;
}

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function formatoPrecio(valor) {
  return Number(valor).toLocaleString("es-EC", {
    style: "currency",
    currency: "USD",
  });
}

function escapar(valor) {
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

function mostrarError(mensaje) {
  const elemento = document.getElementById("errorReserva");
  elemento.textContent = mensaje;
  elemento.hidden = false;
}

function ocultarError() {
  const elemento = document.getElementById("errorReserva");
  elemento.textContent = "";
  elemento.hidden = true;
}

// NAVEGACIÓN

function mostrarPasos(paso) {
  [paso_1, paso_2, paso_3, paso_4, paso_5].forEach(
    (elemento) => (elemento.hidden = true),
  );

  paso.hidden = false;

  const pasos = [paso_1, paso_2, paso_3, paso_4];
  const posicion = pasos.indexOf(paso);

  document
    .querySelectorAll(".vista_agendar_cita .paso")
    .forEach((indicador, index) => {
      indicador.classList.remove("activo", "completo");
      indicador.removeAttribute("aria-current");

      if (index < posicion) {
        indicador.classList.add("completo");
      }

      if (index === posicion) {
        indicador.classList.add("activo");
        indicador.setAttribute("aria-current", "step");
      }
    });
}

document
  .getElementById("btnServiciosAnterior")
  .addEventListener("click", () => mostrarPasos(paso_1));

document
  .getElementById("btnHorarioAnterior")
  .addEventListener("click", () => mostrarPasos(paso_2));

document
  .getElementById("btnRevisionAnterior")
  .addEventListener("click", () => mostrarPasos(paso_3));

// CARGAR MASCOTAS

async function cargarMascotas() {
  try {
    mascotas = await consultarAPI("/pets");

    contenedorMascotas.innerHTML = "<legend>Mis mascotas</legend>";

    if (!mascotas.length) {
      document.getElementById("reservaSinMascotas").hidden = false;
      siguienteMascota.disabled = true;
      return;
    }

    document.getElementById("reservaSinMascotas").hidden = true;

    contenedorMascotas.innerHTML += mascotas
      .map(
        (mascota) => `
            <label class="opcion-mascota">
                <input
                    type="radio"
                    name="mascotaReserva"
                    value="${mascota.id}"
                >

                <img
                    src="${escapar(mascota.photoUrl || "../img/index.png")}"
                    alt=""
                    class="foto-mascota-reserva"
                >

                <span class="datos-mascota-reserva">
                    <strong>${escapar(mascota.name)}</strong>
                    <span>
                        ${escapar(mascota.size)} ·
                        Pelo ${escapar(mascota.hairType)}
                    </span>
                    <span>${escapar(mascota.breed || "Sin raza registrada")}</span>
                </span>
            </label>
        `,
      )
      .join("");

    contenedorMascotas.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", () => {
        mascotaSeleccionada = mascotas.find(
          (mascota) => mascota.id === Number(input.value),
        );

        siguienteMascota.disabled = false;

        document.getElementById("nombreMascotaElegida").textContent =
          mascotaSeleccionada.name;
      });
    });
  } catch (error) {
    alert(error.message);
  }
}

// CARGAR SERVICIOS PRINCIPALES

async function cargarServicios() {
  try {
    variantes = await consultarAPI("/variants");

    const compatibles = variantes.filter((variante) => {
      const mismaEspecie =
        normalizar(variante.species) ===
        normalizar(mascotaSeleccionada.species);

      const mismoTamano =
        normalizar(variante.size) === normalizar(mascotaSeleccionada.size);

      const mismoPelo =
        !variante.hairType ||
        normalizar(variante.hairType) ===
          normalizar(mascotaSeleccionada.hairType);

      const esCorteModelo = normalizar(variante.serviceName).includes(
        "corte modelo",
      );

      return (
        mismaEspecie &&
        mismoTamano &&
        mismoPelo &&
        (!esCorteModelo || normalizar(mascotaSeleccionada.hairType) === "largo")
      );
    });

    contenedorServicios.innerHTML = "<legend>Servicio principal</legend>";

    if (!compatibles.length) {
      contenedorServicios.innerHTML +=
        '<p class="aviso">No hay servicios disponibles para las características de esta mascota.</p>';

      siguienteServicio.disabled = true;
      return;
    }

    contenedorServicios.innerHTML += compatibles
      .map(
        (variante) => `
            <label class="opcion-servicio">
                <input
                    type="radio"
                    name="servicioReserva"
                    value="${variante.id}"
                >

                <i class="fa-solid fa-paw" aria-hidden="true"></i>

                <span class="datos-servicio">
                    <strong>${escapar(variante.serviceName)}</strong>
                    <span>
                        ${escapar(variante.size)} ·
                        ${escapar(variante.hairType || "Cualquier tipo de pelo")}
                    </span>
                </span>

                <strong class="precio-servicio">
                    ${formatoPrecio(variante.price)}
                </strong>
            </label>
        `,
      )
      .join("");

    contenedorServicios.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", () => {
        servicioSeleccionado = compatibles.find(
          (variante) => variante.id === Number(input.value),
        );

        adicionalesSeleccionados = [];
        document.getElementById("bloqueAdicionales").hidden = false;

        siguienteServicio.disabled = false;

        cargarAdicionales();
        actualizarTotal();
      });
    });
  } catch (error) {
    alert(error.message);
  }
}

// CARGAR SERVICIOS ADICIONALES

async function cargarAdicionales() {
  try {
    adicionales = await consultarAPI("/extras");

    contenedorAdicionales.innerHTML = "<legend>Adicionales opcionales</legend>";

    contenedorAdicionales.innerHTML += adicionales
      .map(
        (extra) => `
            <label class="opcion-adicional">
                <input
                    type="checkbox"
                    name="adicionalReserva"
                    value="${extra.id}"
                >

                <span>${escapar(extra.name)}</span>

                <span class="precio-adicional">
                    ${formatoPrecio(extra.price)}
                </span>
            </label>
        `,
      )
      .join("");

    contenedorAdicionales.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", () => {
        const id = Number(input.value);

        if (input.checked) {
          adicionalesSeleccionados.push(id);
        } else {
          adicionalesSeleccionados = adicionalesSeleccionados.filter(
            (item) => item !== id,
          );
        }

        actualizarTotal();
      });
    });
  } catch (error) {
    alert(error.message);
  }
}

// ACTUALIZAR TOTAL

function calcularTotal() {
  const precioPrincipal = Number(servicioSeleccionado?.price || 0);

  const precioAdicionales = adicionales
    .filter((extra) => adicionalesSeleccionados.includes(extra.id))
    .reduce((total, extra) => total + Number(extra.price), 0);

  return precioPrincipal + precioAdicionales;
}

function actualizarTotal() {
  document.getElementById("totalServicios").textContent =
    formatoPrecio(calcularTotal());
}

// CONSULTAR HORARIOS

async function cargarHorarios() {
  contenedorHorarios.innerHTML = "";
  siguienteHorario.disabled = true;
  horarioSeleccionado = null;

  const mensaje = document.getElementById("mensajeHorarios");

  if (!fechaCita.value) {
    mensaje.textContent = "Primero selecciona una fecha.";
    return;
  }

  mensaje.textContent = "Consultando disponibilidad...";

  try {
    const resultado = await consultarAPI(
      `/citas/availability?date=${fechaCita.value}`,
    );

    resultado.slots.forEach((slot) => {
      const boton = document.createElement("button");

      boton.type = "button";
      boton.textContent = slot.time;
      boton.disabled = !slot.available;
      boton.className = "horario";

      if (!slot.available) {
        boton.classList.add("ocupado");
        boton.title = "Horario no disponible";
      }

      boton.addEventListener("click", () => {
        contenedorHorarios
          .querySelectorAll("button")
          .forEach((item) => item.classList.remove("seleccionado"));

        boton.classList.add("seleccionado");

        horarioSeleccionado = slot;

        siguienteHorario.disabled = false;
      });

      contenedorHorarios.appendChild(boton);
    });

    mensaje.textContent = resultado.slots.some((slot) => slot.available)
      ? "Selecciona uno de los horarios disponibles."
      : "No hay horarios disponibles para esta fecha.";
  } catch (error) {
    mensaje.textContent = error.message;
  }
}

fechaCita.addEventListener("change", cargarHorarios);

// FECHA MÍNIMA

function obtenerFechaLocal() {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

fechaCita.min = obtenerFechaLocal();

// MOSTRAR RESUMEN

function prepararResumen() {
  const extrasElegidos = adicionales.filter((extra) =>
    adicionalesSeleccionados.includes(extra.id),
  );

  document.getElementById("revisionMascota").textContent =
    mascotaSeleccionada.name;

  document.getElementById("revisionServicio").textContent =
    servicioSeleccionado.serviceName;

  document.getElementById("revisionPrecioServicio").textContent = formatoPrecio(
    servicioSeleccionado.price,
  );

  document.getElementById("revisionFecha").textContent = fechaCita.value;

  document.getElementById("revisionHora").textContent =
    horarioSeleccionado.time;

  document.getElementById("revisionAdicionales").innerHTML =
    extrasElegidos.length
      ? extrasElegidos
          .map(
            (extra) =>
              `<li>${escapar(extra.name)} — ${formatoPrecio(extra.price)}</li>`,
          )
          .join("")
      : "<li>Sin adicionales</li>";

  document.getElementById("revisionTotal").textContent =
    formatoPrecio(calcularTotal());

  ocultarError();
}

// NAVEGACIÓN ENTRE PASOS

siguienteMascota.addEventListener("click", async () => {
  if (!mascotaSeleccionada) return;

  siguienteServicio.disabled = true;
  document.getElementById("bloqueAdicionales").hidden = true;

  idServicioSeleccionado = null;
  servicioSeleccionado = null;

  await cargarServicios();

  mostrarPasos(paso_2);
});

siguienteServicio.addEventListener("click", async () => {
  if (!servicioSeleccionado) return;

  mostrarPasos(paso_3);
  await cargarHorarios();
});

siguienteHorario.addEventListener("click", () => {
  if (!horarioSeleccionado) return;

  prepararResumen();
  mostrarPasos(paso_4);
});

// CONFIRMAR RESERVA

confirmarCita.addEventListener("click", async () => {
  if (!mascotaSeleccionada || !servicioSeleccionado || !horarioSeleccionado) {
    mostrarError("Completa todos los datos de la reserva.");
    return;
  }

  confirmarCita.disabled = true;
  confirmarCita.textContent = "Registrando cita...";

  ocultarError();

  try {
    const reserva = await consultarAPI("/citas", {
      method: "POST",
      body: JSON.stringify({
        petId: mascotaSeleccionada.id,
        variantId: servicioSeleccionado.id,
        startAt: horarioSeleccionado.startAt,
        extraIds: adicionalesSeleccionados,
        notes: null,
      }),
    });

    const extrasElegidos = adicionales.filter((extra) =>
      adicionalesSeleccionados.includes(extra.id),
    );

    document.getElementById("confirmacionMascota").textContent =
      mascotaSeleccionada.name;

    document.getElementById("confirmacionServicio").textContent =
      servicioSeleccionado.serviceName;

    document.getElementById("confirmacionPrecioServicio").textContent =
      formatoPrecio(servicioSeleccionado.price);

    document.getElementById("confirmacionFecha").textContent = fechaCita.value;

    document.getElementById("confirmacionHora").textContent =
      horarioSeleccionado.time;

    document.getElementById("confirmacionAdicionales").innerHTML =
      extrasElegidos.length
        ? extrasElegidos
            .map(
              (extra) =>
                `<li>${escapar(extra.name)} — ${formatoPrecio(extra.price)}</li>`,
            )
            .join("")
        : "<li>Sin adicionales</li>";

    document.getElementById("confirmacionTotal").textContent =
      formatoPrecio(calcularTotal());

    mostrarPasos(paso_5);
  } catch (error) {
    mostrarError(error.message);

    if (error.message.toLowerCase().includes("horario")) {
      await cargarHorarios();
    }
  } finally {
    confirmarCita.disabled = false;
    confirmarCita.textContent = "Confirmar cita";
  }
});

// INICIAR RESERVA
async function iniciarReserva() {
  siguienteMascota.disabled = true;
  siguienteServicio.disabled = true;
  siguienteHorario.disabled = true;

  const fechaInicial = obtenerFechaLocal();
  fechaCita.value = fechaInicial;

  await cargarMascotas();
}

// CONFIRMACIÓN POR WHATSAPP

const btnWhatsApp = document.getElementById("btnWhatsAppConfirmacion");

const WHATSAPP_PETHOUSE = "593XXXXXXXXX";

btnWhatsApp.addEventListener("click", () => {
  const mensaje = `
Hola, PETHOUSE.

He registrado una solicitud de cita.

DATOS DE LA RESERVA

Mascota: ${mascotaSeleccionada.name}
Servicio: ${servicioSeleccionado.serviceName}
Fecha: ${fechaCita.value}
Hora: ${horarioSeleccionado.time}

Servicios adicionales:
${
  adicionales
    .filter((extra) => adicionalesSeleccionados.includes(extra.id))
    .map((extra) => `- ${extra.name}: ${formatoPrecio(extra.price)}`)
    .join("\n") || "Sin adicionales"
}

Total: ${formatoPrecio(calcularTotal())}

Quedo pendiente de la confirmación.
    `;

  const url = `https://wa.me/${WHATSAPP_PETHOUSE}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank");
});

iniciarReserva();
