const mysql = require('mysql2');

const pool = mysql.createPool({
  host: '127.0.0.1',           // Usualmente 'localhost' para desarrollo local
  user: 'root',          // Tu nombre de usuario de MySQL
  database: 'aire_pilates', // El nombre de tu base de datos
  password: ''    // Tu contraseña de MySQL
});

module.exports = pool.promise();


