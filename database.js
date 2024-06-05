const mysql = require('mysql2');

const pool = mysql.createPool({
  host: "monorail.proxy.rlwy.net",
  user: "root",
  password: "rYINgliljKscMNNaWvuFzWkYMhKtbjXh",
  database: "railway",
});

// Probar la conexión al iniciar la aplicación
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    // Mensajes adicionales para diagnóstico
    if (err.code === 'ETIMEDOUT') {
      console.error('Error: La conexión ha superado el tiempo de espera. Verifica la red y el servidor de la base de datos.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('Error: La conexión fue rechazada. Asegúrate de que el servidor de la base de datos esté funcionando y permita conexiones.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Error: Acceso denegado. Verifica las credenciales de la base de datos.');
    } else {
      console.error('Error desconocido:', err);
    }
  } else {
    console.log('Conexión exitosa a la base de datos');
    connection.release(); // Liberar la conexión si es exitosa
  }
});

module.exports = pool.promise();
