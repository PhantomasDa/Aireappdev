const nodemailer = require('nodemailer');

async function sendRegistrationEmail(to, subject) {
    // Configuración del transporte de correo
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'Mockraw@gmail.com',
            pass: 'iidr awan vpzn crhm'
        }
    });

    // Construir el cuerpo del mensaje HTML
    let htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center; padding: 20px; background-color: #B2987E">
            <img src="https://airepilates.com/content/logo.png" alt="Logo" style="width: 100px; height: auto;"/>
        </div>
        <h1 style="text-align: center; color: #333;">Bienvenido a Aire Pilates</h1>

        <p>Bienvenido a Aire Pilates, tu estudio especializado en Springboard y Mat Pilates. Nuestras clases son personalizadas, con un máximo de 4 personas por sesión, Ahora puedes entrar en tu perfil y reservar todas tus clases.</p>

        <div style="text-align: center;">
            <img src="https://airepilates.com/content/carrusel4.png" alt="Bienvenido" style="width: 100%; height: auto; max-width: 600px;"/>
        </div>
        <p>Hola,</p>
        <p>Gracias por registrarte en nuestra plataforma. Tu usuario es tu correo electrónico: <strong>${to}</strong>.</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="https://airepilates.com/login.html" style="background-color: #B2987E; color: #FFF; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reservar clases</a>
        </div>
       
        <footer style="background-color: #B2987E; padding: 20px; text-align: center;">
            <img src="https://airepilates.com/content/logo.png" alt="Logo" style="width: 50px; height: auto;"/>
            <p><a href="https://airepilates.com">www.airepilates.com</a></p>
        </footer>
    </div>
    `;

    // Configuración del correo
    let mailOptions = {
        from: 'Mockraw@gmail.com',
        to: to,
        subject: subject,
        html: htmlContent // Cambiamos de text a html para enviar contenido HTML
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
