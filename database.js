const mysql = require('mysql2');

const pool = mysql.createPool({
  host: monorail.proxy.rlwy.net,
  user: root,
  password: rYINgliljKscMNNaWvuFzWkYMhKtbjXh,
  database: railway,
  connectTimeout: 10000 // Aumentar el tiempo de espera a 20 segundos
});

// Probar la conexión al iniciar la aplicación
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    // Mensajes adicionales para diagnóstico
    if (err.code === 'ETIMEDOUT') {
      console.error('Error: La conexión ha superado el tiempo de espera. Verifica la red y el servidor de la base de datos.');
    }
  } else {
    console.log('Conexión exitosa a la base de datos');
    connection.release(); // Liberar la conexión si es exitosa
  }
});

module.exports = pool.promise();
