
// =========================================
// REFERENCIAS DEL MODAL
// =========================================

const modal = document.getElementById("modalServicio");

const botonesDetalles = document.querySelectorAll(".btn-details");

const modalImagen = document.getElementById("modalImagen");
const modalTitulo = document.getElementById("modalTitulo");
const modalCategoria = document.getElementById("modalCategoria");
const modalDescripcion = document.getElementById("modalDescripcion");

const botonesCerrar = document.querySelectorAll("[data-cerrar-modal]");

const botonReservar = modal.querySelector(".btn-reservar-modal");

let ultimoElementoActivo = null;


// =========================================
// ABRIR MODAL
// =========================================

function abrirModal(boton) {

    const tarjeta = boton.closest(".tarjeta-servicio");

    if (!tarjeta) return;

    // Obtener información de la tarjeta
    const imagen = tarjeta.querySelector(".img_container img");
    const titulo = tarjeta.querySelector(".info-servicio h2");
    const categoria = tarjeta.querySelector(".servicio-categoria");

    const descripcion =
        tarjeta.dataset.detalle ||
        tarjeta.querySelector(".info-servicio p").textContent;

    // Guardar elemento que abrió la ventana
    ultimoElementoActivo = boton;

    // Cargar información dinámica
    modalImagen.src = imagen.src;
    modalImagen.alt = imagen.alt;

    modalTitulo.textContent = titulo.textContent.trim();

    modalCategoria.textContent = categoria.textContent.trim();

    modalDescripcion.textContent = descripcion;

    // Dirigir al login para reservar
    botonReservar.href = "login.html";

    // Mostrar modal
    modal.classList.add("is-open");

    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-abierto");

    // Enfocar botón de cerrar
    requestAnimationFrame(() => {
        modal.querySelector(".modal-servicio__cerrar").focus();
    });
}


// =========================================
// CERRAR MODAL
// =========================================

function cerrarModal() {

    if (!modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");

    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-abierto");

    // Devolver el foco al botón que abrió la ventana
    if (ultimoElementoActivo) {
        ultimoElementoActivo.focus();
    }
}


// =========================================
// EVENTOS DE LOS BOTONES VER DETALLES
// =========================================

botonesDetalles.forEach((boton) => {

    boton.addEventListener("click", () => {
        abrirModal(boton);
    });

});


// =========================================
// EVENTOS PARA CERRAR
// =========================================

botonesCerrar.forEach((boton) => {

    boton.addEventListener("click", cerrarModal);

});


// =========================================
// CERRAR CON LA TECLA ESCAPE
// =========================================

document.addEventListener("keydown", (evento) => {

    if (!modal.classList.contains("is-open")) return;

    if (evento.key === "Escape") {
        cerrarModal();
    }

});


// =========================================
// CONTROL DEL FOCO DENTRO DEL MODAL
// =========================================

modal.addEventListener("keydown", (evento) => {

    if (evento.key !== "Tab") return;

    const elementos = modal.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex="0"]'
    );

    const primero = elementos[0];
    const ultimo = elementos[elementos.length - 1];

    if (!primero || !ultimo) return;

    if (evento.shiftKey && document.activeElement === primero) {

        evento.preventDefault();
        ultimo.focus();

    } else if (!evento.shiftKey && document.activeElement === ultimo) {

        evento.preventDefault();
        primero.focus();

    }

});
