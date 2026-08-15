const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'store_ratings',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    timezone: 'Z',
});

async function query(text, values = []) {
    const [result] = await pool.query(text, values);

    if (Array.isArray(result)) {
        return {
            rows: result,
            rowCount: result.length,
            insertId: null,
            affectedRows: null,
        };
    }

    return {
        rows: [],
        rowCount: Number(result?.affectedRows ?? 0),
        insertId: result?.insertId ?? null,
        affectedRows: Number(result?.affectedRows ?? 0),
    };
}

module.exports = { query, end: () => pool.end(), pool };
