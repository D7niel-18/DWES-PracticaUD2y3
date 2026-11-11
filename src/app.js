// ============================================================
// APP.JS: CONSTRUYE LA APLICACIÓN (pero NO arranca el servidor)
// ------------------------------------------------------------
// Separar app.js de server.js permite que las pruebas automáticas
// usen la aplicación sin abrir un puerto de red.
// Aquí se "enchufa" todo: repositorios -> servicios -> controladores -> rutas.
// ============================================================

const path = require("path");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { rateLimit } = require("express-rate-limit");

const { crearRepositorios } = require("./repositories");
const AuthService = require("./services/authService");
const EquiposService = require("./services/equiposService");
const ReservasService = require("./services/reservasService");

const crearAuthController = require("./controllers/authController");
const crearEquiposController = require("./controllers/equiposController");
const crearReservasController = require("./controllers/reservasController");
const crearAdminController = require("./controllers/adminController");

const crearAuthRoutes = require("./routes/auth.routes");
const crearEquiposRoutes = require("./routes/equipos.routes");
const crearReservasRoutes = require("./routes/reservas.routes");
const crearAdminRoutes = require("./routes/admin.routes");

const { crearCargarUsuario } = require("./middleware/auth");
const { prepararCsrf, verificarCsrf } = require("./middleware/csrf");
const { prepararFlash } = require("./middleware/flash");
const { rutaNoEncontrada, manejarErrores } = require("./middleware/errorHandler");
const { NOMBRE_COOKIE_SESION, opcionesCookieSesion } = require("./config/cookies");
const { ErrorDemasiadasPeticiones } = require("./errors/errores");
const etiquetas = require("./utils/etiquetas");

// "config" viene de fuera; "repositorios" es opcional (las pruebas pasan los suyos)
function crearApp({ config, repositorios } = {}) {
  const repos = repositorios || crearRepositorios({ coste: config.costeBcrypt });

  // ---------- Servicios (reglas de negocio) ----------
  const authService = new AuthService({ usuariosRepo: repos.usuarios, costeBcrypt: config.costeBcrypt });
  const equiposService = new EquiposService({ equiposRepo: repos.equipos });
  const reservasService = new ReservasService({
    reservasRepo: repos.reservas,
    equiposRepo: repos.equipos,
    usuariosRepo: repos.usuarios,
  });

  // ---------- Controladores ----------
  const authController = crearAuthController({ authService, config });
  const equiposController = crearEquiposController({ equiposService, config });
  const reservasController = crearReservasController({ reservasService });
  const adminController = crearAdminController({ equiposService, reservasService });

  // ---------- Limitador de intentos de login ----------
  const limitadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000, // ventana de 15 minutos
    limit: config.loginMax, // intentos permitidos en esa ventana
    skipSuccessfulRequests: true, // los logins correctos no cuentan
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res, next) => next(new ErrorDemasiadasPeticiones()), // 429
  });

  // ---------- Configuración general de Express ----------
  const app = express();
  app.disable("x-powered-by"); // no anunciamos qué tecnología usamos
  if (config.esProduccion) app.set("trust proxy", 1); // detrás de un proxy HTTPS
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  // Funciones de ayuda disponibles en todas las vistas
  Object.assign(app.locals, etiquetas);

  // Valores por defecto para las vistas (también para las páginas de error)
  app.use((req, res, next) => {
    res.locals.usuario = null;
    res.locals.csrfToken = "";
    res.locals.flash = null;
    res.locals.titulo = "Reserva de equipos";
    next();
  });

  // ---------- Middleware global (el ORDEN importa) ----------
  app.use(express.urlencoded({ extended: false, limit: "10kb" })); // lee formularios
  app.use(cookieParser()); // lee cookies (la de preferencias)
  app.use(
    session({
      name: NOMBRE_COOKIE_SESION,
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: opcionesCookieSesion(config),
    })
  );
  app.use(crearCargarUsuario(authService)); // ¿quién es el usuario?
  app.use(prepararFlash); // mensajes de un solo uso
  app.use(prepararCsrf); // token anti-CSRF
  app.use(verificarCsrf); // exige el token en los POST

  // ---------- Rutas ----------
  app.get("/", (req, res) => res.redirect(303, "/equipos"));
  app.use(crearAuthRoutes({ authController, limitadorLogin }));
  app.use(crearEquiposRoutes({ equiposController }));
  app.use(crearReservasRoutes({ reservasController }));
  app.use("/admin", crearAdminRoutes({ adminController }));

  // ---------- Errores (siempre al final) ----------
  app.use(rutaNoEncontrada);
  app.use(manejarErrores);

  return app;
}

module.exports = { crearApp };
