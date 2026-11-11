const fecha_actual = document.getElementById("fecha-actual");

//Modificamos la fecha para que se actualice de forma automática
const fecha = new Date();
const estructura_Fecha = {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
};
fecha_actual.textContent = fecha.toLocaleDateString("es-EC", estructura_Fecha);

const valorMascotas = document.getElementById("valor-mascotas");

// Obtener total de mascotas desde PostgreSQL
async function getTotalPets() {
  const token = localStorage.getItem("token");

  // Comprobar que exista el token
  if (!token) {
    console.error("No se encontró el token de autenticación");
    return;
  }

  try {
    const respuesta = await fetch("http://localhost:3000/api/pets/total", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    console.log("Respuesta completa del servidor:", datos);
    console.log("Tipo de respuesta:", typeof datos);

    // Mostrar el total en el Dashboard
    valorMascotas.textContent = datos.totalPets;

    console.log("Total de mascotas:", datos.totalPets);
  } catch (error) {
    console.error("Error al obtener las mascotas:", error);
    valorMascotas.textContent = "--";
  }
}



// FUNCION PARA TRAER LOS DATOS DE CLIENTES ACTIVOS

const valorClientes = document.getElementById("valor-clientes");

async function getActiveClients() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No se encontró el token");
    return;
  }

  try {
    const respuesta = await fetch("http://localhost:3000/api/auth/total", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    console.log("Total de clientes activos:", datos.total_clientes);

    valorClientes.textContent = datos.total_clientes;
  } catch (error) {
    console.error("Error al obtener clientes activos:", error);
    valorClientes.textContent = "--";
  }
}
// Ejecutar al cargar el Dashboard
document.addEventListener("DOMContentLoaded", () => {
  getTotalPets();
  getActiveClients();
});
