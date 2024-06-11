 const mysql = require('mysql2');
 const pool = mysql.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   port: process.env.DB_PORT,
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0,
   connectTimeout: 100000 // Aumenta el tiempo de espera a 10 segundos
 });

// Probar la conexión al iniciar la aplicación
 pool.getConnection((err, connection) => {
   if (err) {
     console.error('Error de conexión a la base de datos:', err);
   } else {
     console.log('Conexión exitosa a la base de datos');
     connection.release(); // Liberar la conexión si es exitosa
   }
 });

 pool.on('connection', (connection) => {
   console.log('Nueva conexión a la base de datos');
   connection.on('error', (err) => {
     console.error('Error en la conexión de la base de datos:', err);
   });
   connection.on('end', () => {
     console.log('Conexión a la base de datos terminada');
   });
 });

 module.exports = pool.promise();



// const mysql = require('mysql2');

// const pool = mysql.createPool({
//   host: '127.0.0.1',           // Usualmente 'localhost' para desarrollo local
//   user: 'root',          // Tu nombre de usuario de MySQL
//   database: 'aire_pilates', // El nombre de tu base de datos
//   password: ''    // Tu contraseña de MySQL
// });

// module.exports = pool.promise();


