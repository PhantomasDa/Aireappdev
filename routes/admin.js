const express = require('express');
const router = express.Router();
const db = require('../database');
// const { verifyToken } = require('../middleware/auth');

// Obtener clases y usuarios por día
router.get('/clases-usuarios', /*verifyToken,*/ async (req, res) => {
    const { fecha } = req.query;

    const queryClases = `
        SELECT c.id, c.fecha_hora, c.cupos_max, c.cupos_disponibles
        FROM Clases c
        WHERE DATE(c.fecha_hora) = ?
    `;
    const queryUsuarios = `
        SELECT r.clase_id, u.id AS usuario_id, u.nombre, u.email, u.telefono
        FROM Reservas r
        JOIN Usuarios u ON r.usuario_id = u.id
        WHERE r.clase_id IN (SELECT id FROM Clases WHERE DATE(fecha_hora) = ?)
    `;

    try {
        const [clases] = await db.execute(queryClases, [fecha]);
        const [usuarios] = await db.execute(queryUsuarios, [fecha]);

        const clasesConUsuarios = clases.map(clase => {
            return {
                ...clase,
                usuarios: usuarios.filter(usuario => usuario.clase_id === clase.id)
            };
        });

        res.json(clasesConUsuarios);
    } catch (error) {
        console.error('Error al obtener clases y usuarios:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// Obtener todos los usuarios con sus paquetes y reservaciones
router.get('/usuarios-completos', async (req, res) => {
    const queryUsuarios = `
        SELECT u.id, u.nombre, u.email, u.fecha_registro, u.foto_perfil, u.paquete, u.clases_disponibles, u.telefono, u.lesiones, u.motivacion, u.pregunta1, u.pregunta2, u.pregunta3, u.pregunta4, u.fecha_nacimiento, u.genero, u.comprobante_pago, u.rol,
               p.fecha_compra AS paquete_fecha_compra, p.fecha_activacion AS paquete_fecha_activacion, p.fecha_expiracion AS paquete_fecha_expiracion, p.max_reagendamientos AS paquete_max_reagendamientos, p.reagendamientos_usados AS paquete_reagendamientos_usados, p.informacion_paquete AS paquete_informacion, p.comprobante_pago AS paquete_comprobante_pago,
               r.clase_id AS reserva_clase_id, r.fecha_reserva AS reserva_fecha_reserva, r.reagendamientos AS reserva_reagendamientos
        FROM Usuarios u
        LEFT JOIN Paquetes p ON u.id = p.usuario_id
        LEFT JOIN Reservas r ON u.id = r.usuario_id
    `;

    try {
        const [usuarios] = await db.execute(queryUsuarios);
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios completos:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});



module.exports = router;
