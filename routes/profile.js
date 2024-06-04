const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database'); // Asegúrate de que la ruta al archivo de base de datos sea correcta
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Middleware para verificar el token
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('No autorizado');
    }
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;  // Guardar usuario decodificado en la solicitud para su uso posterior
        console.log('Token verificado:', decoded);
        next();
    } catch (error) {
        console.error('Error verificando token:', error);
        res.status(401).send({ message: 'Token inválido', error: error.message });
    }
}


// Utilidad para ejecutar consultas de base de datos y manejar errores
async function executeQuery(query, params, res, successCallback) {
    try {
        console.log('Ejecutando consulta:', query, 'con parámetros:', params);
        const [result] = await db.execute(query, params);
        console.log('Resultado de la consulta:', result);
        successCallback(result);
    } catch (error) {
        console.error('Error durante la consulta:', error);
        res.status(500).send({ message: 'Error en el servidor', error: error.message });
    }
}

// Obtener información del usuario
router.get('/usuario', verifyToken, (req, res) => {
    const query = 'SELECT nombre, foto_perfil FROM Usuarios WHERE id = ?';
    const params = [req.user.id];
    executeQuery(query, params, res, (result) => {
        if (result.length > 0) {
            const usuario = result[0];
            // Prepend the base URL to the photo path
            usuario.foto_perfil = `/uploads/${usuario.foto_perfil}`;
            res.json(usuario);
        } else {
            res.status(404).send({ message: 'Usuario no encontrado' });
        }
    });
});

// Reagendar clase
router.post('/reagendar', verifyToken, async (req, res) => {
    const { claseId, nuevaFecha } = req.body;
    console.log('Datos recibidos en /reagendar:', { claseId, nuevaFecha });

    // Verificar que la nueva fecha no sea anterior a hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const nuevaFechaDate = new Date(nuevaFecha);
    console.log('Fecha actual:', hoy.toISOString());
    console.log('Nueva fecha para reagendar:', nuevaFechaDate.toISOString());

    if (nuevaFechaDate < hoy) {
        console.log('Error: No se puede reagendar a una fecha anterior a hoy');
        return res.status(400).send({ message: 'No se puede reagendar a una fecha anterior a hoy' });
    }

    try {
        const [reserva] = await db.execute('SELECT reagendamientos, clase_id FROM Reservas WHERE usuario_id = ? AND clase_id = ?', [req.user.id, claseId]);
        if (reserva.length === 0) {
            console.log('Error: Reserva no encontrada');
            return res.status(400).send({ message: 'Reserva no encontrada' });
        }

        console.log('Reserva encontrada:', reserva);

        if (reserva[0].reagendamientos >= 2) {
            console.log('Error: Has superado el número de veces que puedes reagendar esta clase');
            return res.status(400).send({ message: 'Has superado el número de veces que puedes reagendar esta clase' });
        }

        const nuevaFechaSimplificada = new Date(nuevaFecha);
        nuevaFechaSimplificada.setSeconds(0, 0);

        console.log('Nueva fecha simplificada para consulta:', nuevaFechaSimplificada);

        const [nuevaClase] = await db.execute(`SELECT id, cupos_disponibles 
                                               FROM Clases 
                                               WHERE fecha_hora_simplificada = ? 
                                               LIMIT 1`, [nuevaFechaSimplificada]);
        if (nuevaClase.length === 0) {
            console.log('Error: Fecha no válida para reagendar');
            return res.status(400).send({ message: 'Fecha no válida para reagendar' });
        }

        console.log('Nueva clase encontrada:', nuevaClase);

        if (nuevaClase[0].cupos_disponibles <= 0) {
            console.log('Error: No hay cupos disponibles en la nueva clase');
            return res.status(400).send({ message: 'No hay cupos disponibles en la nueva clase' });
        }

        // Iniciar transacción
        await db.query('START TRANSACTION');

        try {
            console.log('Actualizando cupos de la nueva clase');
            await db.execute('UPDATE Clases SET cupos_disponibles = cupos_disponibles - 1 WHERE id = ?', [nuevaClase[0].id]);
            
            console.log('Actualizando cupos de la clase actual');
            await db.execute('UPDATE Clases SET cupos_disponibles = cupos_disponibles + 1 WHERE id = ?', [reserva[0].clase_id]);
            
            console.log('Actualizando la reserva con la nueva clase');
            await db.execute('UPDATE Reservas SET clase_id = ?, reagendamientos = reagendamientos + 1 WHERE usuario_id = ? AND clase_id = ?', [nuevaClase[0].id, req.user.id, claseId]);

            // Confirmar transacción
            await db.query('COMMIT');
            console.log('Clase reagendada exitosamente');
            res.json({ message: 'Clase reagendada exitosamente' });
        } catch (error) {
            console.error('Error durante el reagendamiento:', error);
            // Revertir transacción en caso de error
            await db.query('ROLLBACK');
            res.status(500).send({ message: 'Error en el servidor', error: error.message });
        }
    } catch (error) {
        console.error('Error durante la consulta:', error);
        res.status(500).send({ message: 'Error en el servidor', error: error.message });
    }
});

// Obtener horarios disponibles filtrados por fecha
router.get('/horarios', verifyToken, (req, res) => {
    const { fecha } = req.query;
    const query = 'SELECT * FROM Clases WHERE DATE(fecha_hora) = ? ORDER BY fecha_hora';
    executeQuery(query, [fecha], res, (clases) => res.json(clases));
});

// Obtener número de clases disponibles
router.get('/clases-disponibles', verifyToken, (req, res) => {
    const query = 'SELECT clases_disponibles FROM Usuarios WHERE id = ?';
    const params = [req.user.id];
    executeQuery(query, params, res, (result) => {
        if (result.length > 0) {
            res.json({ clases_disponibles: result[0].clases_disponibles });
        } else {
            res.status(404).send({ message: 'Información de clases no disponible para este usuario' });
        }
    });
});

// Obtener próximas clases agendadas
router.get('/proximas-clases', verifyToken, (req, res) => {
    const query = `
        SELECT c.id, c.fecha_hora 
        FROM Clases c 
        JOIN Reservas r ON c.id = r.clase_id 
        WHERE r.usuario_id = ? AND c.fecha_hora > NOW() 
        ORDER BY c.fecha_hora
    `;
    executeQuery(query, [req.user.id], res, (clases) => res.json(clases.length ? clases : []));
});

// Reservar clase
router.post('/reservar', verifyToken, async (req, res) => {
    const { claseId } = req.body;
    try {
        const [claseData] = await db.execute('SELECT fecha_hora FROM Clases WHERE id = ?', [claseId]);
        if (claseData.length === 0) {
            return res.status(400).send({ message: 'Clase no encontrada' });
        }
        const fechaClase = new Date(claseData[0].fecha_hora);

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(hoy.getDate() + 1);

        if (fechaClase < manana) {
            return res.status(400).send({ message: 'No se pueden reservar clases para fechas anteriores al día siguiente' });
        }

        const [checkSameDay] = await db.execute(
            'SELECT COUNT(*) as count FROM Reservas r JOIN Clases c ON r.clase_id = c.id WHERE r.usuario_id = ? AND DATE(c.fecha_hora) = DATE(?)',
            [req.user.id, fechaClase]
        );

        if (checkSameDay[0].count > 0) {
            return res.status(400).send({ message: 'Ya tienes una clase registrada en esta fecha' });
        }

        const [checkResult] = await db.execute(
            'SELECT COUNT(*) as count FROM Reservas WHERE usuario_id = ? AND clase_id = ?',
            [req.user.id, claseId]
        );

        if (checkResult[0].count > 0) {
            return res.status(400).send({ message: 'Ya estás registrado en esta clase' });
        }

        const [result] = await db.execute(
            'UPDATE Clases SET cupos_disponibles = cupos_disponibles - 1 WHERE id = ? AND cupos_disponibles > 0',
            [claseId]
        );

        if (result.affectedRows > 0) {
            await db.execute(
                'INSERT INTO Reservas (usuario_id, clase_id, fecha_reserva) VALUES (?, ?, NOW())',
                [req.user.id, claseId]
            );

            await db.execute(
                'UPDATE Usuarios SET clases_disponibles = clases_disponibles - 1 WHERE id = ? AND clases_disponibles > 0',
                [req.user.id]
            );

            // Enviar la fecha de la clase en la respuesta
            res.json({ message: 'Reserva confirmada', fecha: claseData[0].fecha_hora });
        } else {
            res.status(400).send({ message: 'No hay cupos disponibles' });
        }
    } catch (error) {
        console.error('Error durante la reserva:', error);
        res.status(500).send({ message: 'Error en el servidor', error: error.message });
    }
});

// Obtener fechas posibles para reagendar una clase
router.get('/fechas-reagendar/:claseId', verifyToken, (req, res) => {
    const { claseId } = req.params;
    console.log('Obteniendo fechas para reagendar para la clase ID:', claseId);

    executeQuery('SELECT fecha_hora, cupos_disponibles FROM Clases WHERE fecha_hora > NOW() AND id != ? ORDER BY fecha_hora', [claseId], res, (fechas) => {
        if (fechas.length === 0) {
            console.log('No se encontraron fechas para reagendar');
            return res.status(404).send({ message: 'No se encontraron fechas para reagendar' });
        }

        console.log('Fechas para reagendar encontradas:', fechas);
        res.json(fechas);
    });
});

// Ruta protegida para el perfil
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.session.user });
});

module.exports = router;
