const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./database');
const loginRouter = require('./routes/login');
const resetPasswordRoutes = require('./routes/resetPassword');
const registerRouter = require('./routes/register');
const profileRouter = require('./routes/profile');
const adminRoutes = require('./routes/admin'); 
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const homeRoutes = require('./routes/home');
const onlineClassesRoutes = require('./routes/onlineClasses');

require('dotenv').config();
require('./cronJobs');

// Middleware para parsear JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de session middleware
app.use(session({
    secret: 'tu_secreto',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

// Configuración de flash middleware (opcional)
app.use(flash());

// Middleware para manejar CORS
app.use(cors());

// Middleware para hacer la sesión disponible en las vistas
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/admin', adminRoutes);
app.use('/login', loginRouter);
app.use('/reset', resetPasswordRoutes);
app.use('/register', registerRouter);
app.use('/profile', profileRouter);
app.use('/', homeRoutes);
app.use(onlineClassesRoutes);

// Crear el directorio 'uploads' si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Ruta para servir el archivo admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Ruta específica para 'register'
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Ruta específica para 'profile'
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Ruta de registro
app.post('/register', async (req, res) => {
    const { nombre, email, password, foto_perfil, paquete } = req.body;
    
    if (!nombre || !email || !password) {
        return res.status(400).send({ message: 'Nombre, email y contraseña son necesarios' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        const result = await db.execute(
            'INSERT INTO Usuarios (nombre, email, password, foto_perfil, paquete, clases_disponibles) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, email, hashedPassword, foto_perfil, paquete, 0]
        );

        res.status(201).send({ message: 'Usuario registrado exitosamente', userId: result[0].insertId });
    } catch (error) {
        if (error.errno === 1062) {
            res.status(409).send({ message: 'El email ya está registrado' });
        } else {
            res.status(500).send({ message: 'Error al registrar usuario', error: error.message });
        }
    }
});

app.post('/perfil/reservar', (req, res) => {
    res.send("Reserva realizada");
});

// Configurar el puerto y arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
