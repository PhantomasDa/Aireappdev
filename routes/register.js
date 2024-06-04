const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database'); // Ajusta la ruta según sea necesario
const multer = require('multer');
const path = require('path');
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
router.post('/step1', async (req, res) => {
    const { nombre, email, telefono, password, fecha_nacimiento, genero } = req.body;

    if (!nombre || !email || !telefono || !password || !fecha_nacimiento || !genero) {
        return res.status(400).send({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const [existingUser] = await db.execute('SELECT * FROM Usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).send({ message: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const [result] = await db.execute('INSERT INTO Usuarios (nombre, email, telefono, password, fecha_nacimiento, genero) VALUES (?, ?, ?, ?, ?, ?)', [nombre, email, telefono, hashedPassword, fecha_nacimiento, genero]);

        res.status(201).send({ message: 'Datos principales guardados exitosamente', userId: result.insertId });
    } catch (error) {
        console.error('Error al guardar datos principales:', error);
        res.status(500).send({ message: 'Error al guardar datos principales' });
    }
});

// Paso 2: Subir foto de perfil
router.post('/step2', upload.single('foto_perfil'), async (req, res) => {
    const { userId } = req.body;
    const fotoPerfil = req.file ? req.file.filename : null;

    if (!userId || !fotoPerfil) {
        return res.status(400).send({ message: 'Todos los campos son obligatorios' });
    }

    try {
        await db.execute('UPDATE Usuarios SET foto_perfil = ? WHERE id = ?', [fotoPerfil, userId]);

        res.status(200).send({ message: 'Foto de perfil actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar foto de perfil:', error);
        res.status(500).send({ message: 'Error al actualizar foto de perfil' });
    }
});

// Paso 3: Guardar Cuestionario
router.post('/step3', async (req, res) => {
    const { userId, pregunta1, pregunta2, pregunta3, pregunta4 } = req.body;

    if (!userId || !pregunta1 || !pregunta2 || !pregunta3 || !pregunta4) {
        return res.status(400).send({ message: 'Todos los campos son obligatorios' });
    }

    try {
        await db.execute('UPDATE Usuarios SET pregunta1 = ?, pregunta2 = ?, pregunta3 = ?, pregunta4 = ? WHERE id = ?', [pregunta1, pregunta2, pregunta3, pregunta4, userId]);

        res.status(200).send({ message: 'Cuestionario guardado exitosamente' });
    } catch (error) {
        console.error('Error al guardar cuestionario:', error);
        res.status(500).send({ message: 'Error al guardar cuestionario' });
    }
});

// Paso 4: Guardar Lesiones y Motivaciones
router.post('/step4', async (req, res) => {
    const { userId, lesiones, motivacion } = req.body;

    if (!userId || !lesiones || !motivacion) {
        return res.status(400).send({ message: 'Todos los campos son obligatorios' });
    }

    try {
        await db.execute('UPDATE Usuarios SET lesiones = ?, motivacion = ? WHERE id = ?', [lesiones, motivacion, userId]);

        res.status(200).send({ message: 'Registro completado exitosamente' });
    } catch (error) {
        console.error('Error al guardar lesiones y motivaciones:', error);
        res.status(500).send({ message: 'Error al guardar lesiones y motivaciones' });
    }
});

// Paso 5: Guardar Modalidad
router.post('/step5', async (req, res) => {
    const { userId, modalidad_online, modalidad_presencial } = req.body;

    if (!userId || (!modalidad_online && !modalidad_presencial)) {
        return res.status(400).send({ message: 'Todos los campos son obligatorios' });
    }

    try {
        await db.execute('UPDATE Usuarios SET modalidad_online = ?, modalidad_presencial = ? WHERE id = ?', [modalidad_online, modalidad_presencial, userId]);

        res.status(200).send({ message: 'Modalidad guardada exitosamente' });
    } catch (error) {
        console.error('Error al guardar modalidad:', error);
        res.status(500).send({ message: 'Error al guardar modalidad' });
    }
});

// Paso 6: Guardar Paquete y Comprobante de Pago
router.post('/step6', upload.single('comprobante_pago'), async (req, res) => {
    const { userId, paquete } = req.body;
    const comprobantePago = req.file ? req.file.filename : null;

    if (!userId || !paquete || !comprobantePago) {
        return res.status(400).send({ message: 'Todos los campos son obligatorios' });
    }

    let clasesDisponibles;
    switch(paquete) {
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
            return res.status(400).send({ message: 'Paquete inválido' });
    }

    try {
        await db.execute('UPDATE Usuarios SET paquete = ?, comprobante_pago = ?, clases_disponibles = ? WHERE id = ?', [paquete, comprobantePago, clasesDisponibles, userId]);

        res.status(200).json({ message: 'Verificación de pago exitosa' });
    } catch (error) {
        console.error('Error al guardar paquete y comprobante de pago:', error);
        res.status(500).send({ message: 'Error al guardar paquete y comprobante de pago' });
    }
});

// Paso 7: Guardar Datos de Facturación
router.post('/billing', async (req, res) => {
    const { usuario_id, cedula_ruc, direccion1, direccion2, telefono, nombre_completo, razon_social, otro_dato } = req.body;

    if (!usuario_id || !cedula_ruc || !direccion1 || !telefono || !nombre_completo) {
        return res.status(400).send({ message: 'Todos los campos obligatorios menos direccion2 y razon_social' });
    }

    try {
        await db.execute('INSERT INTO Datos_de_facturacion (usuario_id, cedula_ruc, direccion1, direccion2, telefono, nombre_completo, razon_social, otro_dato) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [usuario_id, cedula_ruc, direccion1, direccion2, telefono, nombre_completo, razon_social, otro_dato]);

        res.status(200).send({ message: 'Datos de facturación guardados exitosamente' });
    } catch (error) {
        console.error('Error al insertar datos de facturación:', error);
        res.status(500).send({ message: 'Error al insertar datos de facturación' });
    }
});

module.exports = router;
