const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database'); // Ajusta la ruta según sea necesario
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const router = express.Router();

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

// Paso 3: Guardar Cuestionario
router.post('/step3', [
    body('userId').isInt(),
    body('pregunta1').isIn(['si', 'no']),
    body('pregunta2').isIn(['si', 'no']),
    body('pregunta3').isIn(['si', 'no']),
    body('pregunta4').isIn(['si', 'no'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pregunta1, pregunta2, pregunta3, pregunta4 } = req.body;

    try {
        await db.execute('UPDATE Usuarios SET pregunta1 = ?, pregunta2 = ?, pregunta3 = ?, pregunta4 = ? WHERE id = ?', [pregunta1, pregunta2, pregunta3, pregunta4, userId]);

        res.status(200).json({ message: 'Cuestionario guardado exitosamente' });
    } catch (error) {
        console.error('Error al guardar cuestionario:', error);
        res.status(500).json({ message: 'Error al guardar cuestionario' });
    }
});

// Paso 4: Guardar Lesiones y Motivaciones
router.post('/step4', [
    body('userId').isInt(),
    body('lesiones').isLength({ min: 1 }).trim().escape(),
    body('motivacion').isLength({ min: 1 }).trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, lesiones, motivacion } = req.body;

    try {
        await db.execute('UPDATE Usuarios SET lesiones = ?, motivacion = ? WHERE id = ?', [lesiones, motivacion, userId]);

        res.status(200).json({ message: 'Registro completado exitosamente' });
    } catch (error) {
        console.error('Error al guardar lesiones y motivaciones:', error);
        res.status(500).json({ message: 'Error al guardar lesiones y motivaciones' });
    }
});

// Paso 5: Guardar Modalidad
router.post('/step5', [
    body('userId').isInt(),
    body('modalidad_online').isIn(['si', 'no']).optional(),
    body('modalidad_presencial').isIn(['si', 'no']).optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, modalidad_online, modalidad_presencial } = req.body;

    try {
        await db.execute('UPDATE Usuarios SET modalidad_online = ?, modalidad_presencial = ? WHERE id = ?', [modalidad_online, modalidad_presencial, userId]);

        res.status(200).json({ message: 'Modalidad guardada exitosamente' });
    } catch (error) {
        console.error('Error al guardar modalidad:', error);
        res.status(500).json({ message: 'Error al guardar modalidad' });
    }
});

// Paso 6: Guardar Paquete y Comprobante de Pago
router.post('/step6', upload.single('comprobante_pago'), [
    body('userId').isInt(),
    body('paquete').isIn(['Paquete basico', 'Paquete completo', 'Paquete premium'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, paquete } = req.body;
    const comprobantePago = req.file ? req.file.filename : null;

    if (!comprobantePago) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    let clasesDisponibles;
    switch (paquete) {
        case 'Paquete basico':
            clasesDisponibles = 4;
            break;
        case 'Paquete completo':
            clasesDisponibles = 8;
            break;
        case 'Paquete premium':
            clasesDisponibles = 12;
            break;
        default:
            return res.status(400).json({ message: 'Paquete inválido' });
    }

    try {
        await db.execute('UPDATE Usuarios SET paquete = ?, comprobante_pago = ?, clases_disponibles = ? WHERE id = ?', [paquete, comprobantePago, clasesDisponibles, userId]);

        res.status(200).json({ message: 'Verificación de pago exitosa' });
    } catch (error) {
        console.error('Error al guardar paquete y comprobante de pago:', error);
        res.status(500).json({ message: 'Error al guardar paquete y comprobante de pago' });
    }
});

// Paso 7: Guardar Datos de Facturación
router.post('/billing', [
    body('usuario_id').isInt(),
    body('cedula_ruc').isLength({ min: 1 }).trim().escape(),
    body('direccion1').isLength({ min: 1 }).trim().escape(),
    body('direccion2').optional().trim().escape(),
    body('telefono').isLength({ min: 8 }).trim().escape(),
    body('nombre_completo').isLength({ min: 1 }).trim().escape(),
    body('razon_social').optional().trim().escape(),
    body('otro_dato').optional().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { usuario_id, cedula_ruc, direccion1, direccion2, telefono, nombre_completo, razon_social, otro_dato } = req.body;

    try {
        await db.execute('INSERT INTO Datos_de_facturacion (usuario_id, cedula_ruc, direccion1, direccion2, telefono, nombre_completo, razon_social, otro_dato) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [usuario_id, cedula_ruc, direccion1, direccion2, telefono, nombre_completo, razon_social, otro_dato]);

        res.status(200).json({ message: 'Datos de facturación guardados exitosamente' });
    } catch (error) {
        console.error('Error al insertar datos de facturación:', error);
        res.status(500).json({ message: 'Error al insertar datos de facturación' });
    }
});

module.exports = router;
