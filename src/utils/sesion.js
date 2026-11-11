// ============================================================
// AYUDAS PARA LA SESIÓN
// ------------------------------------------------------------
// express-session trabaja con "callbacks" (funciones de retorno).
// Aquí los convertimos en promesas para poder usar await,
// que se lee de forma mucho más natural.
// ============================================================

// Crea una sesión NUEVA con un identificador distinto (evita la
// "fijación de sesión"). Se usa justo al iniciar sesión.
function regenerarSesion(req) {
  return new Promise((resolver, rechazar) => {
    req.session.regenerate((error) => (error ? rechazar(error) : resolver()));
  });
}

// Guarda la sesión en el servidor
function guardarSesion(req) {
  return new Promise((resolver, rechazar) => {
    req.session.save((error) => (error ? rechazar(error) : resolver()));
  });
}

// Borra la sesión del servidor (cierre de sesión)
function destruirSesion(req) {
  return new Promise((resolver, rechazar) => {
    req.session.destroy((error) => (error ? rechazar(error) : resolver()));
  });
}

module.exports = { regenerarSesion, guardarSesion, destruirSesion };
