const express = require('express');
const router = express.Router();
const db = require('../database');
const { body, validationResult } = require('express-validator');

router.get('/clases-usuarios-mes', async (req, res) => {
    const { mes, ano } = req.query;

    const inicioMes = new Date(ano, mes - 1, 1);
    const finMes = new Date(ano, mes, 0);

    const queryClases = `
        SELECT c.id, c.fecha_hora, c.cupos_max, c.cupos_disponibles
        FROM Clases c
        WHERE c.fecha_hora BETWEEN ? AND ?
    `;
    const queryUsuarios = `
        SELECT r.clase_id, u.id AS usuario_id, u.nombre, u.email, u.telefono
        FROM Reservas r
        JOIN Usuarios u ON r.usuario_id = u.id
        WHERE r.clase_id IN (SELECT id FROM Clases WHERE fecha_hora BETWEEN ? AND ?)
    `;

    try {
        const [clases] = await db.execute(queryClases, [inicioMes, finMes]);
        const [usuarios] = await db.execute(queryUsuarios, [inicioMes, finMes]);

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

router.post('/actualizar-usuario', async (req, res) => {
    const { id, nombre, email, telefono, clases_disponibles, fecha_activacion, fecha_expiracion } = req.body;

    console.log('Datos recibidos en el servidor:', req.body);

    if (!id) {
        return res.status(400).json({ message: 'ID de usuario es obligatorio' });
    }

    const campos = [];
    const valores = [];

    if (nombre) {
        campos.push('nombre = ?');
        valores.push(nombre);
    }
    if (email) {
        campos.push('email = ?');
        valores.push(email);
    }
    if (telefono) {
        campos.push('telefono = ?');
        valores.push(telefono);
    }
    if (clases_disponibles) {
        campos.push('clases_disponibles = ?');
        valores.push(clases_disponibles);
    }
    if (fecha_activacion) {
        campos.push('fecha_activacion = ?');
        valores.push(fecha_activacion);
    }
    if (fecha_expiracion) {
        campos.push('fecha_expiracion = ?');
        valores.push(fecha_expiracion);
    }

    if (campos.length === 0) {
        return res.status(400).json({ message: 'No hay cambios para actualizar' });
    }

    valores.push(id);

    const query = `
        UPDATE Usuarios 
        SET ${campos.join(', ')}
        WHERE id = ?
    `;

    console.log('Query:', query);
    console.log('Valores:', valores);

    try {
        await db.execute(query, valores);
        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});



router.post('/eliminar-clase-usuario', async (req, res) => {
    const { usuarioId, claseId } = req.body;

    if (!usuarioId || !claseId) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
        const [result] = await db.execute(
            'DELETE FROM Reservas WHERE usuario_id = ? AND clase_id = ?',
            [usuarioId, claseId]
        );

        if (result.affectedRows > 0) {
            res.json({ message: 'Clase eliminada correctamente' });
        } else {
            res.status(404).json({ message: 'Reserva no encontrada' });
        }
    } catch (error) {
        console.error('Error al eliminar la clase:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});


module.exports = router;
