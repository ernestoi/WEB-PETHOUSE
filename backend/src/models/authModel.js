const pool = require('../config/db');

async function findAdminForLogin(identifier) {
    const { rows } = await pool.query(
        `SELECT id_admin AS id,
            nombre AS name,
            rol AS role,
            contrasena AS "passwordHash"
     FROM admin
     WHERE (LOWER(usuario) = LOWER($1) OR LOWER(email) = LOWER($1))
       AND activo = TRUE`,
        [identifier]
    );
    return rows[0] || null;
}

async function findClientForLogin(email) {
    const { rows } = await pool.query(
        `SELECT id_cliente AS id,
            nombre AS name,
            contrasena AS "passwordHash"
     FROM cliente
     WHERE LOWER(email) = LOWER($1)
       AND activo = TRUE`,
        [email]
    );
    return rows[0] || null;
}

async function createClient({ name, email, passwordHash, phone }) {
    const { rows } = await pool.query(
        `INSERT INTO cliente (nombre, email, contrasena, celular)
     VALUES ($1, $2, $3, $4)
     RETURNING id_cliente AS id, nombre AS name, email`,
        [name, email, passwordHash, phone]
    );
    return rows[0];
}

// Contar todos los usuarios
async function countAllActiveUser() {
    const {rows} = await pool.query('SELECT COUNT(*) AS Total_Clientes FROM cliente  WHERE activo = $1',[true]);
    return rows[0].total_clientes;
}



// PERFIL DEL ADMINISTRADOR
// Funcion para ver la información del administrador
async function findAdminProfile(id) {
    const { rows } = await pool.query(
        `SELECT
            id_admin AS id,
            nombre AS name,
            email,
            telefono AS phone,
            usuario AS username,
            foto_perfil AS "photoUrl"
         FROM admin
         WHERE id_admin = $1 AND activo = TRUE`,
        [id]
    );

    return rows[0] || null;
}

// Función para actualizar la información personal de ADMIN
async function updateAdminProfile(id, { name, email, phone }) {
    const { rows } = await pool.query(
        `UPDATE admin
         SET nombre = $1,
             email = $2,
             telefono = $3
         WHERE id_admin = $4 AND activo = TRUE
         RETURNING
            id_admin AS id,
            nombre AS name,
            email,
            telefono AS phone,
            usuario AS username,
            foto_perfil AS "photoUrl"`,
        [name, email, phone, id]
    );

    return rows[0] || null;
}


module.exports = { findAdminForLogin, findClientForLogin, createClient, countAllActiveUser, findAdminProfile, updateAdminProfile};