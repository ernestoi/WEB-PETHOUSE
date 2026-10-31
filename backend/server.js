require('dotenv').config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET no está definido o es demasiado corto');
    process.exit(1);
}

const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 3000;

pool.query('SELECT 1')
    .then(() => {
        console.log('Conectado a la base de datos');
        app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
    })
    .catch((error) => {
        console.error('Error al conectar a la base de datos:', error.message);
        process.exit(1);
    });