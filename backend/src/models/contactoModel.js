
const pool = require("../config/db");

// ==========================================
// REGISTRAR MENSAJE DE CONTACTO
// ==========================================

async function create({ nombre, correo, motivo, mensaje }) {
  const { rows } = await pool.query(
    `INSERT INTO mensaje_contacto (
        nombre,
        correo,
        motivo,
        mensaje
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
        id_mensaje,
        nombre,
        correo,
        motivo,
        mensaje,
        fecha_envio,
        estado`,
    [nombre, correo, motivo, mensaje]
  );

  return rows[0];
}

module.exports = {
  create
};
