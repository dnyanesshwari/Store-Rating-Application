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
});

// Route modules were authored with PostgreSQL-style numbered placeholders and
// expect `pool.query()` to return a `{ rows }` object.  Keep that small API at
// the database boundary while using the configured MySQL server.
async function query(text, values = []) {
    const params = [];
    let sql = text
        .replace(/\$(\d+)/g, (_, position) => {
            params.push(values[Number(position) - 1]);
            return '?';
        })
        .replace(/\bILIKE\b/gi, 'LIKE');

    const returning = sql.match(/\s+RETURNING\s+(.+?)\s*;?\s*$/i);
    if (returning) {
        sql = sql.slice(0, returning.index);
    }

    const [result] = await pool.query(sql, params);

    if (!returning) {
        return {
            rows: Array.isArray(result) ? result : [],
            rowCount: Array.isArray(result) ? result.length : result.affectedRows,
        };
    }

    // MySQL has no RETURNING clause.  Fetch the newly inserted row by its
    // natural key for the inserts used by this application.
    const table = sql.match(/^\s*INSERT\s+INTO\s+([\w`]+)/i)?.[1];
    const columns = sql.match(/^\s*INSERT\s+INTO\s+[\w`]+\s*\(([^)]+)\)/i)?.[1]
        .split(',')
        .map((column) => column.trim().replace(/`/g, '')) || [];
    const requestedColumns = returning[1];
    const emailIndex = columns.indexOf('email');

    if (table && emailIndex >= 0) {
        const [rows] = await pool.query(
            `SELECT ${requestedColumns} FROM ${table} WHERE email = ? LIMIT 1`,
            [params[emailIndex]]
        );
        return { rows, rowCount: rows.length };
    }

    return { rows: [], rowCount: result.affectedRows };
}

module.exports = { query, end: () => pool.end() };
