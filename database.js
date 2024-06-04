const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'monorail.proxy.rlwy.net',           // Usualmente 'localhost' para desarrollo local
  user: 'root',          // Tu nombre de usuario de MySQL
  database: 'railway', // El nombre de tu base de datos
  password: 'rYINgliljKscMNNaWvuFzWkYMhKtbjXh'    // Tu contraseña de MySQL
});

module.exports = pool.promise();


