
const API_URL_CITAS = 'http://localhost:3000/api/citas';

// CONFIGURACIÓN

let citasRegistradas = [];
let filtroActual = 'proximas';

// ELEMENTOS HTML
const btn_MisCitas = document.getElementById('btnIrMisCitas');
const listaCitas = document.getElementById('listaCitas');
const sinCitas = document.getElementById('sinCitas');
const mensajeCitas = document.getElementById('mensajeCitas');
const btnActualizarCitas = document.getElementById('btnActualizarCitas');

// FUNCIONES GENERALES

function obtenerTokenCitas() {
    return localStorage.getItem('token');
}

async function consultarCitas(ruta, opciones = {}) {
    const token = obtenerTokenCitas();

    if (!token) {
        throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
    }

    const respuesta = await fetch(`${API_URL_CITAS}${ruta}`, {
        ...opciones,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...opciones.headers
        }
    });

    if (respuesta.status === 204) {
        if (!respuesta.ok) {
            throw new Error('No se pudo completar la operación.');
        }

        return null;
    }

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.message || 'Ocurrió un error.');
    }

    return datos;
}

function escaparCita(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[caracter]);
}

function precioCita(valor) {
    return Number(valor || 0).toLocaleString('es-EC', {
        style: 'currency',
        currency: 'USD'
    });
}

function fechaCitaFormato(valor) {
    return new Date(valor).toLocaleDateString('es-EC', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Guayaquil'
    });
}

function horaCitaFormato(valor) {
    return new Date(valor).toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Guayaquil'
    });
}

function mostrarMensajeCitas(mensaje) {
    mensajeCitas.textContent = mensaje;
    mensajeCitas.hidden = false;
}

function ocultarMensajeCitas() {
    mensajeCitas.textContent = '';
    mensajeCitas.hidden = true;
}

// CLASIFICAR CITAS

function clasificarCita(cita) {
    if (cita.status === 'cancelada') {
        return 'canceladas';
    }

    if (['completada', 'no_asistio'].includes(cita.status)) {
        return 'historial';
    }

    return 'proximas';
}

// ACTUALIZAR CONTADORES

function actualizarContadores() {
    document.getElementById('totalProximas').textContent =
        citasRegistradas.filter(cita =>
            clasificarCita(cita) === 'proximas'
        ).length;

    document.getElementById('totalCompletadas').textContent =
        citasRegistradas.filter(cita =>
            clasificarCita(cita) === 'historial'
        ).length;

    document.getElementById('totalCanceladas').textContent =
        citasRegistradas.filter(cita =>
            clasificarCita(cita) === 'canceladas'
        ).length;
}

// MOSTRAR ESTADO

function nombreEstado(estado) {
    const estados = {
        pendiente: 'Pendiente',
        confirmada: 'Confirmada',
        completada: 'Completada',
        cancelada: 'Cancelada',
        no_asistio: 'No asistió'
    };

    return estados[estado] || estado;
}

// MOSTRAR TARJETAS

function crearTarjetaCita(cita) {
    const estado = escaparCita(cita.status);
    const estadoClase = estado.replace(/[^a-z_]/gi, '');

    const precioPrincipal = Number(cita.servicePrice || 0);
    const adicionales = Number(cita.extrasTotal || 0);
    const total = Number(cita.total ?? precioPrincipal + adicionales);

    const puedeCancelar = ['pendiente', 'confirmada']
        .includes(cita.status);

    return `
        <article class="tarjeta-cita" data-id="${cita.id}">

            <div class="cita-superior">

                <div class="cita-mascota-info">
                    <div class="cita-avatar">
                        <i class="fa-solid fa-dog"></i>
                    </div>

                    <div>
                        <h3>${escaparCita(cita.petName)}</h3>
                        <p>${escaparCita(cita.species || 'Mascota')}</p>
                    </div>
                </div>

                <span class="estado-cita estado-${estadoClase}">
                    ${escaparCita(nombreEstado(cita.status))}
                </span>

            </div>

            <div class="cita-datos">

                <div class="cita-dato">
                    <span>
                        <i class="fa-regular fa-calendar"></i>
                        Fecha
                    </span>
                    <strong>${fechaCitaFormato(cita.startAt)}</strong>
                </div>

                <div class="cita-dato">
                    <span>
                        <i class="fa-regular fa-clock"></i>
                        Horario
                    </span>
                    <strong>
                        ${horaCitaFormato(cita.startAt)}
                        - ${horaCitaFormato(cita.endAt)}
                    </strong>
                </div>

                <div class="cita-dato">
                    <span>
                        <i class="fa-solid fa-scissors"></i>
                        Servicio
                    </span>
                    <strong>${escaparCita(cita.serviceName)}</strong>
                </div>

                <div class="cita-dato">
                    <span>
                        <i class="fa-solid fa-paw"></i>
                        Tamaño
                    </span>
                    <strong>${escaparCita(cita.size || 'No especificado')}</strong>
                </div>

            </div>

            <div class="cita-total">
                <span>Total de la reserva</span>
                <strong>${precioCita(total)}</strong>
            </div>

            <div class="cita-acciones">

                <button
                    type="button"
                    class="btn-detalle-cita"
                    data-detalle="${cita.id}">
                    <i class="fa-regular fa-eye"></i>
                    Ver detalles
                </button>

                ${puedeCancelar ? `
                    <button
                        type="button"
                        class="btn-cancelar-cita"
                        data-cancelar="${cita.id}">
                        <i class="fa-solid fa-ban"></i>
                        Cancelar cita
                    </button>
                ` : ''}

            </div>

        </article>
    `;
}

// FILTRAR CITAS

function mostrarCitas() {
    const citasFiltradas = citasRegistradas.filter(
        cita => clasificarCita(cita) === filtroActual
    );

    listaCitas.innerHTML = '';

    sinCitas.hidden = citasFiltradas.length > 0;

    if (!citasFiltradas.length) {
        const mensajes = {
            proximas: 'No tienes próximas citas.',
            historial: 'Todavía no tienes citas en tu historial.',
            canceladas: 'No tienes citas canceladas.'
        };

        sinCitas.querySelector('p').textContent =
            mensajes[filtroActual];

        return;
    }

    listaCitas.innerHTML = citasFiltradas
        .map(crearTarjetaCita)
        .join('');
}

// CONSULTAR CITAS

async function cargarCitas() {
    btnActualizarCitas.disabled = true;
    ocultarMensajeCitas();

    listaCitas.innerHTML = '<p>Consultando tus citas...</p>';

    try {
        citasRegistradas = await consultarCitas('');

        actualizarContadores();
        mostrarCitas();

    } catch (error) {
        listaCitas.innerHTML = '';
        sinCitas.hidden = true;
        mostrarMensajeCitas(error.message);

    } finally {
        btnActualizarCitas.disabled = false;
    }
}

// CAMBIAR FILTROS

document.querySelectorAll('.filtro-cita').forEach(boton => {
    boton.addEventListener('click', () => {
        document.querySelectorAll('.filtro-cita')
            .forEach(item => item.classList.remove('activo'));

        boton.classList.add('activo');

        filtroActual = boton.dataset.filtro;

        mostrarCitas();
    });
});

// VER DETALLES

listaCitas.addEventListener('click', event => {
    const boton = event.target.closest('[data-detalle]');

    if (!boton) return;

    const cita = citasRegistradas.find(
        item => item.id === Number(boton.dataset.detalle)
    );

    if (!cita) return;

    const total = Number(cita.total || 0);

    alert(
        `DETALLES DE LA CITA\n\n` +
        `Mascota: ${cita.petName}\n` +
        `Servicio: ${cita.serviceName}\n` +
        `Fecha: ${fechaCitaFormato(cita.startAt)}\n` +
        `Hora: ${horaCitaFormato(cita.startAt)}\n` +
        `Estado: ${nombreEstado(cita.status)}\n` +
        `Precio del servicio: ${precioCita(cita.servicePrice)}\n` +
        `Adicionales: ${precioCita(cita.extrasTotal)}\n` +
        `Total: ${precioCita(total)}`
    );
});

// CANCELAR CITA

listaCitas.addEventListener('click', async event => {
    const boton = event.target.closest('[data-cancelar]');

    if (!boton) return;

    const id = Number(boton.dataset.cancelar);

    const confirmar = window.confirm(
        '¿Estás seguro de que deseas cancelar esta cita?'
    );

    if (!confirmar) return;

    boton.disabled = true;

    try {
        await consultarCitas(`/${id}/cancel`, {
            method: 'PATCH'
        });

        alert('La cita se canceló correctamente.');

        await cargarCitas();

    } catch (error) {
        alert(error.message);
        boton.disabled = false;
    }
});

// ACTUALIZAR CITAS

btnActualizarCitas.addEventListener('click', cargarCitas);

// INICIAR MÓDULO

cargarCitas();
