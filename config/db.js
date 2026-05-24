const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_vibely',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false // Wajib untuk koneksi ke cloud database!
    }
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Koneksi ke database cloud gagal:', err.message);
    } else {
        console.log('Sukses tersambung ke database cloud Aiven!');
        connection.release();
    }
});

module.exports = pool.promise();