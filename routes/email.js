const nodemailer = require('nodemailer');

async function sendRegistrationEmail(to, subject, text) {
    // Configuración del transporte de correo
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tu-email@gmail.com',
            pass: 'tu-contraseña'
        }
    });

    // Configuración del correo
    let mailOptions = {
        from: 'tu-email@gmail.com',
        to: to,
        subject: subject,
        text: text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado a:', to);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw error;
    }
}

module.exports = sendRegistrationEmail;
