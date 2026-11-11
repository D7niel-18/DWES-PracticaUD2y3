// ============================================================
// VALIDACIONES GENERALES
// ------------------------------------------------------------
// Funciones sencillas que comprueban los datos que llegan desde
// el navegador. No dependen de Express (no usan req ni res).
// Todas devuelven: { valido, errores, valores }
//   - errores: un mensaje por cada campo incorrecto
//   - valores: los datos ya limpios y convertidos
// ============================================================

const TIPOS_EQUIPO = ["sobremesa", "portatil"];
const ESTADOS_EQUIPO = ["operativo", "fuera_de_servicio"];
const TURNOS = ["manana", "tarde"];

// Convierte cualquier cosa en texto sin espacios sobrantes.
// Si no es texto (por ejemplo un array o un objeto), devuelve "".
function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

// Convierte "5" en el número 5. Si no es un entero positivo, devuelve null.
function validarId(valor) {
  const t = texto(valor);
  if (!/^\d+$/.test(t)) return null;
  const numero = Number(t);
  return Number.isSafeInteger(numero) && numero > 0 ? numero : null;
}

function terminar(errores, valores) {
  return { valido: Object.keys(errores).length === 0, errores, valores };
}

// ---- Registro de usuarios ----
function validarRegistro(datos = {}) {
  const errores = {};
  const nombre = texto(datos.nombre);
  const email = texto(datos.email).toLowerCase();
  const password = typeof datos.password === "string" ? datos.password : "";
  const password2 = typeof datos.password2 === "string" ? datos.password2 : "";

  if (nombre.length < 2 || nombre.length > 60) {
    errores.nombre = "El nombre debe tener entre 2 y 60 caracteres.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
    errores.email = "Introduce un correo electrónico válido.";
  }
  // bcrypt solo usa los primeros 72 bytes, por eso ese es el máximo
  if (password.length < 8 || Buffer.byteLength(password) > 72) {
    errores.password = "La contraseña debe tener entre 8 y 72 caracteres.";
  }
  if (password !== password2) {
    errores.password2 = "Las contraseñas no coinciden.";
  }
  return terminar(errores, { nombre, email, password });
}

// ---- Inicio de sesión ----
function validarLogin(datos = {}) {
  const errores = {};
  const email = texto(datos.email).toLowerCase();
  const password = typeof datos.password === "string" ? datos.password : "";
  if (email === "" || password === "") {
    errores.general = "Introduce tu correo y tu contraseña.";
  }
  return terminar(errores, { email, password });
}

// ---- Alta de equipos (administración) ----
function validarEquipo(datos = {}) {
  const errores = {};
  const codigo = texto(datos.codigo).toUpperCase();
  const nombre = texto(datos.nombre);
  const tipo = texto(datos.tipo);
  const estado = texto(datos.estado) || "operativo"; // por defecto, operativo

  if (!/^[A-Z0-9-]{2,20}$/.test(codigo)) {
    errores.codigo = "El código usa 2-20 letras, números o guiones (ej. PC-010).";
  }
  if (nombre.length < 2 || nombre.length > 80) {
    errores.nombre = "El nombre debe tener entre 2 y 80 caracteres.";
  }
  if (!TIPOS_EQUIPO.includes(tipo)) {
    errores.tipo = "Elige un tipo válido (sobremesa o portátil).";
  }
  if (!ESTADOS_EQUIPO.includes(estado)) {
    errores.estado = "Elige un estado válido.";
  }
  return terminar(errores, { codigo, nombre, tipo, estado });
}

module.exports = {
  TIPOS_EQUIPO,
  ESTADOS_EQUIPO,
  TURNOS,
  texto,
  validarId,
  validarRegistro,
  validarLogin,
  validarEquipo,
};
