const pool = require('../config/db');

async function withTransaction(callback) {
    const db = await pool.connect();
    try {
        await db.query('BEGIN');
        const result = await callback(db);
        await db.query('COMMIT');
        return result;
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    } finally {
        db.release();
    }
}

module.exports = withTransaction;