// routes/home.js
const express = require('express');
const db = require('../database'); // Ajusta la ruta según sea necesario
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Ruta para manejar la suscripción
router.post('/subscribe', [
    body('email').isEmail().normalizeEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
        // Verificar si el correo ya está suscrito
        const [existingSubscriber] = await db.execute('SELECT * FROM Suscriptores WHERE email = ?', [email]);
        if (existingSubscriber.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está suscrito' });
        }

        // Insertar nuevo suscriptor en la base de datos
        await db.execute('INSERT INTO Suscriptores (email) VALUES (?)', [email]);

        res.status(201).json({ message: 'Suscripción exitosa' });
    } catch (error) {
        console.error('Error al suscribir:', error);
        res.status(500).json({ message: 'Error al suscribir' });
    }
});

module.exports = router;
