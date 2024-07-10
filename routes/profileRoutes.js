const express = require('express');
const { verifyToken } = require('../routes/auth'); // Asegúrate de que la ruta a auth.js sea correcta
const router = express.Router();

router.get('/profile', verifyToken, (req, res) => {
    res.render('profile', { user: req.user });
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


module.exports = router;
