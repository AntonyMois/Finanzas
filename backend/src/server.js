const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initDb } = require('./config/db');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(helmet()); // cabeceras de seguridad
app.use(
  cors({
    // Permitimos el frontend que corre en localhost:3000 por defecto
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Limitador de peticiones para mitigar fuerza bruta en login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máx 20 intentos por IP
  message: { message: 'Demasiados intentos, inténtalo de nuevo más tarde.' },
});

// Rutas
app.use('/api/auth', authLimiter, authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

// Iniciar servidor solo después de inicializar la BD
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor backend escuchando en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error al inicializar la base de datos:', err);
    process.exit(1);
  });


