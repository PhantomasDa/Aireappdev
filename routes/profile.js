const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database'); // Asegúrate de que la ruta al archivo de base de datos sea correcta
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const multer = require('multer'); // Añadir esta línea para importar multer
const path = require('path'); // Añadir esta línea para importar path
const { body, validationResult } = require('express-validator'); // Importar body y validationResult desde express-validator


// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('destination callback');
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        console.log('filename callback');
        console.log('req.body:', req.body);
        console.log('file:', file);
        
        // Usar el nombre de archivo enviado desde el frontend
        const filename = req.body.foto_perfil || `${Date.now()}-${file.originalname}`;
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

// Configuración para manejar múltiples campos
const uploadFields = upload.fields([
    { name: 'foto_perfil', maxCount: 1 },
    { name: 'comprobante_pago', maxCount: 1 }
]);



// Obtener modalidad del usuario
router.get('/modalidad', verifyToken, (req, res) => {
    const query = 'SELECT modalidad FROM Usuarios WHERE id = ?';
    const params = [req.user.id];
    executeQuery(query, params, res, (result) => {
        if (result.length > 0) {
            res.json({ modalidad: result[0].modalidad });
        } else {
            res.status(404).send({ message: 'Modalidad no encontrada para este usuario' });
        }
    });
});


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
    const query = 'SELECT nombre, foto_perfil, modalidad FROM Usuarios WHERE id = ?';
    const params = [req.user.id];
    executeQuery(query, params, res, (result) => {
        if (result.length > 0) {
            const usuario = result[0];
            // Verifica la ruta base de la imagen
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
    console.log('Datos recibidos para reagendar:', { claseId, nuevaFecha });

    if (!claseId || !nuevaFecha) {
        console.log('Datos incompletos');
        return res.status(400).send({ message: 'Datos incompletos' });
    }

    const nuevaFechaObj = new Date(nuevaFecha);
    const ahora = new Date();
    const diferenciaHoras = (nuevaFechaObj - ahora) / (1000 * 60 * 60);

    if (diferenciaHoras < 18) {
        console.log('Intento de reagendamiento con menos de 18 horas de anticipación');
        return res.status(400).send({ message: 'Lo sentimos, pero solo puedes reservar clases con un mínimo de 18 horas de anticipación.' });
    }

    try {
        const [claseData] = await db.execute('SELECT fecha_hora FROM Clases WHERE id = ?', [claseId]);
        if (claseData.length === 0) {
            console.log('Clase no encontrada');
            return res.status(400).send({ message: 'Clase no encontrada' });
        }

        const [checkSameDay] = await db.execute(
            'SELECT COUNT(*) as count FROM Reservas r JOIN Clases c ON r.clase_id = c.id WHERE r.usuario_id = ? AND DATE(c.fecha_hora) = DATE(?)',
            [req.user.id, nuevaFechaObj]
        );

        if (checkSameDay[0].count > 0) {
            console.log('Ya tienes una clase registrada en esta fecha');
            return res.status(400).send({ message: 'Ya tienes una clase registrada en esta fecha' });
        }

        const [result] = await db.execute(
            'UPDATE Clases SET cupos_disponibles = cupos_disponibles - 1 WHERE id = ? AND cupos_disponibles > 0',
            [claseId]
        );

        if (result.affectedRows > 0) {
            await db.execute(
                'UPDATE Reservas SET clase_id = ?, fecha_reserva = NOW() WHERE usuario_id = ? AND clase_id = ?',
                [claseId, req.user.id, claseId]
            );

            console.log('Clase reagendada exitosamente');
            res.json({ message: 'Clase reagendada exitosamente', fecha: claseData[0].fecha_hora });
        } else {
            console.log('No hay cupos disponibles');
            res.status(400).send({ message: 'No hay cupos disponibles' });
        }
    } catch (error) {
        console.error('Error durante el reagendamiento:', error);
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



router.get('/disponibilidad-clases', verifyToken, async (req, res) => {
    const { year } = req.query;

    try {
        const [clases] = await db.execute(`
            SELECT DATE(fecha_hora) as fecha, SUM(cupos_disponibles) as cupos_disponibles
            FROM Clases
            WHERE YEAR(fecha_hora) = ?
            GROUP BY DATE(fecha_hora)
        `, [year]);

        console.log('Clases disponibles:', clases); // Depurar resultados de la consulta
        res.json(clases);
    } catch (error) {
        console.error('Error obteniendo disponibilidad de clases:', error);
        res.status(500).json({ message: 'Error obteniendo disponibilidad de clases' });
    }
});


// Obtener fecha de expiración del paquete
router.get('/fecha-expiracion-paquete', verifyToken, (req, res) => {
    const query = 'SELECT fecha_expiracion FROM paquetes WHERE usuario_id = ? ORDER BY fecha_activacion DESC LIMIT 1';
    const params = [req.user.id];
    executeQuery(query, params, res, (result) => {
        if (result.length > 0) {
            res.json({ fecha_expiracion: result[0].fecha_expiracion });
        } else {
            res.status(404).send({ message: 'No hay paquete activo para este usuario' });
        }
    });
});



router.get('/estado-paquete', verifyToken, (req, res) => {
    const query = 'SELECT fecha_activacion FROM paquetes WHERE usuario_id = ? ORDER BY fecha_activacion DESC LIMIT 1';
    const params = [req.user.id];
    executeQuery(query, params, res, (result) => {
        if (result.length > 0) {
            const fechaActivacion = new Date(result[0].fecha_activacion);
            const fechaActual = new Date();
            
            if (fechaActual >= fechaActivacion) {
                res.json({ estado: 'Activo' });
            } else {
                res.json({ estado: 'Inactivo' });
            }
        } else {
            res.status(404).send({ message: 'No hay paquete disponible para este usuario' });
        }
    });
});


router.get('/clases-agendadas', verifyToken, async (req, res) => {
    const { year } = req.query;

    try {
        const [clases] = await db.execute(`
            SELECT DATE(c.fecha_hora) as fecha
            FROM Clases c
            JOIN Reservas r ON c.id = r.clase_id
            WHERE r.usuario_id = ? AND YEAR(c.fecha_hora) = ?
        `, [req.user.id, year]);

        console.log('Clases agendadas:', clases); // Depurar resultados de la consulta
        res.json(clases);
    } catch (error) {
        console.error('Error obteniendo clases agendadas:', error);
        res.status(500).json({ message: 'Error obteniendo clases agendadas' });
    }
});




// Obtener el ID del usuario
router.get('/user-id', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('ID del usuario:', userId);
        res.json({ userId });
    } catch (error) {
        console.error('Error obteniendo el ID del usuario:', error);
        res.status(500).json({ message: 'Error obteniendo el ID del usuario' });
    }
});


router.post('/renovacion-paquete', upload.single('comprobante_pago'), [
    body('userId').isInt().notEmpty().withMessage('Invalid userId'),
    body('paquete').isIn(['Paquete básico', 'Paquete completo', 'Paquete premium']).withMessage('Invalid paquete')
], async (req, res) => {
    console.log('Campos recibidos:', req.body, req.file);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Errores de validación:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, paquete, fechaActivacion, fechaExpiracion } = req.body;
    const comprobantePago = req.file ? req.file.filename : null;

    if (!comprobantePago) {
        console.error('No se recibió el comprobante de pago.');
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    console.log('Datos después de la validación:', {
        userId,
        paquete,
        comprobantePago,
        fechaActivacion,
        fechaExpiracion
    });

    let clasesDisponibles, maxReagendamientos;
    switch (paquete) {
        case 'Paquete básico':
            clasesDisponibles = 4;
            maxReagendamientos = 2;
            break;
        case 'Paquete completo':
            clasesDisponibles = 8;
            maxReagendamientos = 3;
            break;
        case 'Paquete premium':
            clasesDisponibles = 12;
            maxReagendamientos = 4;
            break;
        default:
            console.error('Paquete inválido:', paquete);
            return res.status(400).json({ message: 'Paquete inválido' });
    }

    const fechaCompra = new Date();

    try {
        console.log('Preparando para insertar datos de la renovación:', { userId, fechaCompra, fechaActivacion, fechaExpiracion, maxReagendamientos, clasesDisponibles, paquete, comprobantePago });
        await db.execute('INSERT INTO renovaciones (usuario_id, paquete, comprobante_pago, fecha_compra, fecha_activacion, fecha_expiracion, max_reagendamientos, num_clases, activado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [userId, paquete, comprobantePago, fechaCompra, fechaActivacion, fechaExpiracion, maxReagendamientos, clasesDisponibles, 0]);

        res.status(200).json({ message: 'Renovación de paquete registrada exitosamente' });
    } catch (error) {
        console.error('Error al registrar la renovación del paquete:', error);
        res.status(500).json({ message: 'Error al registrar la renovación del paquete', error: error.message });
    }
});



router.post('/validar-fecha', verifyToken, (req, res) => {
    const { fechaSeleccionada } = req.body;
    const userId = req.user.id;
    
    const query = 'SELECT fecha_expiracion FROM paquetes WHERE usuario_id = ? ORDER BY fecha_activacion DESC LIMIT 1';
    db.execute(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Paquete no encontrado' });
        }

        const fechaExpiracionPaquete = new Date(results[0].fecha_expiracion);
        const fechaSeleccionadaDate = new Date(fechaSeleccionada);

        if (fechaSeleccionadaDate > fechaExpiracionPaquete) {
            return res.status(400).json({ message: `No puedes reservar una clase después de la fecha de expiración de tu paquete (${fechaExpiracionPaquete.toLocaleDateString('es-ES')}).` });
        }

        res.json({ message: 'Fecha válida' });
    });
});



module.exports = router;
