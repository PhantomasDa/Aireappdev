const nodemailer = require('nodemailer');

async function sendRegistrationEmail(to, subject, text) {
    // Configuración del transporte de correo
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'Mockraw@gmail.com',
            pass: 'iidr awan vpzn crhm'
        }
    });

    // Configuración del correo
    let mailOptions = {
        from: 'Mockraw@gmail.com',
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
