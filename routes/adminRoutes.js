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
    // Lógica para manejar los cambios
    res.send({ message: 'Changes handled successfully' });
});

// Agrega aquí más rutas de administrador según sea necesario

module.exports = router;
