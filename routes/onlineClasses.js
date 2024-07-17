const express = require('express');
const router = express.Router();
const db = require('../database');
const { body, validationResult } = require('express-validator');

router.post('/register_online_class', async (req, res) => {
    const { nombre, correo, telefono, ciudad, horarios } = req.body;

    try {
        const query = `INSERT INTO usuario_online (nombre, correo, telefono, ciudad, horarios) VALUES (?, ?, ?, ?, ?)`;
        await db.query(query, [nombre, correo, telefono, ciudad, horarios]);
        res.redirect('/success');
    } catch (error) {
        console.error('Error registrando la clase online:', error);
        res.status(500).send('Error registrando la clase online');
    }
});

module.exports = router;
