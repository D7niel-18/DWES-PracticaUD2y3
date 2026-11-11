const NOMBRE_COOKIE_SESION = "sid"; // cookie de la sesión (identidad)
const NOMBRE_COOKIE_PREFERENCIA = "pref_tipo"; // cookie de preferencias (solo comodidad)

// Cookie de sesión
function opcionesCookieSesion(config) {
  return {
    httpOnly: true,
    secure: config.esProduccion,
    sameSite: "lax",
    maxAge: config.sesionMaxAgeMs,
  };
}

// Cookie de preferencias: dura un año. OJO: el usuario puede modificarla,
// por eso JAMÁS se usa para decidir permisos; solo para el filtro inicial.
function opcionesCookiePreferencia(config) {
  return {
    httpOnly: true,
    secure: config.esProduccion,
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60 * 1000,
  };
}

module.exports = {
  NOMBRE_COOKIE_SESION,
  NOMBRE_COOKIE_PREFERENCIA,
  opcionesCookieSesion,
  opcionesCookiePreferencia,
};
