// ========================================
// PASOS DE LA RESERVA
// ========================================

const paso_1 = document.getElementById("reservaMascota");
const paso_2 = document.getElementById("reservaServicios");
const paso_3 = document.getElementById("reservaHorario");
const paso_4 = document.getElementById("reservaRevision");
const paso_5 = document.getElementById("reservaResultado");

const siguienteMascota =
  document.getElementById("btnMascotaSiguiente");

const siguienteServicio =
  document.getElementById("btnServiciosSiguiente");

const opcionesMascota = document.querySelectorAll(
  'input[name="mascotaReserva"]'
);

const opcionesServicio = document.querySelectorAll(
  'input[name="servicioReserva"]'
);

let idMascotaSeleccionada = null;
let idServicioSeleccionado = null;

// ========================================
// OCULTAR PASOS Y MOSTRAR EL ELEGIDO
// ========================================

function mostrarPasos(paso) {
  paso_1.hidden = true;
  paso_2.hidden = true;
  paso_3.hidden = true;
  paso_4.hidden = true;
  paso_5.hidden = true;

  paso.hidden = false;

  // Actualizar los números de arriba.
  const pasos = [paso_1, paso_2, paso_3, paso_4];

  const indicadores = document.querySelectorAll(
    ".vista_agendar_cita .paso"
  );

  const posicionActual = pasos.indexOf(paso);

  indicadores.forEach((indicador, posicion) => {
    indicador.classList.remove("activo", "completo");
    indicador.removeAttribute("aria-current");

    if (posicion < posicionActual) {
      indicador.classList.add("completo");
    }

    if (posicion === posicionActual) {
      indicador.classList.add("activo");
      indicador.setAttribute("aria-current", "step");
    }
  });
}

// ========================================
// SELECCIONAR MASCOTA
// ========================================

siguienteMascota.disabled = true;

opcionesMascota.forEach((opcion) => {
  opcion.addEventListener("change", () => {
    idMascotaSeleccionada = opcion.value;

    // Habilitar Siguiente.
    siguienteMascota.disabled = false;

    // Mostrar el nombre en el paso Servicios.
    const tarjeta = opcion.closest(".opcion-mascota");
    const nombre = tarjeta.querySelector("strong").textContent;

    document.getElementById("nombreMascotaElegida").textContent =
      nombre;

    console.log("Mascota seleccionada:", idMascotaSeleccionada);
  });
});

// ========================================
// SELECCIONAR SERVICIO
// ========================================

siguienteServicio.disabled = true;

opcionesServicio.forEach((opcion) => {
  opcion.addEventListener("change", () => {
    idServicioSeleccionado = opcion.value;

    // Habilitar Siguiente y mostrar los adicionales.
    siguienteServicio.disabled = false;

    document.getElementById("bloqueAdicionales").hidden = false;

    console.log("Servicio seleccionado:", idServicioSeleccionado);
  });
});

// ========================================
// DESTINOS DE SIGUIENTE Y ANTERIOR
// ========================================

// Se asignan aquí para que no tengas que editar cada botón.
siguienteMascota.dataset.destino = "reservaServicios";

document.getElementById("btnServiciosAnterior").dataset.destino =
  "reservaMascota";

siguienteServicio.dataset.destino = "reservaHorario";

document.getElementById("btnHorarioAnterior").dataset.destino =
  "reservaServicios";

document.getElementById("btnHorarioSiguiente").dataset.destino =
  "reservaRevision";

document.getElementById("btnRevisionAnterior").dataset.destino =
  "reservaHorario";

// ========================================
// ESCUCHAR LOS BOTONES DE NAVEGACIÓN
// ========================================

const btn_pasos = document.querySelectorAll(
  ".acciones-paso button[data-destino]"
);

btn_pasos.forEach((boton) => {
  // Confirmar cita tendrá su propia lógica de guardado.
  if (boton.id === "btnConfirmarCita") {
    return;
  }

  boton.addEventListener("click", () => {
    if (
      boton.id === "btnMascotaSiguiente" &&
      idMascotaSeleccionada === null
    ) {
      alert("Selecciona una mascota para continuar.");
      return;
    }

    if (
      boton.id === "btnServiciosSiguiente" &&
      idServicioSeleccionado === null
    ) {
      alert("Selecciona un servicio para continuar.");
      return;
    }

    const contenedorHTML = document.getElementById(
      boton.dataset.destino
    );

    if (contenedorHTML) {
      mostrarPasos(contenedorHTML);
    }
  });
});
