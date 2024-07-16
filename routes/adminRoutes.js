const express = require('express');
const { verifyToken } = require('../middleware/auth'); // Asegúrate de que la ruta a auth.js sea correcta
const db = require('../database');
const router = express.Router();

// Middleware para verificar si el usuario es administrador
const verifyAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).send({ message: 'Access forbidden: Admins only' });
    }
    next();
};

// Ejemplo de ruta de administrador protegida
router.post('/admin', verifyToken, verifyAdmin, (req, res) => {
    const { cambios } = req.body;
    if (!cambios) {
        return res.status(400).send({ message: 'No changes provided' });
    }

    console.log('Cambios recibidos en /admin:', cambios); // Mensaje de depuración

    // Lógica para manejar los cambios
    res.send({ message: 'Changes handled successfully' });
});

// Ruta para actualizar usuarios
router.post('/actualizar-usuarios', verifyToken, verifyAdmin, async (req, res) => {
    const { cambios } = req.body;
    if (!cambios) {
        return res.status(400).send({ message: 'No changes provided' });
    }

    console.log('Datos recibidos en /actualizar-usuarios:', cambios); // Mensaje de depuración

    try {
        for (const cambio of cambios) {
            const { id, field, value } = cambio;
            console.log(`Actualizando usuario - id: ${id}, field: ${field}, value: ${value}`); // Depuración
            await db.execute(`UPDATE Usuarios SET ${field} = ? WHERE id = ?`, [value, id]);
        }
        res.status(200).json({ message: 'Cambios guardados exitosamente' });
    } catch (error) {
        console.error('Error al guardar cambios en la base de datos:', error); // Mensaje de depuración
        res.status(500).json({ message: 'Error al guardar cambios' });
    }
});

// Agrega aquí más rutas de administrador según sea necesario

module.exports = router;
