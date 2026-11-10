// Cualquier error que ocurra en la aplicación acaba aquí.
// Así todas las páginas de error se ven igual y NUNCA se
// muestran trazas, rutas internas ni datos sensibles.

const { esErrorDominio, crearErrorNoEncontrado } = require("../errors/errores");

// Se usa cuando ninguna ruta coincide con la URL pedida
function rutaNoEncontrada(req, res, next) {
  next(crearErrorNoEncontrado("La página que buscas no existe."));
}

// Manejador final (Express reconoce que es de errores por tener 4 parámetros)
function manejarErrores(error, req, res, next) {
  if (res.headersSent) return next(error);

  let estado = 500;
  let mensaje = "Ha ocurrido un error interno. Inténtalo más tarde.";

  if (esErrorDominio(error)) {
    // Error previsto: su mensaje es seguro de mostrar
    estado = error.estado;
    mensaje = error.message;
  } else if (error && error.status >= 400 && error.status < 500) {
    // Error del cliente generado por Express (por ejemplo, cuerpo demasiado grande)
    estado = error.status;
    mensaje = "La petición no es válida.";
  } else if (process.env.NODE_ENV !== "test") {
    // Error inesperado: se anota en el log del servidor, NO en la página
    console.error(error);
  }

  res.status(estado).render("error", { titulo: "Error", estado, mensaje });
}

module.exports = { rutaNoEncontrada, manejarErrores };
