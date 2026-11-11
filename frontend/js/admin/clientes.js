// CONFIGURACIÓN
const API_CLIENTES = "http://localhost:3000/api/clients";
const listaClientes = document.getElementById("lista-clientes");
const inputBuscar = document.getElementById("input-buscar");
const totalClientes = document.getElementById("total-clientes");

let clientes = [];
let temporizadorBusqueda = null;
let clienteSeleccionado = null;
let mascotaSeleccionada = null;

// ELEMENTOS DE LOS MODALES
const modalVer = document.getElementById("modal-ver-cliente");
const modalEditar = document.getElementById("modal-editar-cliente");
const modalConfirmar = document.getElementById("modal-confirmar-mascota");

const detalleCliente = document.getElementById("detalle-cliente");
const listaMascotasCliente = document.getElementById("lista-mascotas-cliente");

const textoConfirmacion = document.getElementById("texto-confirmacion-mascota");

const formularioEditar = document.getElementById("form-editar-cliente");

const editarNombre = document.getElementById("editar-nombre");
const editarCorreo = document.getElementById("editar-correo");
const editarTelefono = document.getElementById("editar-telefono");
const editarDireccion = document.getElementById("editar-direccion");

const btnGuardarCliente = document.getElementById("btn-guardar-cliente");

// OBTENER TOKEN
function obtenerToken() {
  return localStorage.getItem("token");
}

// PROTEGER TEXTO HTML
function escaparHTML(valor) {
  return String(valor ?? "").replace(
    /[&<>"']/g,
    (caracter) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[caracter],
  );
}

// ==========================================
// FORMATEAR TELÉFONO
// ==========================================

function mostrarTelefono(telefono) {
  return telefono || "Sin teléfono registrado";
}

// ==========================================
// CARGAR CLIENTES
// ==========================================

async function cargarClientes(busqueda = "") {
  const token = obtenerToken();

  if (!token) {
    alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
    window.location.href = "../login.html";
    return;
  }

  try {
    listaClientes.innerHTML = "<p>Cargando clientes...</p>";

    const respuesta = await fetch(
      `${API_CLIENTES}?search=${encodeURIComponent(busqueda)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.message || "No se pudieron cargar los clientes.");
    }

    clientes = datos.clients || [];

    if (!busqueda) {
      totalClientes.textContent = `${datos.total} ${datos.total === 1 ? "cliente registrado" : "clientes registrados"}`;
    }

    mostrarClientes(clientes);
  } catch (error) {
    console.error("Error al cargar clientes:", error);

    listaClientes.innerHTML = `
            <p class="mensaje-vacio">
                ${escaparHTML(error.message)}
            </p>
        `;
  }
}

// ==========================================
// MOSTRAR TARJETAS
// ==========================================

function mostrarClientes(datos) {
  if (!datos || datos.length === 0) {
    listaClientes.innerHTML = `
            <div class="mensaje-vacio">
                <i class="fas fa-users"></i>
                <p>No se encontraron clientes registrados.</p>
            </div>
        `;

    return;
  }

  listaClientes.innerHTML = datos
    .map((cliente) => {
      const cantidad = Number(cliente.petCount) || 0;

      return `
            <article class="tarjeta-cliente" data-id="${Number(cliente.id)}">

                <div class="tarjeta-cliente__avatar">

                    ${
                      cliente.photoUrl
                        ? `<img src="${escaparHTML(cliente.photoUrl)}"
                               alt="Foto de ${escaparHTML(cliente.name)}">`
                        : '<i class="fas fa-user"></i>'
                    }

                </div>

                <div class="tarjeta-cliente__info">

                    <h3 class="tarjeta-cliente__nombre">
                        ${escaparHTML(cliente.name)}
                    </h3>

                    <p class="tarjeta-cliente__dato">
                        <i class="fas fa-envelope"></i>
                        ${escaparHTML(cliente.email)}
                    </p>

                    <p class="tarjeta-cliente__dato">
                        <i class="fas fa-phone"></i>
                        ${escaparHTML(mostrarTelefono(cliente.phone))}
                    </p>

                    <p class="tarjeta-cliente__mascotas">
                        <i class="fas fa-paw"></i>
                        ${cantidad}
                        ${cantidad === 1 ? "mascota registrada" : "mascotas registradas"}
                    </p>

                </div>

                <div class="tarjeta-cliente__acciones">

                    <button
                        type="button"
                        class="accion accion--ver"
                        data-accion="ver"
                        data-id="${Number(cliente.id)}"
                        title="Ver detalles">

                        <i class="fas fa-eye"></i>

                    </button>

                    <button
                        type="button"
                        class="accion accion--editar"
                        data-accion="editar"
                        data-id="${Number(cliente.id)}"
                        title="Editar cliente">

                        <i class="fas fa-pen"></i>

                    </button>

                </div>

            </article>
        `;
    })
    .join("");
}

// ==========================================
// BUSCADOR DINÁMICO
// ==========================================

inputBuscar.addEventListener("input", () => {
  clearTimeout(temporizadorBusqueda);

  temporizadorBusqueda = setTimeout(() => {
    cargarClientes(inputBuscar.value.trim());
  }, 300);
});

// ==========================================
// EVENTOS DE LOS BOTONES
// ==========================================

listaClientes.addEventListener("click", async (e) => {
  const boton = e.target.closest("button[data-accion]");

  if (!boton) return;

  const id = Number(boton.dataset.id);
  const accion = boton.dataset.accion;

  if (accion === "ver") {
    await verCliente(id);
  }

  if (accion === "editar") {
    await editarCliente(id);
  }
});

// ==========================================
// VISUALIZAR CLIENTE
// ==========================================

async function verCliente(id) {
  const token = obtenerToken();

  try {
    const respuesta = await fetch(`${API_CLIENTES}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const cliente = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(cliente.message || "No se pudo consultar el cliente.");
    }

    clienteSeleccionado = cliente;

    // Consultar mascotas del cliente
    const respuestaMascotas = await fetch(`${API_CLIENTES}/${id}/pets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const datosMascotas = await respuestaMascotas.json();

    if (!respuestaMascotas.ok) {
      throw new Error(
        datosMascotas.message || "No se pudieron consultar las mascotas.",
      );
    }

    // Información personal
    detalleCliente.innerHTML = `
            <h3>${escaparHTML(cliente.name)}</h3>

            <p>
                <i class="fas fa-envelope"></i>
                ${escaparHTML(cliente.email)}
            </p>

            <p>
                <i class="fas fa-phone"></i>
                ${escaparHTML(cliente.phone || "Sin teléfono")}
            </p>

            <p>
                <i class="fas fa-map-marker-alt"></i>
                ${escaparHTML(cliente.address || "Sin dirección")}
            </p>
        `;

    // Mostrar mascotas
    mostrarMascotasCliente(datosMascotas.pets || []);

    modalVer.classList.add("modal--activo");
  } catch (error) {
    console.error("Error al consultar cliente:", error);
    alert(error.message);
  }
}

// ==========================================
// MOSTRAR MASCOTAS DEL CLIENTE
// ==========================================

function mostrarMascotasCliente(mascotas) {
  if (!mascotas.length) {
    listaMascotasCliente.innerHTML = `
            <p class="mensaje-vacio">
                Este cliente todavía no tiene mascotas activas.
            </p>
        `;

    return;
  }

  listaMascotasCliente.innerHTML = mascotas
    .map((mascota) => {
      const foto = mascota.photoUrl
        ? `<img class="mascota-cliente__foto"
                    src="${escaparHTML(mascota.photoUrl)}"
                    alt="Foto de ${escaparHTML(mascota.name)}">`
        : `<div class="tarjeta-cliente__avatar">
                    <i class="fas fa-paw"></i>
               </div>`;

      return `
            <div class="mascota-cliente">

                ${foto}

                <div class="mascota-cliente__info">

                    <h4>${escaparHTML(mascota.name)}</h4>

                    <p>
                        ${escaparHTML(mascota.species || "Sin especie")}
                        · ${escaparHTML(mascota.breed || "Sin raza")}
                    </p>

                    <p>
                        Tamaño:
                        ${escaparHTML(mascota.size || "No especificado")}
                    </p>

                </div>

                <button
                    type="button"
                    class="mascota-cliente__desactivar"
                    data-mascota="${Number(mascota.id)}"
                    data-nombre="${escaparHTML(mascota.name)}"
                    title="Desactivar mascota">

                    <i class="fas fa-times"></i>

                </button>

            </div>
        `;
    })
    .join("");
}

// ==========================================
// SOLICITAR DESACTIVACIÓN
// ==========================================

listaMascotasCliente.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-mascota]");

  if (!boton) return;

  mascotaSeleccionada = Number(boton.dataset.mascota);

  textoConfirmacion.textContent = `¿Estás segura de que deseas desactivar a ${boton.dataset.nombre}?`;

  modalConfirmar.classList.add("modal--activo");
});

// ==========================================
// CONFIRMAR DESACTIVACIÓN
// ==========================================

document
  .getElementById("confirmar-desactivacion")
  .addEventListener("click", async () => {
    if (!clienteSeleccionado || !mascotaSeleccionada) return;

    const token = obtenerToken();

    const boton = document.getElementById("confirmar-desactivacion");

    try {
      boton.disabled = true;

      const respuesta = await fetch(
        `${API_CLIENTES}/${clienteSeleccionado.id}/pets/${mascotaSeleccionada}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const resultado = respuesta.status === 204 ? {} : await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.message || "No se pudo desactivar la mascota.",
        );
      }

      mascotaSeleccionada = null;

      modalConfirmar.classList.remove("modal--activo");

      alert("Mascota desactivada correctamente.");

      await verCliente(clienteSeleccionado.id);

      await cargarClientes(inputBuscar.value.trim());
    } catch (error) {
      console.error("Error al desactivar mascota:", error);
      alert(error.message);
    } finally {
      boton.disabled = false;
    }
  });

// ==========================================
// ABRIR MODAL DE EDICIÓN
// ==========================================

async function editarCliente(id) {
  const token = obtenerToken();

  try {
    const respuesta = await fetch(`${API_CLIENTES}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const cliente = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(cliente.message || "No se pudo consultar el cliente.");
    }

    clienteEditando = cliente.id;

    editarNombre.value = cliente.name || "";
    editarCorreo.value = cliente.email || "";
    editarTelefono.value = cliente.phone || "";
    editarDireccion.value = cliente.address || "";

    modalEditar.classList.add("modal--activo");
  } catch (error) {
    console.error("Error al abrir edición:", error);
    alert(error.message);
  }
}


let clienteEditando = null;

// ==========================================
// GUARDAR CAMBIOS DEL CLIENTE
// ==========================================

formularioEditar.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!clienteEditando) return;

  const nombre = editarNombre.value.trim();
  const correo = editarCorreo.value.trim();
  const telefono = editarTelefono.value.trim();
  const direccion = editarDireccion.value.trim();

  if (!nombre || !correo) {
    alert("El nombre y el correo son obligatorios.");
    return;
  }

  if (telefono && !/^09\d{8}$/.test(telefono)) {
    alert("El teléfono debe tener 10 dígitos y comenzar con 09.");
    return;
  }

  const token = obtenerToken();

  try {
    btnGuardarCliente.disabled = true;

    btnGuardarCliente.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Guardando...
        `;

    const respuesta = await fetch(`${API_CLIENTES}/${clienteEditando}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        name: nombre,
        email: correo,
        phone: telefono || null,
        address: direccion || null,
      }),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.message || "No se pudo actualizar el cliente.");
    }

    modalEditar.classList.remove("modal--activo");

    formularioEditar.reset();

    clienteEditando = null;

    await cargarClientes(inputBuscar.value.trim());

    alert("¡Cliente actualizado correctamente!");
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    alert(error.message);
  } finally {
    btnGuardarCliente.disabled = false;

    btnGuardarCliente.innerHTML = `
            <i class="fas fa-save"></i>
            Guardar cambios
        `;
  }
});

// ==========================================
// CERRAR MODALES
// ==========================================

document.querySelectorAll('[data-cerrar="ver"]').forEach((boton) => {
  boton.addEventListener("click", () => {
    modalVer.classList.remove("modal--activo");
  });
});

document.querySelectorAll('[data-cerrar="editar"]').forEach((boton) => {
  boton.addEventListener("click", () => {
    modalEditar.classList.remove("modal--activo");

    formularioEditar.reset();

    clienteEditando = null;
  });
});

document
  .getElementById("cancelar-desactivacion")
  .addEventListener("click", () => {
    modalConfirmar.classList.remove("modal--activo");
    mascotaSeleccionada = null;
  });

// ==========================================
// INICIALIZAR
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  cargarClientes();
});
