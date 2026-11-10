// Función base: crea un error normal de JavaScript y le añade datos extra
//   mensaje : texto que se puede mostrar al usuario
//   estado  : código HTTP (400, 401, 403...)
//   errores : errores por campo, por ejemplo { fecha: "mensaje" }
//   tipo    : nombre corto para reconocer qué error es

function crearErrorDominio(mensaje, estado = 500, errores = {}, tipo = "dominio") {
  const error = new Error(mensaje);
  error.name = "ErrorDominio";
  error.esDominio = true; // marca para distinguirlo de los errores inesperados
  error.tipo = tipo;
  error.estado = estado;
  error.errores = errores;
  return error;
}

// ¿Es un error previsto de nuestra aplicación?
function esErrorDominio(error) {
  return Boolean(error) && error.esDominio === true;
}

// 400: los datos enviados no son correctos
function crearErrorValidacion(errores = {}, mensaje = "Los datos enviados no son válidos.") {
  return crearErrorDominio(mensaje, 400, errores, "validacion");
}

// 401: credenciales incorrectas (mensaje genérico a propósito)
function crearErrorCredenciales() {
  return crearErrorDominio("Correo o contraseña incorrectos.", 401, {}, "credenciales");
}

// 403: usuario identificado pero sin permiso
function crearErrorPermisos(mensaje = "No tienes permisos para realizar esta acción.") {
  return crearErrorDominio(mensaje, 403, {}, "permisos");
}

// 404: el recurso no existe
function crearErrorNoEncontrado(mensaje = "El recurso solicitado no existe.") {
  return crearErrorDominio(mensaje, 404, {}, "no_encontrado");
}

// 409: conflicto (por ejemplo, equipo ya reservado en ese turno)
function crearErrorConflicto(mensaje, errores = {}) {
  return crearErrorDominio(mensaje, 409, errores, "conflicto");
}

// 429: demasiados intentos de login
function crearErrorDemasiadasPeticiones() {
  return crearErrorDominio("Demasiados intentos. Espera unos minutos e inténtalo de nuevo.", 429, {}, "limite");
}

module.exports = {
  crearErrorDominio,
  esErrorDominio,
  crearErrorValidacion,
  crearErrorCredenciales,
  crearErrorPermisos,
  crearErrorNoEncontrado,
  crearErrorConflicto,
  crearErrorDemasiadasPeticiones,
};
