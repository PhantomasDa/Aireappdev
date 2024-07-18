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
    const { id, nombre, email, telefono } = req.body;

    // Log para verificar los datos recibidos
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


module.exports = router;
