const pool = require('../config/db');

const COLUMNS = `
  v.id_variante_servicio AS id,
  v.id_servicio_principal AS "serviceId",
  sp.nombre AS "serviceName",
  v.especie AS species,
  v.tamano AS size,
  v.tipo_pelo AS "hairType",
  v.precio AS price,
  v.duracion_minutos AS "durationMinutes"
`;

const FROM = `
  FROM variante_servicio v
  JOIN servicio_principal sp ON sp.id_servicio_principal = v.id_servicio_principal
`;

async function findAll(serviceId) {
    const params = [];
    let filter = '';

    if (serviceId) {
        params.push(serviceId);
        filter = 'AND v.id_servicio_principal = $1';
    }

    const { rows } = await pool.query(
        `SELECT ${COLUMNS} ${FROM}
     WHERE v.activo = TRUE AND sp.activo = TRUE ${filter}
     ORDER BY sp.nombre, v.especie, v.precio`,
        params
    );
    return rows;
}

async function findById(id) {
    const { rows } = await pool.query(
        `SELECT ${COLUMNS} ${FROM}
     WHERE v.id_variante_servicio = $1 AND v.activo = TRUE AND sp.activo = TRUE`,
        [id]
    );
    return rows[0] || null;
}

async function create({ serviceId, species, size, hairType, price, durationMinutes }) {
    const { rows } = await pool.query(
        `INSERT INTO variante_servicio
       (id_servicio_principal, especie, tamano, tipo_pelo, precio, duracion_minutos)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_variante_servicio AS id`,
        [serviceId, species, size, hairType, price, durationMinutes]
    );
    return findById(rows[0].id);
}

async function update(id, { serviceId, species, size, hairType, price, durationMinutes }) {
    const { rowCount } = await pool.query(
        `UPDATE variante_servicio
     SET id_servicio_principal = $1, especie = $2, tamano = $3,
         tipo_pelo = $4, precio = $5, duracion_minutos = $6
     WHERE id_variante_servicio = $7 AND activo = TRUE`,
        [serviceId, species, size, hairType, price, durationMinutes, id]
    );
    return rowCount > 0 ? findById(id) : null;
}

async function deactivate(id) {
    const { rowCount } = await pool.query(
        `UPDATE variante_servicio SET activo = FALSE
     WHERE id_variante_servicio = $1 AND activo = TRUE`,
        [id]
    );
    return rowCount > 0;
}

module.exports = { findAll, findById, create, update, deactivate };