const express = require('express');
const router = express.Router();
const db = require('../database');
// const { verifyToken } = require('../middleware/auth');

// Obtener clases y usuarios por día
router.get('/clases-usuarios', /*verifyToken,*/ async (req, res) => {
    const { fecha } = req.query;

    const queryClases = `
        SELECT c.id, c.fecha_hora, c.cupos_max, c.cupos_disponibles
        FROM Clases c
        WHERE DATE(c.fecha_hora) = ?
    `;
    const queryUsuarios = `
        SELECT r.clase_id, u.id AS usuario_id, u.nombre, u.email, u.telefono
        FROM Reservas r
        JOIN Usuarios u ON r.usuario_id = u.id
        WHERE r.clase_id IN (SELECT id FROM Clases WHERE DATE(fecha_hora) = ?)
    `;

    try {
        const [clases] = await db.execute(queryClases, [fecha]);
        const [usuarios] = await db.execute(queryUsuarios, [fecha]);

        const clasesConUsuarios = clases.map(clase => {
            return {
                ...clase,
                usuarios: usuarios.filter(usuario => usuario.clase_id === clase.id)
            };
        });

        res.json(clasesConUsuarios);
    } catch (error) {
        console.error('Error al obtener clases y usuarios:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// Nueva ruta para obtener todos los usuarios
router.get('/usuarios', /*verifyToken,*/ async (req, res) => {
    const queryUsuarios = `
        SELECT id, nombre, email, password, fecha_registro, foto_perfil, paquete, clases_disponibles, telefono, lesiones, motivacion, pregunta1, pregunta2, pregunta3, pregunta4, fecha_nacimiento, genero, comprobante_pago, rol
        FROM Usuarios
    `;

    try {
        const [usuarios] = await db.execute(queryUsuarios);
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// Nueva ruta para actualizar los usuarios
router.post('/actualizar-usuarios', /*verifyToken,*/ async (req, res) => {
    const { cambios } = req.body;

    const updateQueries = cambios.map(cambio => {
        return db.execute(`UPDATE Usuarios SET ${cambio.field} = ? WHERE id = ?`, [cambio.value, cambio.id]);
    });

    try {
        await Promise.all(updateQueries);
        res.status(200).send({ message: 'Usuarios actualizados correctamente' });
    } catch (error) {
        console.error('Error al actualizar usuarios:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

module.exports = router;
