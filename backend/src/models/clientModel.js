const pool = require("../config/db");


const COLUMNS2 = `
    c.id_cliente AS id,
    c.nombre AS name,
    c.email,
    c.celular AS phone,
    c.direccion AS address,
    c.foto_perfil AS "photoUrl",
    COUNT(m.id_mascota) FILTER (
        WHERE m.activo = TRUE
    )::INTEGER AS "petCount"
`;

// ==========================================
// OBTENER TODOS LOS CLIENTES Y BUSCAR
// ==========================================

async function findAll(search = "") {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS2}
         FROM cliente c
         LEFT JOIN mascota m
            ON m.id_cliente = c.id_cliente
         WHERE c.activo = TRUE
           AND (
                c.nombre ILIKE $1
                OR c.email ILIKE $1
                OR COALESCE(c.celular, '') ILIKE $1
           )
         GROUP BY
            c.id_cliente,
            c.nombre,
            c.email,
            c.celular,
            c.direccion,
            c.foto_perfil
         ORDER BY c.nombre`,
    [`%${search}%`],
  );

  return rows;
}

// ==========================================
// OBTENER CLIENTE POR ID
// ==========================================

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS2}
         FROM cliente c
         LEFT JOIN mascota m
            ON m.id_cliente = c.id_cliente
         WHERE c.id_cliente = $1
           AND c.activo = TRUE
         GROUP BY
            c.id_cliente,
            c.nombre,
            c.email,
            c.celular,
            c.direccion,
            c.foto_perfil`,
    [id],
  );

  return rows[0] || null;
}

// ==========================================
// ACTUALIZAR INFORMACIÓN DEL CLIENTE
// ==========================================

async function update(id, { name, email, phone, address }) {
  const { rows } = await pool.query(
    `UPDATE cliente
         SET nombre = $1,
             email = $2,
             celular = $3,
             direccion = $4,
             fecha_actualizacion = NOW()
         WHERE id_cliente = $5
           AND activo = TRUE
         RETURNING
            id_cliente AS id,
            nombre AS name,
            email,
            celular AS phone,
            direccion AS address,
            foto_perfil AS "photoUrl"`,
    [name, email, phone, address, id],
  );

  return rows[0] || null;
}

module.exports = {
  findAll,
  findById,
  update,
};
