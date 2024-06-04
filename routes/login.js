    // login.js
    const express = require('express');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const db = require('../database');  // Ajusta la ruta según sea necesario
    const path = require('path');
    const router = express.Router();
    // login.js
    router.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../public', 'login.html'));

    });
    

    router.post('/', async (req, res) => {
        const { email, password } = req.body;
        try {
            const [rows] = await db.execute('SELECT * FROM Usuarios WHERE email = ?', [email]);
            if (rows.length === 0) {
                return res.status(401).send({ message: 'Credenciales no válidas' });
            }
            const user = rows[0];
    
            // Usar bcrypt.compare para verificar la contraseña
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Error comparando contraseña:', err);
                    return res.status(500).send({ message: 'Error en el servidor al verificar la contraseña', error: err.message });
                }
                if (!isMatch) {
                    return res.status(401).send({ message: 'Credenciales no válidas' });
                }
    
                // Si la contraseña es correcta, generar y enviar el token
                const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '8h' });
                res.send({ message: 'Login exitoso', token });
            });
        } catch (error) {
            console.error('Error durante el login:', error);
            res.status(500).send({ message: 'Error en el servidor', error: error.message });
        }
    });


    module.exports = router;


