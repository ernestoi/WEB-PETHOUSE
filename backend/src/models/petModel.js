const pool = require('../config/db');

const COLUMNS = `
  id_mascota AS id,
  nombre AS name,
  especie AS species,
  raza AS breed,
  TO_CHAR(fecha_nacimiento, 'YYYY-MM-DD') AS "birthDate",
  tamano AS size,
  tipo_pelo AS "hairType",
  foto_perfil AS "photoUrl"
`;

async function findAllByClient(clientId) {
    const { rows } = await pool.query(
        `SELECT ${COLUMNS} FROM mascota
     WHERE id_cliente = $1 AND activo = TRUE
     ORDER BY nombre`,
        [clientId]
    );
    return rows;
}

async function findByIdForClient(id, clientId) {
    const { rows } = await pool.query(
        `SELECT ${COLUMNS} FROM mascota
     WHERE id_mascota = $1 AND id_cliente = $2 AND activo = TRUE`,
        [id, clientId]
    );
    return rows[0] || null;
}

async function create(clientId, { name, species, breed, birthDate, size, hairType }) {
    const { rows } = await pool.query(
        `INSERT INTO mascota (id_cliente, nombre, especie, raza, fecha_nacimiento, tamano, tipo_pelo)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${COLUMNS}`,
        [clientId, name, species, breed, birthDate, size, hairType]
    );
    return rows[0];
}

async function update(id, clientId, { name, species, breed, birthDate, size, hairType }) {
    const { rows } = await pool.query(
        `UPDATE mascota
     SET nombre = $1, especie = $2, raza = $3, fecha_nacimiento = $4, tamano = $5, tipo_pelo = $6
     WHERE id_mascota = $7 AND id_cliente = $8 AND activo = TRUE
     RETURNING ${COLUMNS}`,
        [name, species, breed, birthDate, size, hairType, id, clientId]
    );
    return rows[0] || null;
}

async function deactivate(id, clientId) {
    const { rowCount } = await pool.query(
        `UPDATE mascota SET activo = FALSE
     WHERE id_mascota = $1 AND id_cliente = $2 AND activo = TRUE`,
        [id, clientId]
    );
    return rowCount > 0;
}

module.exports = { findAllByClient, findByIdForClient, create, update, deactivate };