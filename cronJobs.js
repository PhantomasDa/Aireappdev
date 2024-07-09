const cron = require('node-cron');
const db = require('./database'); // Ajusta el path a tu configuración de base de datos

// Función del cron job
async function activatePackages() {
    try {
        console.log('Iniciando activación de paquetes:', new Date());

        // Obtener renovaciones que deben ser activadas hoy
        const [rows] = await db.execute('SELECT * FROM renovaciones WHERE activado = 0');
        console.log('Renovaciones encontradas:', rows.length);
        console.log(rows);

        for (const row of rows) {
            const { id, usuario_id, num_clases, fecha_activacion, fecha_expiracion } = row;
            console.log(`Procesando renovación ID ${id} para el usuario ID ${usuario_id} con ${num_clases} clases. Fecha de activación: ${fecha_activacion}`);

            // Verificar si la fecha de activación es anterior o igual a ahora
            if (new Date(fecha_activacion) > new Date()) {
                console.log(`Renovación ID ${id} aún no está lista para activarse. Fecha de activación: ${fecha_activacion}`);
                continue;
            }

            // Verificar si num_clases es válido
            if (num_clases === null) {
                console.error(`Renovación ID ${id} tiene num_clases nulo. Saltando.`);
                continue;
            }

            // Obtener las clases disponibles actuales del usuario
            const [userRows] = await db.execute('SELECT clases_disponibles FROM Usuarios WHERE id = ?', [usuario_id]);
            const currentClasesDisponibles = userRows.length > 0 ? userRows[0].clases_disponibles : null;
            console.log(`Clases disponibles actuales para el usuario ID ${usuario_id}:`, currentClasesDisponibles);

            // Actualizar las clases disponibles del usuario
            const [updateResult] = await db.execute('UPDATE Usuarios SET clases_disponibles = IFNULL(clases_disponibles, 0) + ? WHERE id = ?', [num_clases, usuario_id]);
            console.log(`Actualización de clases para el usuario ID ${usuario_id} resultó en:`, updateResult);

            // Verificar la actualización en la tabla usuarios
            const [updatedUserRows] = await db.execute('SELECT clases_disponibles FROM Usuarios WHERE id = ?', [usuario_id]);
            const updatedClasesDisponibles = updatedUserRows.length > 0 ? updatedUserRows[0].clases_disponibles : null;
            console.log(`Clases disponibles actualizadas para el usuario ID ${usuario_id}:`, updatedClasesDisponibles);

            // Actualizar la fecha de expiración en la tabla Paquetes
            const [updatePaqueteResult] = await db.execute('UPDATE paquetes SET fecha_expiracion = ? WHERE usuario_id = ?', [fecha_expiracion, usuario_id]);
            console.log(`Actualización de fecha de expiración en la tabla Paquetes para el usuario ID ${usuario_id} resultó en:`, updatePaqueteResult);

            // Verificar la actualización en la tabla Paquetes
            const [updatedPaqueteRows] = await db.execute('SELECT fecha_expiracion FROM paquetes WHERE usuario_id = ?', [usuario_id]);
            const updatedFechaExpiracion = updatedPaqueteRows.length > 0 ? updatedPaqueteRows[0].fecha_expiracion : null;
            console.log(`Fecha de expiración del paquete actualizada para el usuario ID ${usuario_id}:`, updatedFechaExpiracion);

            // Marcar la renovación como activada
            const [updateRenovacionResult] = await db.execute('UPDATE renovaciones SET activado = 1 WHERE id = ?', [id]);
            console.log(`Actualización de activado para la renovación ID ${id} resultó en:`, updateRenovacionResult);

            console.log(`Paquete activado para el usuario ${usuario_id} con ${num_clases} clases añadidas.`);
        }

        console.log('Verificación completa:', new Date());
    } catch (error) {
        console.error('Error activando paquetes:', error);
    }
}

// // Cron job para activar paquetes cada 30 segundos
cron.schedule('*/100 * * * * *', activatePackages);

// Exportar la función de prueba para poder ejecutarla manualmente
module.exports = { activatePackages };
