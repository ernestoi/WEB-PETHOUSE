
const API_URL = "http://localhost:3000/api";

const formulario = document.getElementById("contactoForm");
const estadoFormulario = document.getElementById("estadoFormulario");
const botonEnviar = document.getElementById("btnEnviar");

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const datos = {
        nombre: formulario.nombre.value.trim(),
        correo: formulario.correo.value.trim(),
        motivo: formulario.motivo.value,
        mensaje: formulario.mensaje.value.trim()
    };

    estadoFormulario.hidden = true;
    estadoFormulario.textContent = "";

    botonEnviar.disabled = true;
    botonEnviar.textContent = "Enviando mensaje...";

    try {
        const respuesta = await fetch(`${API_URL}/contacto`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.message || "No se pudo enviar el mensaje."
            );
        }

        estadoFormulario.textContent =
            resultado.message || "¡Mensaje enviado correctamente!";

        estadoFormulario.className = "mensaje-formulario exito";

        formulario.reset();

    } catch (error) {

        estadoFormulario.textContent =
            error.message || "Error al conectar con el servidor.";

        estadoFormulario.className = "mensaje-formulario error";

    } finally {

        estadoFormulario.hidden = false;
        botonEnviar.disabled = false;
        botonEnviar.textContent = "Enviar mensaje";
    }
});
