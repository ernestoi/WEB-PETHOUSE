const pool = require("../config/db");
const withTransaction = require("../utils/transaction");

// CONFIGURACIÓN DE PETHOUSE
const PROFESIONAL_ID = 3;
const DURACION_CITA = 90;
const ZONA_HORARIA = "America/Guayaquil";

const HORARIOS = ["09:00", "10:30", "12:00", "13:30", "15:00"];

const ESTADOS_NO_BLOQUEANTES = ["cancelada", "no_asistio"];

// COLUMNAS DE CONSULTA
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

// FUNCIONES AUXILIARES
function validarFecha(fecha) {
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error("INVALID_DATE");
  }

  const [year, month, day] = fecha.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("INVALID_DATE");
  }

  return fecha;
}

function obtenerFechaHoraLocal(fecha) {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);

  const resultado = {};

  for (const parte of partes) {
    if (parte.type !== "literal") {
      resultado[parte.type] = parte.value;
    }
  }

  return {
    date: `${resultado.year}-${resultado.month}-${resultado.day}`,
    time: `${resultado.hour}:${resultado.minute}`,
  };
}

function generarBloques(fecha) {
  return HORARIOS.map((hora) => {
    const startAt = new Date(`${fecha}T${hora}:00-05:00`);

    const endAt = new Date(startAt.getTime() + DURACION_CITA * 60000);

    return {
      time: hora,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    };
  });
}

// CONSULTAR CITAS DEL CLIENTE
async function findAllByClient(clientId) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS}
         FROM v_cita_resumen
         WHERE id_cliente = $1
         ORDER BY fecha_hora_inicio DESC`,
    [clientId],
  );

  return rows;
}

// CONSULTAR CITA POR ID
async function findByIdForClient(id, clientId) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS}
         FROM v_cita_resumen
         WHERE id_cita = $1
           AND id_cliente = $2`,
    [id, clientId],
  );

  return rows[0] || null;
}

// CONSULTAR DISPONIBILIDAD
async function getAvailability(fecha) {
  validarFecha(fecha);

  const bloques = generarBloques(fecha);

  const { rows } = await pool.query(
    `SELECT
            fecha_hora_inicio AS inicio,
            fecha_hora_fin AS fin
         FROM cita
         WHERE id_profesional = $1
           AND (fecha_hora_inicio AT TIME ZONE $2)::date = $3::date
           AND estado <> ALL($4::varchar[])`,
    [PROFESIONAL_ID, ZONA_HORARIA, fecha, ESTADOS_NO_BLOQUEANTES],
  );

  const ahora = Date.now();

  const slots = bloques.map((bloque) => {
    const inicio = new Date(bloque.startAt).getTime();
    const fin = new Date(bloque.endAt).getTime();

    const ocupado = rows.some((cita) => {
      const citaInicio = new Date(cita.inicio).getTime();
      const citaFin = new Date(cita.fin).getTime();

      return inicio < citaFin && fin > citaInicio;
    });

    const pasado = inicio <= ahora;

    return {
      time: bloque.time,
      startAt: bloque.startAt,
      endAt: bloque.endAt,
      available: !ocupado && !pasado,
      reason: ocupado ? "occupied" : pasado ? "past" : null,
    };
  });

  return {
    date: fecha,
    slots,
  };
}

// REGISTRAR CITA
async function create(
  clientId,
  { petId, variantId, startAt, extraIds = [], notes },
) {
  try {
    return await withTransaction(async (db) => {
      const fechaInicio = new Date(startAt);

      if (Number.isNaN(fechaInicio.getTime())) {
        throw new Error("INVALID_DATE");
      }

      const local = obtenerFechaHoraLocal(fechaInicio);

      validarFecha(local.date);

      if (!HORARIOS.includes(local.time)) {
        throw new Error("INVALID_SLOT");
      }

      const bloqueValido = generarBloques(local.date).some(
        (bloque) =>
          new Date(bloque.startAt).getTime() === fechaInicio.getTime(),
      );

      if (!bloqueValido || fechaInicio.getTime() <= Date.now()) {
        throw new Error("INVALID_SLOT");
      }

      await db.query(`SELECT pg_advisory_xact_lock(hashtext($1), $2)`, [
        local.date,
        PROFESIONAL_ID,
      ]);

      // VALIDAR CITA PREVIA DE LA MASCOTA

      const { rows: citasMascota } = await db.query(
        `SELECT id_cita
     FROM cita
     WHERE id_mascota = $1
       AND (fecha_hora_inicio AT TIME ZONE $2)::date = $3::date
       AND estado <> 'cancelada'
     LIMIT 1`,
        [petId, ZONA_HORARIA, local.date],
      );

      if (citasMascota.length > 0) {
        throw new Error("PET_ALREADY_BOOKED");
      }

      const { rows: ocupadas } = await db.query(
        `SELECT id_cita
                 FROM cita
                 WHERE id_profesional = $1
                   AND tstzrange(
                       fecha_hora_inicio,
                       fecha_hora_fin,
                       '[)'
                   ) && tstzrange(
                       $2::timestamptz,
                       $2::timestamptz + interval '90 minutes',
                       '[)'
                   )
                   AND estado <> ALL($3::varchar[])
                 LIMIT 1`,
        [PROFESIONAL_ID, fechaInicio.toISOString(), ESTADOS_NO_BLOQUEANTES],
      );

      if (ocupadas.length > 0) {
        throw new Error("SLOT_TAKEN");
      }

      const { rows } = await db.query(
        `INSERT INTO cita (
                    id_mascota,
                    id_variante_servicio,
                    id_profesional,
                    fecha_hora_inicio,
                    fecha_hora_fin,
                    precio_servicio,
                    observacion_cliente
                )
                SELECT
                    m.id_mascota,
                    v.id_variante_servicio,
                    $6,
                    $3::timestamptz,
                    $3::timestamptz + interval '90 minutes',
                    v.precio,
                    $4
                FROM mascota m
                INNER JOIN variante_servicio v
                    ON v.id_variante_servicio = $2
                   AND v.activo = TRUE
                   AND v.especie = m.especie
                   AND v.tamano = m.tamano
                   AND (
                       v.tipo_pelo IS NULL
                       OR v.tipo_pelo = m.tipo_pelo
                   )
                INNER JOIN servicio_principal sp
                    ON sp.id_servicio_principal =
                       v.id_servicio_principal
                   AND sp.activo = TRUE
                WHERE m.id_mascota = $1
                  AND m.id_cliente = $5
                  AND m.activo = TRUE
                  AND $3::timestamptz > NOW()
                RETURNING id_cita AS id`,
        [
          petId,
          variantId,
          fechaInicio.toISOString(),
          notes,
          clientId,
          PROFESIONAL_ID,
        ],
      );

      if (rows.length === 0) {
        throw new Error("INVALID_SERVICE_OR_PET");
      }

      const appointmentId = rows[0].id;

      if (extraIds.length > 0) {
        const { rowCount } = await db.query(
          `INSERT INTO cita_adicional (
                        id_cita,
                        id_servicio_adicional,
                        precio_cobrado
                    )
                    SELECT
                        $1,
                        id_servicio_adicional,
                        precio
                    FROM servicio_adicional
                    WHERE id_servicio_adicional = ANY($2::int[])
                      AND activo = TRUE`,
          [appointmentId, extraIds],
        );

        if (rowCount !== extraIds.length) {
          throw new Error("INVALID_EXTRAS");
        }
      }

      await db.query(
        `INSERT INTO cita_historial_estado (
                    id_cita,
                    estado_nuevo,
                    origen
                )
                VALUES ($1, 'pendiente', 'cliente')`,
        [appointmentId],
      );

      return appointmentId;
    });
  } catch (error) {
    if (error.code === "23P01") {
      throw new Error("SLOT_TAKEN");
    }

    throw error;
  }
}

// CANCELAR CITA
async function cancel(id, clientId) {
  return withTransaction(async (db) => {
    const { rows } = await db.query(
      `SELECT c.estado
             FROM cita c
             INNER JOIN mascota m
                ON m.id_mascota = c.id_mascota
             WHERE c.id_cita = $1
               AND m.id_cliente = $2
             FOR UPDATE OF c`,
      [id, clientId],
    );

    if (rows.length === 0) {
      return { found: false };
    }

    const previousStatus = rows[0].estado;

    if (!["pendiente", "confirmada"].includes(previousStatus)) {
      return { found: true, cancelled: false };
    }

    await db.query(
      `UPDATE cita
             SET estado = 'cancelada'
             WHERE id_cita = $1`,
      [id],
    );

    await db.query(
      `INSERT INTO cita_historial_estado (
                id_cita,
                estado_anterior,
                estado_nuevo,
                origen
            )
            VALUES ($1, $2, 'cancelada', 'cliente')`,
      [id, previousStatus],
    );

    return { found: true, cancelled: true };
  });
}

// EXPORTAR FUNCIONES

module.exports = {
  findAllByClient,
  findByIdForClient,
  getAvailability,
  create,
  cancel,
};
