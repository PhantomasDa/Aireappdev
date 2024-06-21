//middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Cargar variables de entorno

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta'; // Debe ser segura y secreta

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token después de "Bearer "
    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized!' });
        }
        req.user = decoded; // Guardar usuario decodificado en la solicitud para su uso posterior
        next();
    });
};

// Middleware para verificar si el usuario está autenticado mediante sesión
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        req.flash('error', 'Debes iniciar sesión para acceder a esta página');
        res.redirect('/login');
    }
};

module.exports = {
    verifyToken,
    isAuthenticated,
};
