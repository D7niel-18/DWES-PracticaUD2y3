// Tras una operación correcta redirigimos (patrón PRG) y queremos
// mostrar "Reserva creada" en la página siguiente... una sola vez.
// Se guarda en la sesión y se borra en cuanto se lee.

function prepararFlash(req, res, next) {
  // Función para dejar un mensaje antes de redirigir
  req.flash = (tipo, mensaje) => {
    req.session.flash = { tipo, texto: mensaje }; // tipo: "exito" o "error"
  };

  // Si había un mensaje pendiente, lo pasamos a la vista y lo borramos
  if (req.session.flash) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
  }
  next();
}

module.exports = { prepararFlash };
