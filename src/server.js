// ============================================================
// SERVER.JS: ARRANCA EL SERVIDOR
// ------------------------------------------------------------
// Este es el único archivo que abre un puerto de red.
// ============================================================

const cargarConfiguracion = require("./config/config");
const { crearApp } = require("./app");

let config;
try {
  config = cargarConfiguracion(); // si la configuración es mala, se detiene aquí
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const app = crearApp({ config });

app.listen(config.port, () => {
  console.log(`Servidor listo en http://localhost:${config.port} (${config.nodeEnv})`);
});
