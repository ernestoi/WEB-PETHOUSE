const pool = require('../config/db');
const withTransaction = require('../utils/transaction')

const COLUMNS = `r.id_cita as id,
       r.fecha_hora_inicio, r.fecha_hora_fin, r.estado, r.id_cliente, r.cliente, 
       r.id_mascota, r.mascota, r.servicio, r.especie, r.tamano, r.tipo_pelo, 
       r.precio_servicio, r.total_adicionales, r.total, c.observacion_cliente, c.observacion_profesional
       FROM v_cita_resumen r JOIN cita c on c.id_cita = r.id_cita`;

async function findAll({estado}) {
    const conditions = []
    const params = []

    if(estado){
        params.push(estado);
        conditions.push(`r.estado = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}`: '';
    const {rows} = await pool.query(
        `SELECT ${COLUMNS} ${where} ORDER by r.fecha_hora_inicio`, params
    )
    return rows;
}

async function findById(id) {
    const {rows} = await pool.query(
        `SELECT ${COLUMNS} where r.id_cita = $1`,
        [id]
    );
    return rows[0] || null;
}

async function changeStatus(id, adminId) {
    return withTransaction(async (db) => {
        const {rows} = await db.query(
            `SELECT estado FROM cita WHERE id_cita = $1 FOR UPDATE`,[id]
        );
        if (rows.length === 0) {
            return "NOT FOUND";
        }

    })
}