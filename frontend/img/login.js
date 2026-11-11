const formulario = document.getElementById("form-login");
const inputCorreo = document.getElementById("email");
const inputPass = document.getElementById("password");

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/auth/admin/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: inputCorreo.value.trim(), 
          password: inputPass.value, 
        }),
      },
    );

    const datos = await respuesta.json();
    console.log("Estado:", respuesta.status);
    console.log("Respuesta:", datos);

    if (datos.token) {
      localStorage.setItem("token", datos.token);
      localStorage.setItem("nombre", datos.user.name);
      localStorage.setItem("rol", datos.user.role);
      alert("¡Bienvenido, " + datos.user.name);
      window.location.href = "/frontend/admin/index.html";
    } else {
      alert(datos.error || datos.message || "Credenciales inválidas");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión");
  }
});
