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
        SELECT r.clase_id, u.id AS usuario_id, u.nombre, u.email, u.telefono, u.clases_disponibles, p.fecha_activacion, p.fecha_expiracion
        FROM Reservas r
        JOIN Usuarios u ON r.usuario_id = u.id
        LEFT JOIN paquetes p ON u.id = p.usuario_id
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

    const camposUsuario = [];
    const valoresUsuario = [];

    if (nombre) {
        camposUsuario.push('nombre = ?');
        valoresUsuario.push(nombre);
    }
    if (email) {
        camposUsuario.push('email = ?');
        valoresUsuario.push(email);
    }
    if (telefono) {
        camposUsuario.push('telefono = ?');
        valoresUsuario.push(telefono);
    }
    if (clases_disponibles) {
        camposUsuario.push('clases_disponibles = ?');
        valoresUsuario.push(clases_disponibles);
    }

    const camposPaquete = [];
    const valoresPaquete = [];

    if (fecha_activacion) {
        camposPaquete.push('fecha_activacion = ?');
        valoresPaquete.push(fecha_activacion);
    }
    if (fecha_expiracion) {
        camposPaquete.push('fecha_expiracion = ?');
        valoresPaquete.push(fecha_expiracion);
    }

    valoresUsuario.push(id);

    const queryUsuario = `
        UPDATE Usuarios 
        SET ${camposUsuario.join(', ')}
        WHERE id = ?
    `;

    const queryPaquete = `
        UPDATE Paquetes 
        SET ${camposPaquete.join(', ')}
        WHERE usuario_id = ?
    `;

    try {
        if (camposUsuario.length > 0) {
            await db.execute(queryUsuario, valoresUsuario);
        }

        if (camposPaquete.length > 0) {
            valoresPaquete.push(id);
            await db.execute(queryPaquete, valoresPaquete);
        }

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

    const connection = await db.getConnection(); // Obtener una conexión de la base de datos

    try {
        await connection.beginTransaction(); // Iniciar una transacción

        // Eliminar la reserva
        const [deleteResult] = await connection.execute(
            'DELETE FROM Reservas WHERE usuario_id = ? AND clase_id = ?',
            [usuarioId, claseId]
        );

        if (deleteResult.affectedRows === 0) {
            throw new Error('Reserva no encontrada');
        }

        // Actualizar el cupo disponible en la tabla Clases
        const [updateClassResult] = await connection.execute(
            'UPDATE Clases SET cupos_disponibles = cupos_disponibles + 1 WHERE id = ?',
            [claseId]
        );

        if (updateClassResult.affectedRows === 0) {
            throw new Error('Clase no encontrada');
        }

        // Aumentar el número de clases disponibles del usuario
        const [updateUserResult] = await connection.execute(
            'UPDATE Usuarios SET clases_disponibles = clases_disponibles + 1 WHERE id = ?',
            [usuarioId]
        );

        if (updateUserResult.affectedRows === 0) {
            throw new Error('Usuario no encontrado');
        }

        await connection.commit(); // Confirmar la transacción

        res.json({ message: 'Clase eliminada y cupos actualizados correctamente' });
    } catch (error) {
        await connection.rollback(); // Revertir la transacción en caso de error
        console.error('Error al eliminar la clase:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    } finally {
        connection.release(); // Liberar la conexión
    }
});
router.post('/crear-clase', async (req, res) => {
    const { usuarioId, claseId } = req.body;

    if (!usuarioId || !claseId) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    const connection = await db.getConnection(); // Obtener una conexión de la base de datos

    try {
        await connection.beginTransaction(); // Iniciar una transacción

        // Verificar disponibilidad
        const [clase] = await connection.execute(
            'SELECT id, cupos_disponibles FROM Clases WHERE id = ? AND cupos_disponibles > 0',
            [claseId]
        );

        if (clase.length === 0) {
            throw new Error('No hay cupos disponibles para esta clase');
        }

        // Hacer la reserva
        await connection.execute(
            'INSERT INTO Reservas (usuario_id, clase_id, fecha_reserva) VALUES (?, ?, NOW())',
            [usuarioId, claseId]
        );

        // Actualizar cupos disponibles
        await connection.execute(
            'UPDATE Clases SET cupos_disponibles = cupos_disponibles - 1 WHERE id = ? AND cupos_disponibles > 0',
            [claseId]
        );

        // Descontar una clase disponible en la tabla de Usuarios
        await connection.execute(
            'UPDATE Usuarios SET clases_disponibles = clases_disponibles - 1 WHERE id = ? AND clases_disponibles > 0',
            [usuarioId]
        );

        await connection.commit(); // Confirmar la transacción

        res.json({ message: 'Clase creada correctamente' });
    } catch (error) {
        await connection.rollback(); // Revertir la transacción en caso de error
        console.error('Error al crear la clase:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    } finally {
        connection.release(); // Liberar la conexión
    }
});


// Ruta para obtener la lista de usuarios
router.get('/lista-usuarios', async (req, res) => {
    try {
        const [usuarios] = await db.execute('SELECT id, nombre FROM Usuarios');
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener la lista de usuarios:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});
router.get('/clases-disponibles', async (req, res) => {
    try {
        const [clases] = await db.execute('SELECT id, fecha_hora, cupos_disponibles FROM Clases WHERE cupos_disponibles > 0');
        res.json(clases);
    } catch (error) {
        console.error('Error al obtener las clases disponibles:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});




module.exports = router;

