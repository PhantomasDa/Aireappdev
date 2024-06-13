const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database'); // Ajusta la ruta según sea necesario
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const nodemailer = require('nodemailer');
const sendRegistrationEmail = require('./email');


// Configurar multer para almacenar archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Paso 1: Guardar Datos Principales
router.post('/step1', [
    body('nombre').isLength({ min: 3 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('telefono').isLength({ min: 8 }).trim().escape(),
    body('password').isLength({ min: 6 }),
    body('fecha_nacimiento').isDate(),
    body('genero').isIn(['hombre', 'mujer', 'otro'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, email, telefono, password, fecha_nacimiento, genero } = req.body;

    try {
        const [existingUser] = await db.execute('SELECT * FROM Usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const [result] = await db.execute('INSERT INTO Usuarios (nombre, email, telefono, password, fecha_nacimiento, genero) VALUES (?, ?, ?, ?, ?, ?)', [nombre, email, telefono, hashedPassword, fecha_nacimiento, genero]);

        res.status(201).json({ message: 'Datos principales guardados exitosamente', userId: result.insertId });
    } catch (error) {
        console.error('Error al guardar datos principales:', error);
        res.status(500).json({ message: 'Error al guardar datos principales' });
    }
});

// Paso 2: Subir foto de perfil
router.post('/step2', upload.single('foto_perfil'), [
    body('userId').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.body;
    const fotoPerfil = req.file ? req.file.filename : null;

    if (!fotoPerfil) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        await db.execute('UPDATE Usuarios SET foto_perfil = ? WHERE id = ?', [fotoPerfil, userId]);

        res.status(200).json({ message: 'Foto de perfil actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar foto de perfil:', error);
        res.status(500).json({ message: 'Error al actualizar foto de perfil' });
    }
});
// Paso 3: Guardar Cuestionario y Datos Relevantes
router.post('/step3', [
    body('userId').isInt(),
    body('pregunta1').isIn(['si', 'no']),
    body('pregunta2').isIn(['si', 'no']),
    body('pregunta3').isIn(['si', 'no']),
    body('pregunta4').isIn(['si', 'no']),
    body('lesiones').optional({ checkFalsy: true }).trim().escape(),
    body('motivacion').isLength({ min: 1 }).trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pregunta1, pregunta2, pregunta3, pregunta4, lesiones, motivacion } = req.body;

    try {
        await db.execute('UPDATE Usuarios SET pregunta1 = ?, pregunta2 = ?, pregunta3 = ?, pregunta4 = ?, lesiones = ?, motivacion = ? WHERE id = ?', 
            [pregunta1, pregunta2, pregunta3, pregunta4, lesiones, motivacion, userId]);

        res.status(200).json({ message: 'Cuestionario y datos relevantes guardados exitosamente' });
    } catch (error) {
        console.error('Error al guardar cuestionario y datos relevantes:', error);
        res.status(500).json({ message: 'Error al guardar cuestionario y datos relevantes' });
    }
});


// Paso 5: Guardar Modalidad
router.post('/step5', [
    body('userId').isInt(),
    body('modalidad').isIn(['online', 'presencial'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, modalidad } = req.body;

    try {
        await db.execute('UPDATE Usuarios SET modalidad = ? WHERE id = ?', [modalidad, userId]);

        res.status(200).json({ message: 'Modalidad guardada exitosamente' });
    } catch (error) {
        console.error('Error al guardar modalidad:', error);
        res.status(500).json({ message: 'Error al guardar modalidad' });
    }
});
router.post('/step6', upload.single('comprobante_pago'), [
    body('userId').isInt(),
    body('paquete').isIn(['Paquete básico', 'Paquete completo', 'Paquete premium']),
    body('cedula_ruc').optional().trim().escape(),
    body('direccion1').optional().trim().escape(),
    body('direccion2').optional().trim().escape(),
    body('telefono').optional().trim().escape(),
    body('nombre_completo').optional().trim().escape(),
    body('razon_social').optional().trim().escape(),
    body('otro_dato').optional().trim().escape()
], async (req, res) => {
    console.log('Campos recibidos:', req.body, req.file);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Errores de validación:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, paquete, cedula_ruc, direccion1, direccion2, telefono, nombre_completo, razon_social, otro_dato } = req.body;
    const comprobantePago = req.file ? req.file.filename : null;

    if (!comprobantePago) {
        console.error('No se recibió el comprobante de pago.');
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    let clasesDisponibles, maxReagendamientos;
    switch (paquete) {
        case 'Paquete básico':
            clasesDisponibles = 4;
            maxReagendamientos = 1; // Ajusta según tus necesidades
            break;
        case 'Paquete completo':
            clasesDisponibles = 8;
            maxReagendamientos = 3;
            break;
        case 'Paquete premium':
            clasesDisponibles = 12;
            maxReagendamientos = 4;
            break;
        default:
            console.error('Paquete inválido:', paquete);
            return res.status(400).json({ message: 'Paquete inválido' });
    }

    const fechaCompra = new Date();
    const fechaActivacion = new Date(fechaCompra);
    fechaActivacion.setDate(fechaActivacion.getDate() + 1);
    const fechaExpiracion = new Date(fechaActivacion);
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 1);

    try {
        console.log('Actualizando usuario:', { userId, paquete, comprobantePago, clasesDisponibles });
        await db.execute('UPDATE Usuarios SET paquete = ?, comprobante_pago = ?, clases_disponibles = ? WHERE id = ?', [paquete, comprobantePago, clasesDisponibles, userId]);

        if (cedula_ruc && direccion1 && telefono && nombre_completo) {
            console.log('Insertando datos de facturación:', { userId, cedula_ruc, direccion1, direccion2, telefono, nombre_completo, razon_social, otro_dato });
            await db.execute('INSERT INTO Datos_de_facturacion (usuario_id, cedula_ruc, direccion1, direccion2, telefono, nombre_completo, razon_social, otro_dato) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                [userId, cedula_ruc, direccion1, direccion2, telefono, nombre_completo, razon_social, otro_dato]);
        }

        console.log('Insertando datos del paquete:', { userId, fechaCompra, fechaActivacion, fechaExpiracion, maxReagendamientos, paquete });
        await db.execute('INSERT INTO paquetes (usuario_id, fecha_compra, fecha_activacion, fecha_expiracion, max_reagendamientos, informacion_paquete) VALUES (?, ?, ?, ?, ?, ?)', 
            [userId, fechaCompra, fechaActivacion, fechaExpiracion, maxReagendamientos, paquete]);

        const [user] = await db.execute('SELECT email FROM Usuarios WHERE id = ?', [userId]);
        const userEmail = user[0].email;
        console.log('Enviando correo de confirmación a:', userEmail);
        await sendRegistrationEmail(userEmail, 'Registro Exitoso en Aire Pilates', '¡Felicidades! Te has registrado exitosamente en Aire Pilates.');

        res.status(200).json({ message: 'Verificación de pago exitosa' });
    } catch (error) {
        console.error('Error al guardar paquete, comprobante de pago y datos de facturación:', error);
        res.status(500).json({ message: 'Error al guardar paquete, comprobante de pago y datos de facturación' });
    }
});


module.exports = sendRegistrationEmail;
module.exports = router;