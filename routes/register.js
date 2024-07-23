const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database'); // Ajusta la ruta según sea necesario
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const sendRegistrationEmail = require('./email');

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'comprobante_pago') {
            cb(null, 'uploads/comprobantes/');
        } else {
            cb(new Error('Invalid field name'), false);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// Middleware de validación
const validateRegister = [
    body('nombre').isLength({ min: 3 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('telefono').isLength({ min: 8 }).trim().escape(),
    body('password').isLength({ min: 6 }),
    body('fecha_nacimiento').isISO8601().toDate(),
    body('genero').isIn(['hombre', 'mujer', 'otro']),
    body('pregunta1').isIn(['si', 'no']),
    body('pregunta2').isIn(['si', 'no']),
    body('pregunta3').isIn(['si', 'no']),
    body('pregunta4').isIn(['si', 'no']),
    body('modalidad').isIn(['online', 'presencial']),
    body('paquete').isIn(['Paquete básico', 'Paquete completo', 'Paquete premium', 'Paquete online']),
    body('lesiones').optional({ checkFalsy: true }).trim().escape(),
    body('motivacion').isLength({ min: 1 }).trim().escape()
];

// Ruta para completar el registro
router.post('/complete', upload.single('comprobante_pago'), validateRegister, async (req, res) => {
    console.log('Datos recibidos en /register/complete:', req.body);
    console.log('Archivo recibido:', req.file);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Errores de validación:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, email, telefono, password, fecha_nacimiento, genero, pregunta1, pregunta2, pregunta3, pregunta4, lesiones, motivacion, modalidad, paquete } = req.body;
    const comprobantePago = req.file ? req.file.filename : null;

    if (!comprobantePago) {
        console.log('Falta comprobante de pago');
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
            clasesDisponibles = 8;
            maxReagendamientos = 3;
            break;
        default:
            console.log('Paquete inválido:', paquete);
            return res.status(400).json({ message: 'Paquete inválido' });
    }

    const fechaCompra = new Date();
    const fechaActivacion = new Date(fechaCompra);
    fechaActivacion.setDate(fechaActivacion.getDate() + 1);
    const fechaExpiracion = new Date(fechaActivacion);
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 1);

    try {
        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 8);
        console.log('Password hashed:', hashedPassword);

        console.log('Verificando si el usuario ya existe...');
        const [existingUser] = await db.execute('SELECT * FROM Usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            console.log('El email ya está registrado:', email);
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        console.log('Insertando usuario en la base de datos...');
        const [result] = await db.execute(
            'INSERT INTO Usuarios (nombre, email, telefono, password, fecha_nacimiento, genero, pregunta1, pregunta2, pregunta3, pregunta4, lesiones, motivacion, modalidad, paquete, comprobante_pago, clases_disponibles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [nombre, email, telefono, hashedPassword, fecha_nacimiento, genero, pregunta1, pregunta2, pregunta3, pregunta4, lesiones, motivacion, modalidad, paquete, comprobantePago, clasesDisponibles]
        );
        console.log('Usuario insertado:', result);

        const userId = result.insertId;

        console.log('Insertando paquete en la base de datos...');
        await db.execute(
            'INSERT INTO paquetes (usuario_id, fecha_compra, fecha_activacion, fecha_expiracion, max_reagendamientos, informacion_paquete) VALUES (?, ?, ?, ?, ?, ?)', 
            [userId, fechaCompra, fechaActivacion, fechaExpiracion, maxReagendamientos, paquete]
        );
        console.log('Paquete insertado');

        console.log('Obteniendo email del usuario...');
        const [user] = await db.execute('SELECT email FROM Usuarios WHERE id = ?', [userId]);
        const userEmail = user[0].email;
        const UserModalidad = req.body.modalidad;

        console.log('Enviando correo de confirmación...');
        await sendRegistrationEmail(userEmail, 'Registro Exitoso en Aire Pilates', UserModalidad);
        console.log('Correo enviado a:', userEmail);

        res.status(201).json({ message: 'Registro completado exitosamente' });
    } catch (error) {
        console.error('Error al completar el registro:', error);
        res.status(500).json({ message: 'Error al completar el registro', error: error.message });
    }
});

module.exports = router;
