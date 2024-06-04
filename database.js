const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000 // Ajuste de tiempo de espera en milisegundos
});

module.exports = pool.promise();