
const pool = require('../config/db');

const COLUMNS = `
  id_mascota AS id,
  nombre AS name,
  especie AS species,
  raza AS breed,
  TO_CHAR(fecha_nacimiento, 'YYYY-MM-DD') AS "birthDate",
  tamano AS size,
  tipo_pelo AS "hairType",
  sexo AS sex,
  foto_perfil AS "photoUrl"
`;

// ==========================================
// CONTAR TODAS LAS MASCOTAS
// ==========================================

async function countAllPets() {
  const { rows } = await pool.query(
    "SELECT COUNT(*) AS total FROM mascota"
  );

  return rows[0].total;
}

// ==========================================
// LISTAR MASCOTAS DEL CLIENTE
// ==========================================

async function findAllByClient(clientId) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS}
     FROM mascota
     WHERE id_cliente = $1 AND activo = TRUE
     ORDER BY nombre`,
    [clientId]
  );

  return rows;
}

// ==========================================
// BUSCAR MASCOTA POR ID
// ==========================================

async function findByIdForClient(id, clientId) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS}
     FROM mascota
     WHERE id_mascota = $1
       AND id_cliente = $2
       AND activo = TRUE`,
    [id, clientId]
  );

  return rows[0] || null;
}

// ==========================================
// REGISTRAR MASCOTA
// ==========================================

async function create(
  clientId,
  { name, species, breed, birthDate, size, hairType, sex, photoUrl }
) {
  const { rows } = await pool.query(
    `INSERT INTO mascota (
      id_cliente,
      nombre,
      especie,
      raza,
      fecha_nacimiento,
      tamano,
      tipo_pelo,
      sexo,
      foto_perfil
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING ${COLUMNS}`,
    [
      clientId,
      name,
      species,
      breed,
      birthDate || null,
      size,
      hairType,
      sex,
      photoUrl
    ]
  );

  return rows[0];
}

// ==========================================
// ACTUALIZAR MASCOTA
// ==========================================

async function update(
  id,
  clientId,
  { name, species, breed, birthDate, size, hairType, sex }
) {
  const { rows } = await pool.query(
    `UPDATE mascota
     SET nombre = $1,
         especie = $2,
         raza = $3,
         fecha_nacimiento = $4,
         tamano = $5,
         tipo_pelo = $6,
         sexo = $7
     WHERE id_mascota = $8
       AND id_cliente = $9
       AND activo = TRUE
     RETURNING ${COLUMNS}`,
    [
      name,
      species,
      breed,
      birthDate || null,
      size,
      hairType,
      sex,
      id,
      clientId
    ]
  );

  return rows[0] || null;
}

// ==========================================
// DESACTIVAR MASCOTA
// ==========================================

async function deactivate(id, clientId) {
  const { rowCount } = await pool.query(
    `UPDATE mascota
     SET activo = FALSE
     WHERE id_mascota = $1
       AND id_cliente = $2
       AND activo = TRUE`,
    [id, clientId]
  );

  return rowCount > 0;
}

module.exports = {
  findAllByClient,
  findByIdForClient,
  create,
  update,
  deactivate,
  countAllPets
};
