'use strict';

const path = require('path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// 1. Repositorios (en memoria)
const crearUsuariosRepo = require('./repositories/usuariosRepo');
const crearEquiposRepo = require('./repositories/equiposRepo');
const crearReservasRepo = require('./repositories/reservasRepo');

// 2. Servicios
const crearAuthService = require('./services/authService');
const crearEquiposService = require('./services/equiposService');
const crearReservasService = require('./services/reservasService');

// 3. Controladores
const crearAuthController = require('./controllers/authController');
const { crearEquiposController } = require('./controllers/equiposController');
const { crearReservasController } = require('./controllers/reservasController');
const { crearAdminController } = require('./controllers/adminController');

// 4. Rutas
const crearAuthRoutes = require('./routes/authRoutes');
const crearEquiposRoutes = require('./routes/equiposRoutes');
const crearReservasRoutes = require('./routes/reservasRoutes');
const crearAdminRoutes = require('./routes/adminRoutes');

// 5. Middlewares
const { crearCargarUsuario } = require('./middleware/auth');
const { crearLimitadorLogin } = require('./middleware/rateLimit');
const { prepararCsrf, verificarCsrf } = require('./middleware/csrf');
const { rutaNoEncontrada, manejarErrores } = require('./middleware/errorMiddleware');
const { middlewareFlash } = require('./middleware/flash');

// Configuración global
const config = require('./config/appConfig');

const app = express();

// Configuración de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares base para procesamiento de peticiones
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(config.cookieSecret));

// Configuración de sesión
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: config.cookieSesionOptions,
  })
);

// Inicialización del almacenamiento (Semilla de datos iniciales)
const usuariosRepo = crearUsuariosRepo(config.datosIniciales.usuarios);
const equiposRepo = crearEquiposRepo(config.datosIniciales.equipos);
const reservasRepo = crearReservasRepo(config.datosIniciales.reservas);

// Instanciación de servicios (Inyección de dependencias)
const authService = crearAuthService({ usuariosRepo, costeBcrypt: config.costeBcrypt });
const equiposService = crearEquiposService({ equiposRepo });
const reservasService = crearReservasService({ reservasRepo, equiposRepo, usuariosRepo });

// Instanciación de controladores
const authController = crearAuthController({ authService, config });
const equiposController = crearEquiposController({
  equipoService: equiposService,
  opcionesCookiePreferencias: config.opcionesCookiePreferencias,
});
const reservasController = crearReservasController({ reservaService: reservasService });
const adminController = crearAdminController({
  equipoService: equiposService,
  reservaService: reservasService,
});

// Middlewares globales de estado y seguridad
app.use(crearCargarUsuario(authService));
app.use(prepararCsrf);
app.use(middlewareFlash);
app.use(verificarCsrf); // Protección CSRF aplicada globalmente a peticiones POST/PUT/DELETE

// Limitador de tasa para el login
const limitadorLogin = crearLimitadorLogin(config);

// Montaje de rutas
app.get('/', (req, res) => res.redirect(303, '/equipos'));
app.use('/', crearAuthRoutes({ authController, limitadorLogin }));
app.use('/equipos', crearEquiposRoutes({ equiposController }));
app.use('/', crearReservasRoutes({ reservasController }));
app.use('/admin', crearAdminRoutes({ adminController }));

// Manejo centralizado de 404 y errores
app.use(rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;