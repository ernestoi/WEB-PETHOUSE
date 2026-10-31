const POSTGRES_ERRORS = {
    '23505': { status: 409, message: 'El registro ya existe' },
    '23503': { status: 409, message: 'El registro está relacionado con otros datos' },
    '23502': { status: 400, message: 'Falta un dato obligatorio' },
    '23514': { status: 400, message: 'Uno de los valores no es válido' },
    '23P01': { status: 409, message: 'El horario se cruza con otra cita' },
    '22P02': { status: 400, message: 'Formato de dato inválido' },
    '22001': { status: 400, message: 'Un valor excede la longitud permitida' },
    '22003': { status: 400, message: 'Un valor numérico está fuera de rango' },
};

function errorHandler(err, req, res, next) {
    if (err.isOperational) {
        return res.status(err.statusCode).json({ status: 'error', message: err.message });
    }

    const dbError = POSTGRES_ERRORS[err.code];
    if (dbError) {
        return res.status(dbError.status).json({ status: 'error', message: dbError.message });
    }

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ status: 'error', message: 'JSON inválido' });
    }

    console.error(err);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
}

module.exports = errorHandler;