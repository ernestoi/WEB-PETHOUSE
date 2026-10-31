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

module.exports = { findAdminForLogin, findClientForLogin, createClient };