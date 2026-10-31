const pool = require('../config/db');
const withTransaction = require('../utils/transaction');

const COLUMNS = `
  id_cita AS id,
  fecha_hora_inicio AS "startAt",
  fecha_hora_fin AS "endAt",
  estado AS status,
  id_mascota AS "petId",
  mascota AS "petName",
  servicio AS "serviceName",
  especie AS species,
  tamano AS size,
  tipo_pelo AS "hairType",
  profesional AS "professionalName",
  precio_servicio AS "servicePrice",
  total_adicionales AS "extrasTotal",
  total
`;

async function findAllByClient(clientId) {
    const { rows } = await pool.query(
        `SELECT ${COLUMNS} FROM v_cita_resumen
     WHERE id_cliente = $1
     ORDER BY fecha_hora_inicio DESC`,
        [clientId]
    );
    return rows;
}

async function findByIdForClient(id, clientId) {
    const { rows } = await pool.query(
        `SELECT ${COLUMNS} FROM v_cita_resumen
     WHERE id_cita = $1 AND id_cliente = $2`,
        [id, clientId]
    );
    return rows[0] || null;
}

async function create(clientId, { petId, variantId, startAt, extraIds, notes }) {
    return withTransaction(async (db) => {
        // 1. Cita: precio y duración se toman de la base, no del cliente
        const { rows } = await db.query(
            `INSERT INTO cita
         (id_mascota, id_variante_servicio, fecha_hora_inicio, fecha_hora_fin,
          precio_servicio, observacion_cliente)
       SELECT m.id_mascota, v.id_variante_servicio, $3::timestamptz,
              $3::timestamptz + make_interval(mins => v.duracion_minutos + COALESCE(e.total, 0)),
              v.precio, $4
       FROM mascota m
       JOIN variante_servicio v
         ON v.id_variante_servicio = $2 AND v.activo = TRUE AND v.especie = m.especie
       JOIN servicio_principal sp
         ON sp.id_servicio_principal = v.id_servicio_principal AND sp.activo = TRUE
       LEFT JOIN LATERAL (
         SELECT SUM(duracion_minutos)::int AS total
         FROM servicio_adicional
         WHERE id_servicio_adicional = ANY($5::int[]) AND activo = TRUE
       ) e ON TRUE
       WHERE m.id_mascota = $1 AND m.id_cliente = $6 AND m.activo = TRUE
       RETURNING id_cita AS id`,
            [petId, variantId, startAt, notes, extraIds, clientId]
        );

        if (rows.length === 0) return null;
        const appointmentId = rows[0].id;

        // 2. Extras: cada uno con su precio vigente
        if (extraIds.length > 0) {
            const { rowCount } = await db.query(
                `INSERT INTO cita_adicional (id_cita, id_servicio_adicional, precio_cobrado)
         SELECT $1, id_servicio_adicional, precio
         FROM servicio_adicional
         WHERE id_servicio_adicional = ANY($2::int[]) AND activo = TRUE`,
                [appointmentId, extraIds]
            );
            if (rowCount !== extraIds.length) {
                throw new Error('INVALID_EXTRAS');
            }
        }

        // 3. Historial
        await db.query(
            `INSERT INTO cita_historial_estado (id_cita, estado_nuevo, origen)
       VALUES ($1, 'pendiente', 'cliente')`,
            [appointmentId]
        );

        return appointmentId;
    });
}

async function cancel(id, clientId) {
    return withTransaction(async (db) => {
        const { rows } = await db.query(
            `SELECT c.estado
       FROM cita c
       JOIN mascota m ON m.id_mascota = c.id_mascota
       WHERE c.id_cita = $1 AND m.id_cliente = $2
       FOR UPDATE OF c`,
            [id, clientId]
        );

        if (rows.length === 0) return { found: false };

        const previousStatus = rows[0].estado;
        if (!['pendiente', 'confirmada'].includes(previousStatus)) {
            return { found: true, cancelled: false };
        }

        await db.query(`UPDATE cita SET estado = 'cancelada' WHERE id_cita = $1`, [id]);
        await db.query(
            `INSERT INTO cita_historial_estado (id_cita, estado_anterior, estado_nuevo, origen)
       VALUES ($1, $2, 'cancelada', 'cliente')`,
            [id, previousStatus]
        );

        return { found: true, cancelled: true };
    });
}

module.exports = { findAllByClient, findByIdForClient, create, cancel };