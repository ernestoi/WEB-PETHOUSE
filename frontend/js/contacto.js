

const API_URL = "http://localhost:3000/api";

// =========================================
// ELEMENTOS DEL FORMULARIO
// =========================================

const formContacto = document.getElementById("formContacto");

const nombreContacto = document.getElementById("nombreContacto");
const correoContacto = document.getElementById("correoContacto");
const motivoContacto = document.getElementById("motivoContacto");
const mensajeContacto = document.getElementById("mensajeContacto");

const btnEnviarContacto = document.getElementById("btnEnviarContacto");
const estadoContacto = document.getElementById("estadoContacto");


// =========================================
// ENVIAR MENSAJE DE CONTACTO
// =========================================

formContacto.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const datos = {
        nombre: nombreContacto.value.trim(),
        correo: correoContacto.value.trim(),
        motivo: motivoContacto.value,
        mensaje: mensajeContacto.value.trim()
    };

    // Evitar envíos vacíos
    if (
        !datos.nombre ||
        !datos.correo ||
        !datos.motivo ||
        !datos.mensaje
    ) {
        mostrarEstado("Completa todos los campos.", "error");
        return;
    }

    // Deshabilitar botón durante el envío
    btnEnviarContacto.disabled = true;
    btnEnviarContacto.textContent = "Enviando...";

    estadoContacto.textContent = "";

    try {

        const respuesta = await fetch(`${API_URL}/contacto`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(datos)

        });

        const resultado = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            throw new Error(
                resultado.message || "No se pudo enviar el mensaje."
            );
        }

        mostrarEstado(
            resultado.message || "¡Mensaje enviado correctamente!",
            "exito"
        );

        // Limpiar formulario
        formContacto.reset();

    } catch (error) {

        console.error("Error al enviar contacto:", error);

        mostrarEstado(
            error.message || "Error de conexión con el servidor.",
            "error"
        );

    } finally {

        btnEnviarContacto.disabled = false;
        btnEnviarContacto.textContent = "Enviar mensaje";

    }

});


// =========================================
// MOSTRAR MENSAJES AL USUARIO
// =========================================

function mostrarEstado(mensaje, tipo) {

    estadoContacto.textContent = mensaje;

    estadoContacto.className = tipo;

}
