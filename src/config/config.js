// Carga el archivo .env (si existe) y lo convierte en variables de entorno
require("dotenv").config();

// Entornos permitidos
const ENTORNOS_VALIDOS = ["development", "test", "production"];

function cargarConfiguracion() {
  const errores = []; // Aquí iremos anotando los problemas encontrados

  // ---- 1) PORT: debe ser un número entero entre 1 y 65535 ----
  const puerto = Number(process.env.PORT || 3000);
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    errores.push("PORT debe ser un número entero entre 1 y 65535.");
  }

  // ---- 2) NODE_ENV: solo puede ser uno de los valores permitidos ----
  const entorno = process.env.NODE_ENV || "development";
  if (!ENTORNOS_VALIDOS.includes(entorno)) {
    errores.push(`NODE_ENV debe ser uno de: ${ENTORNOS_VALIDOS.join(", ")}.`);
  }

  // ---- 3) SESSION_SECRET: obligatorio y con al menos 16 caracteres ----
  const secreto = process.env.SESSION_SECRET;
  if (!secreto || secreto.length < 16) {
    errores.push("SESSION_SECRET es obligatorio y debe tener al menos 16 caracteres.");
  }

  // Si hay errores, paramos todo con un mensaje claro
  if (errores.length > 0) {
    throw new Error("Configuración incorrecta:\n - " + errores.join("\n - "));
  }

  // Si todo está bien, devolvemos la configuración lista para usar
  return {
    port: puerto,
    nodeEnv: entorno,
    sessionSecret: secreto,
    esProduccion: entorno === "production",
    // Valores fijos de la aplicación (se pueden cambiar en las pruebas)
    loginMax: 5, // intentos de login fallidos permitidos cada 15 minutos
    costeBcrypt: 10, // "fuerza" del cifrado de contraseñas
    sesionMaxAgeMs: 2 * 60 * 60 * 1000, // la sesión dura 2 horas
  };
}

module.exports = cargarConfiguracion;
