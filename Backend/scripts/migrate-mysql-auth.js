require('dotenv').config();

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function migrateAuthenticationSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'store_ratings',
    });

    try {
        const [columns] = await connection.query('SHOW COLUMNS FROM users');
        const names = new Set(columns.map((column) => column.Field));

        if (names.has('password') && !names.has('password_hash')) {
            await connection.query('ALTER TABLE users CHANGE password password_hash VARCHAR(255) NOT NULL');
        }

        if (!names.has('updated_at')) {
            await connection.query('ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
        }

        for (const table of ['stores', 'ratings']) {
            const [tableColumns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
            if (!tableColumns.some((column) => column.Field === 'updated_at')) {
                await connection.query(`ALTER TABLE ${table} ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
            }
        }

        // The legacy schema has integer primary keys without AUTO_INCREMENT,
        // which makes every create request fail unless an ID is supplied.
        for (const table of ['users', 'stores', 'ratings']) {
            await connection.query(`ALTER TABLE ${table} MODIFY id INT NOT NULL AUTO_INCREMENT`);
        }

        // Preserve existing accounts while moving the legacy `normal` role to
        // the role name used by the API and frontend.
        await connection.query("ALTER TABLE users MODIFY role ENUM('admin', 'normal', 'user', 'owner') NOT NULL DEFAULT 'user'");
        await connection.query("UPDATE users SET role = 'user' WHERE role = 'normal'");
        await connection.query("ALTER TABLE users MODIFY role ENUM('admin', 'user', 'owner') NOT NULL DEFAULT 'user'");

        const [admins] = await connection.execute('SELECT id FROM users WHERE email = ?', ['admin@gmail.com']);
        if (admins.length === 0) {
            const passwordHash = await bcrypt.hash('Admin@123', 10);
            await connection.execute(
                'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
                ['System Admin', 'admin@gmail.com', passwordHash, '123 Admin Street', 'admin']
            );
            console.log('Created demo admin: admin@gmail.com');
        } else {
            console.log('Demo admin already exists; its password was not changed.');
        }

        const [demoUsers] = await connection.execute('SELECT id FROM users WHERE email = ?', ['user@demo.com']);
        if (demoUsers.length === 0) {
            const passwordHash = await bcrypt.hash('User@123', 10);
            await connection.execute(
                'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
                ['Demo Standard User Account', 'user@demo.com', passwordHash, '123 Demo Street', 'user']
            );
            console.log('Created demo user: user@demo.com');
        }

        console.log('Authentication schema migration completed.');
    } finally {
        await connection.end();
    }
}

migrateAuthenticationSchema().catch((error) => {
    console.error('Authentication schema migration failed:', error.message);
    process.exitCode = 1;
});
