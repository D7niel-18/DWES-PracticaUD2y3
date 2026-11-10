// Defensa: cada sesión tiene un "token" secreto. Los formularios
// lo incluyen en un campo oculto y el servidor comprueba que
// coincide. Una web externa no puede conocer ese token.

const crypto = require("crypto");
const { crearErrorPermisos } = require("../errors/errores");

// Crea (si no existe) el token de la sesión y lo pone a disposición de las vistas
function prepararCsrf(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

// Comprueba el token en todas las peticiones que MODIFICAN algo
function verificarCsrf(req, res, next) {
  const metodosSeguros = ["GET", "HEAD", "OPTIONS"];
  if (metodosSeguros.includes(req.method)) return next();

  const esperado = req.session.csrfToken;
  const recibido = req.body ? req.body._csrf : undefined;

  if (typeof esperado !== "string" || typeof recibido !== "string") {
    return next(crearErrorPermisos("Petición rechazada: falta el token de seguridad."));
  }
  const a = Buffer.from(esperado);
  const b = Buffer.from(recibido);
  // timingSafeEqual compara sin revelar información por el tiempo que tarda
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return next(crearErrorPermisos("Petición rechazada: el token de seguridad no es válido."));
  }
  next();
}

module.exports = { prepararCsrf, verificarCsrf };