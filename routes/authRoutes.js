const express = require('express');
const db = require('../database');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../middleware/auth'); // Asegúrate de que la ruta a auth.js sea correcta
const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.execute('SELECT * FROM Usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        const user = users[0];

        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: 'Invalid Password!' });
        }

        const token = generateToken(user);

        res.status(200).send({
            id: user.id,
            email: user.email,
            accessToken: token,
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({ message: 'Error during login' });
    }
});

router.post('/logout', verifyToken, (req, res) => {
    res.clearCookie('token');
    res.status(200).send({ message: 'Successfully logged out' });
});

module.exports = router;
