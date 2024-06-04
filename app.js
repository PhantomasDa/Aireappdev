const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./database');
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const profileRouter = require('./routes/profile');
const adminRoutes = require('./routes/admin'); 
const path = require('path');
const fs = require('fs'); // Agregar fs para el manejo del sistema de archivos
const cors = require('cors');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();

// Configuración de session middleware
app.use(session({
    secret: 'tu_secreto', // Reemplaza con una clave secreta segura
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } // Duración de la sesión en milisegundos (1 minuto aquí)
  }));
  
  // Configuración de flash middleware (opcional)
  app.use(flash());
  
  // Middleware para hacer la sesión disponible en las vistas
  app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });

// Ruta para servir el archivo admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});


// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para rutas de la API
app.use('/admin', adminRoutes);


app.use(express.json());
app.use(cors());

// Middleware para manejar CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Ajustar según necesidades de seguridad
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir archivos estáticos desde el directorio "uploads"

// Crear el directorio 'uploads' si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.use('/profile', profileRouter); // Montar las rutas de profile

// Rutas
app.use('/perfil', profileRouter);

// Ruta específica para 'register'
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Usar el router de 'register'
app.use('/register', registerRouter);

// Ruta específica para 'profile'
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});
// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Ruta de registro
app.post('/register', async (req, res) => {
    const { nombre, email, password, foto_perfil, paquete } = req.body;
    
    // Asegurar que todos los campos necesarios están presentes
    if (!nombre || !email || !password) {
        return res.status(400).send({ message: 'Nombre, email y contraseña son necesarios' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 8);

        const result = await db.execute(
            'INSERT INTO Usuarios (nombre, email, password, foto_perfil, paquete, clases_disponibles) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, email, hashedPassword, foto_perfil, paquete, 0] // Inicializa clases_disponibles en 0 o ajusta según sea necesario
        );

        res.status(201).send({ message: 'Usuario registrado exitosamente', userId: result[0].insertId });
    } catch (error) {
        if (error.errno === 1062) { // Error de duplicado
            res.status(409).send({ message: 'El email ya está registrado' });
        } else {
            res.status(500).send({ message: 'Error al registrar usuario', error: error.message });
        }
    }
});

app.post('/perfil/reservar', (req, res) => {
    // Lógica para manejar la reserva
    res.send("Reserva realizada");
});

// Incorporar el router de login
app.use('/login', loginRouter);

// Configurar el puerto y arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
