const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database'); // Ajusta la ruta según sea necesario
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const nodemailer = require('nodemailer');
const sendRegistrationEmail = require('./email');




// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      
        
        // Usar el nombre de archivo enviado desde el frontend
        const filename = req.body.foto_perfil || `${Date.now()}-${file.originalname}`;
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

// Configuración para manejar múltiples campos
const uploadFields = upload.fields([
    { name: 'foto_perfil', maxCount: 1 },
    { name: 'comprobante_pago', maxCount: 1 }
]);

router.post('/register/complete', uploadFields, async (req, res) => {
    console.log('Datos recibidos en /register/complete:', req.body);
    console.log('Archivos recibidos:', req.files);

    try {
        const { userId, paquete, fechaActivacion, fechaExpiracion } = req.body;
        const comprobantePago = req.files['comprobante_pago'] ? req.files['comprobante_pago'][0].filename : null;
        const fotoPerfil = req.files['foto_perfil'] ? req.files['foto_perfil'][0].filename : null;

        if (!comprobantePago || !fotoPerfil) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // Inserta los datos en la base de datos
        await db.execute(
            'INSERT INTO renovaciones (usuario_id, paquete, comprobante_pago, fecha_compra, fecha_activacion, fecha_expiracion, max_reagendamientos, num_clases, activado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, paquete, comprobantePago, new Date(), fechaActivacion, fechaExpiracion, 4, 12, 0]
        );

        res.status(200).json({ message: 'Registro completado exitosamente', savedFilename: comprobantePago });
    } catch (error) {
        console.error('Error al registrar el paquete:', error);
        res.status(500).json({ message: 'Error al registrar el paquete', error: error.message });
    }
});


router.post('/send-confirmation-email', async (req, res) => {
    const { userId, modalidad } = req.body;
    console.log('Recibido en /send-confirmation-email:', 'userId:', userId, 'modalidad:', modalidad); // Depuración

    try {
        // Aquí deberías obtener el email del usuario usando el userId
        const [user] = await db.execute('SELECT email FROM usuarios WHERE id = ?', [userId]);
        const userEmail = user[0].email;

        const subject = modalidad === 'presencial' ? 'Bienvenido a Aire Pilates' : 'Bienvenido a Aire Pilates Online';

        console.log('Enviando correo a:', userEmail, 'con subject:', subject, 'y modalidad:', modalidad); // Depuración

        await sendRegistrationEmail(userEmail, subject, modalidad);
        res.status(200).json({ message: 'Correo de confirmación enviado' });
    } catch (error) {
        console.error('Error al enviar el correo de confirmación:', error);
        res.status(500).json({ message: 'Error al enviar el correo de confirmación', error: error.message });
    }
});

router.post('/complete', upload.single('comprobante_pago'), [
    body('nombre').isLength({ min: 3 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('telefono').isLength({ min: 8 }).trim().escape(),
    body('password').isLength({ min: 6 }),
    body('fecha_nacimiento').isISO8601().toDate(), // Verifica que se está validando como fecha ISO 8601
    body('genero').isIn(['hombre', 'mujer', 'otro']),
    body('pregunta1').isIn(['si', 'no']),
    body('pregunta2').isIn(['si', 'no']),
    body('pregunta3').isIn(['si', 'no']),
    body('pregunta4').isIn(['si', 'no']),
    body('modalidad').isIn(['online', 'presencial']),
    body('paquete').isIn(['Paquete básico', 'Paquete completo', 'Paquete premium', 'Paquete online']), // Asegúrate de que 'Paquete online' esté incluido
    body('lesiones').optional({ checkFalsy: true }).trim().escape(),
    body('motivacion').isLength({ min: 1 }).trim().escape()
], async (req, res) => {
    console.log('Datos recibidos:', req.body);
    console.log('Archivo recibido:', req.file);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Errores de validación:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, email, telefono, password, fecha_nacimiento, genero, pregunta1, pregunta2, pregunta3, pregunta4, lesiones, motivacion, modalidad, paquete } = req.body;
    const fotoPerfil = req.body.foto_perfil;
    const comprobantePago = req.file ? req.file.filename : null;

    if (!comprobantePago) {
        return res.status(400).json({ message: 'El comprobante de pago es obligatorio.' });
    }

    let clasesDisponibles, maxReagendamientos;
    switch (paquete) {
        case 'Paquete básico':
            clasesDisponibles = 4;
            maxReagendamientos = 1;
            break;
        case 'Paquete completo':
            clasesDisponibles = 8;
            maxReagendamientos = 3;
            break;
        case 'Paquete premium':
            clasesDisponibles = 12;
            maxReagendamientos = 4;
            break;
        case 'Paquete online':
            clasesDisponibles = 8; // Añade la lógica específica para 'Paquete online'
            maxReagendamientos = 3;
            break;
        default:
            return res.status(400).json({ message: 'Paquete inválido' });
    }

    const fechaCompra = new Date();
    const fechaActivacion = new Date(fechaCompra);
    fechaActivacion.setDate(fechaActivacion.getDate() + 1);
    const fechaExpiracion = new Date(fechaActivacion);
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 1);

    try {
        const hashedPassword = await bcrypt.hash(password, 8);

        const [existingUser] = await db.execute('SELECT * FROM Usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const [result] = await db.execute('INSERT INTO Usuarios (nombre, email, telefono, password, fecha_nacimiento, genero, foto_perfil, pregunta1, pregunta2, pregunta3, pregunta4, lesiones, motivacion, modalidad, paquete, comprobante_pago, clases_disponibles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [nombre, email, telefono, hashedPassword, fecha_nacimiento, genero, fotoPerfil, pregunta1, pregunta2, pregunta3, pregunta4, lesiones, motivacion, modalidad, paquete, comprobantePago, clasesDisponibles]);

        const userId = result.insertId;

        await db.execute('INSERT INTO paquetes (usuario_id, fecha_compra, fecha_activacion, fecha_expiracion, max_reagendamientos, informacion_paquete) VALUES (?, ?, ?, ?, ?, ?)', 
            [userId, fechaCompra, fechaActivacion, fechaExpiracion, maxReagendamientos, paquete]);

        const [user] = await db.execute('SELECT email FROM Usuarios WHERE id = ?', [userId]);
        const userEmail = user[0].email;
        const UserModalidad = req.body.modalidad;
        await sendRegistrationEmail(userEmail, 'Registro Exitoso en Aire Pilates',UserModalidad );

        res.status(201).json({ message: 'Registro completado exitosamente' });
    } catch (error) {
        console.error('Error al completar el registro:', error);
        res.status(500).json({ message: 'Error al completar el registro' });
    }
});



module.exports = sendRegistrationEmail;
module.exports = router;