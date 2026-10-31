const pool = require('../config/db');

const COLUMNS = `
  id_servicio_adicional AS id,
  nombre AS name,
  descripcion AS description,
  precio AS price,
  duracion_minutos AS "durationMinutes"
`;

async function findAll() {
    const { rows } = await pool.query(
        `SELECT ${COLUMNS} FROM servicio_adicional
     WHERE activo = TRUE
     ORDER BY nombre`
    );
    return rows;
}

async function findById(id) {
    const { rows } = await pool.query(
        `SELECT ${COLUMNS} FROM servicio_adicional
     WHERE id_servicio_adicional = $1 AND activo = TRUE`,
        [id]
    );
    return rows[0] || null;
}

async function create({ name, description, price, durationMinutes }) {
    const { rows } = await pool.query(
        `INSERT INTO servicio_adicional (nombre, descripcion, precio, duracion_minutos)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNS}`,
        [name, description, price, durationMinutes]
    );
    return rows[0];
}

async function update(id, { name, description, price, durationMinutes }) {
    const { rows } = await pool.query(
        `UPDATE servicio_adicional
     SET nombre = $1, descripcion = $2, precio = $3, duracion_minutos = $4
     WHERE id_servicio_adicional = $5 AND activo = TRUE
     RETURNING ${COLUMNS}`,
        [name, description, price, durationMinutes, id]
    );
    return rows[0] || null;
}

async function deactivate(id) {
    const { rowCount } = await pool.query(
        `UPDATE servicio_adicional SET activo = FALSE
     WHERE id_servicio_adicional = $1 AND activo = TRUE`,
        [id]
    );
    return rowCount > 0;
}

module.exports = { findAll, findById, create, update, deactivate };