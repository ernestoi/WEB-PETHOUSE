const pool = require('../config/db');

const COLUMNS = `
  id_servicio_principal AS id,
  nombre AS name,
  descripcion AS description
`;

async function findAll() {
    const { rows } = await pool.query(
        `SELECT ${COLUMNS} FROM servicio_principal
     WHERE activo = TRUE
     ORDER BY nombre`
    );
    return rows;
}

async function findById(id) {
    const { rows } = await pool.query(
        `SELECT ${COLUMNS} FROM servicio_principal
     WHERE id_servicio_principal = $1 AND activo = TRUE`,
        [id]
    );
    return rows[0] || null;
}

async function create({ name, description }) {
    const { rows } = await pool.query(
        `INSERT INTO servicio_principal (nombre, descripcion)
     VALUES ($1, $2)
     RETURNING ${COLUMNS}`,
        [name, description]
    );
    return rows[0];
}

async function update(id, { name, description }) {
    const { rows } = await pool.query(
        `UPDATE servicio_principal
     SET nombre = $1, descripcion = $2
     WHERE id_servicio_principal = $3 AND activo = TRUE
     RETURNING ${COLUMNS}`,
        [name, description, id]
    );
    return rows[0] || null;
}

async function deactivate(id) {
    const { rowCount } = await pool.query(
        `UPDATE servicio_principal
     SET activo = FALSE
     WHERE id_servicio_principal = $1 AND activo = TRUE`,
        [id]
    );
    return rowCount > 0;
}

module.exports = { findAll, findById, create, update, deactivate };