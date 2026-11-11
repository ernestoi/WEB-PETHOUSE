const formulario = document.querySelector('form');
const inputCorreo = document.getElementById('email');
const inputPass = document.getElementById('password');

formulario.addEventListener('submit', async e => {
  e.preventDefault();

  const correo = inputCorreo.value.trim();
  const contrasena = inputPass.value;

  try {
    // PRIMERO INTENTA COMO CLIENTE
    let respuesta = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: correo,
        password: contrasena
      })
    });

    let datos = await respuesta.json();

    if (datos.token) {
      // Es CLIENTE
      localStorage.setItem('token', datos.token);
      localStorage.setItem('nombre', datos.user.name);
      localStorage.setItem('rol', datos.user.role);
      alert('¡Bienvenido!');
      window.location.href = 'perfil_cliente.html'; // ← Va al perfil del cliente
      return;
    }

    // SI NO FUE CLIENTE → INTENTA COMO ADMIN
    respuesta = await fetch('http://localhost:3000/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: correo, // ← Al admin le mandamos como "username"
        password: contrasena
      })
    });

    datos = await respuesta.json();

    if (datos.token) {
      // Es ADMINISTRADOR
      localStorage.setItem('token', datos.token);
      localStorage.setItem('nombre', datos.user.name);
      localStorage.setItem('rol', datos.user.role);
      alert('¡Bienvenido Administrador!');
      window.location.href = '../admin/index.html'; // ← Sube y va a la carpeta admin
      return;
    }

    // Si ninguno funcionó
    alert('Correo o contraseña incorrectos');

  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión con el servidor');
  }
});
