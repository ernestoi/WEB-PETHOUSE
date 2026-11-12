
// ==========================================
// PET HOUSE - REGISTRO DE CLIENTES
// ==========================================

const formulario = document.getElementById("form-registro");

const inputNombre = document.getElementById("nombre");
const inputCorreo = document.getElementById("correo");
const inputTelefono = document.getElementById("telefono");
const inputContrasena = document.getElementById("contrasena");
const inputConfirmar = document.getElementById("confirmar-contrasena");

formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Obtener datos del formulario
    const name = inputNombre.value.trim();
    const email = inputCorreo.value.trim().toLowerCase();
    const phone = inputTelefono.value.trim();
    const password = inputContrasena.value;
    const confirmPassword = inputConfirmar.value;

    // Validar campos vacíos
    if (!name || !email || !phone || !password || !confirmPassword) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        alert("Ingresa un correo electrónico válido.");
        return;
    }

    // Validar celular ecuatoriano
    if (!/^09\d{8}$/.test(phone)) {
        alert("El celular debe tener 10 dígitos y comenzar con 09.");
        return;
    }

    // Validar contraseña
    if (password.length < 5 || password.length > 128) {
        alert("La contraseña debe tener entre 5 y 128 caracteres.");
        return;
    }

    // Confirmar contraseña
    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    try {
        const boton = formulario.querySelector('button[type="submit"]');

        boton.disabled = true;
        boton.textContent = "Registrando...";

        // Enviar datos al backend
        const respuesta = await fetch(
            "http://localhost:3000/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    password
                })
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.message || "No se pudo completar el registro.");
        }

        // Verificar que el backend haya devuelto la sesión
        if (!datos.token || !datos.user) {
            throw new Error("El servidor no devolvió los datos de sesión.");
        }

        // Guardar sesión del cliente
        localStorage.setItem("token", datos.token);
        localStorage.setItem("nombre", datos.user.name);
        localStorage.setItem("rol", datos.user.role);
        
        // Guardar información adicional del cliente
        localStorage.setItem("correo", email);
        localStorage.setItem("celular", phone);
        console.log(datos.user.name)
        alert("¡Registro exitoso! Bienvenido a PETHOUSE " + datos.user.name);

        // Redirigir a la página principal del cliente
        window.location.href = "perfil_cliente.html";

    } catch (error) {
        console.error("Error en el registro:", error);
        alert(error.message || "Error de conexión con el servidor.");

        const boton = formulario.querySelector('button[type="submit"]');

        if (boton) {
            boton.disabled = false;
            boton.textContent = "Registrarse";
        }
    }
});
