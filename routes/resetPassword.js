const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const db = require('../database');
const router = express.Router();
require('dotenv').config();

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        console.error('El campo email está vacío');
        return res.status(400).json({ message: 'El campo email está vacío. Inténtalo nuevamente.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM Usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'No se encontró un usuario con ese correo electrónico.' });
        }
        const user = users[0];
        console.log('Usuario encontrado:', user);

        const lastRequestTime = user.resetPasswordExpires ? new Date(user.resetPasswordExpires).getTime() : 0;
        const currentTime = Date.now();
        const timeDifference = currentTime - lastRequestTime;
        console.log('Diferencia de tiempo:', timeDifference);

        if (timeDifference > 300000 ) { // 300000 ms = 5 minutos
            return res.status(429).json({ message: 'Por favor, espera 5 minutos antes de solicitar otro enlace.' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expiration = new Date(currentTime + 3600000).toISOString().slice(0, 19).replace('T', ' ');
        console.log('Token generado:', token);
        console.log('Fecha de expiración:', expiration);

        await db.query('UPDATE Usuarios SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?', [token, expiration, email]);

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'Mockraw@gmail.com',
                pass: 'iidr awan vpzn crhm'
            }
        });

        const mailOptions = {
            to: email,
            from: 'Mockraw@gmail.com',
            subject: 'Restablecer contraseña',
            text: `Estás recibiendo esto porque tú (u otra persona) solicitó restablecer la contraseña de tu cuenta.\n\n` +
                  `Por favor haz clic en el siguiente enlace, o pégalo en tu navegador para completar el proceso:\n\n` +
                  `https://airepilates.com/reset-password.html?token=${token}\n\n` +
                  `Si no solicitaste esto, por favor ignora este correo y tu contraseña no cambiará.\n`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Correo enviado correctamente. Revisa tu bandeja de entrada.' });
    } catch (error) {
        console.error('Error al enviar el correo: ', error.message);
        res.status(500).json({ message: `Error al enviar el correo: ${error.message}. Inténtalo nuevamente.` });
    }
});router.post('/reset-password', async (req, res) => {
    console.log('Solicitud recibida en /reset-password');
    const { token, password } = req.body;
    console.log('Datos recibidos:', { token, password });

    if (!token || !password) {
        console.error('Token y nueva contraseña son requeridos.');
        return res.status(400).json({ message: 'Token y nueva contraseña son requeridos.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const [users] = await db.query('SELECT * FROM Usuarios WHERE resetPasswordToken = ? AND resetPasswordExpires > ?', [token, currentTime]);
        if (users.length === 0) {
            console.error('El token es inválido o ha expirado');
            return res.status(400).json({ message: 'El token es inválido o ha expirado', success: false });
        }

        const user = users[0];
        console.log('Usuario encontrado:', user);

        await db.query('UPDATE Usuarios SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?', [hashedPassword, user.id]);

        console.log('Contraseña actualizada correctamente');
        res.status(200).json({ message: 'Contraseña restablecida correctamente', success: true, redirect: true });
    } catch (error) {
        console.error('Error al actualizar la contraseña:', error.message);
        res.status(500).json({ message: `Error al actualizar la contraseña: ${error.message}. Inténtalo nuevamente.` });
    }
});


module.exports = router;
