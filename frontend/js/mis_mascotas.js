// Referenciar el HTML
const btn_historial = document.querySelectorAll(".btn-historial");

// FUNCION DEL BOTÓN HISTORIAL
btn_historial.forEach((btn) => {
  btn.addEventListener("click", () => {
    btn_historial.forEach((btn_desactivar) => {
      btn_desactivar.classList.remove("active")
    });
    btn.classList.add("active");
    window.location.href = '/frontend/cliente/perfil_cliente.html';
    console.log("se ha dado click.");
  });
});

console.log(btn_historial);












