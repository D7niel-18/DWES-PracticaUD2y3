const { rateLimit } = require("express-rate-limit");
const { crearErrorDemasiadasPeticiones } = require("../errors/errores");

// "config.loginMax" es el número de intentos fallidos permitidos
function crearLimitadorLogin(config) {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // ventana de 15 minutos
    limit: config.loginMax, // intentos permitidos en esa ventana
    skipSuccessfulRequests: true, // los logins correctos no cuentan
    standardHeaders: "draft-7",
    legacyHeaders: false,
    // Cuando se supera el límite, pasamos el error al manejador central
    handler: (req, res, next) => next(crearErrorDemasiadasPeticiones()), // 429
  });
}

module.exports = { crearLimitadorLogin };