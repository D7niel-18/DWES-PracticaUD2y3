// ============================================================
// RUTAS DE ADMINISTRACIÓN (solo rol "admin")
// ============================================================

const express = require("express");
const { requiereRol } = require("../middleware/auth");

function crearAdminRoutes({ adminController }) {
  // Se monta con el prefijo /admin (ver app.js)
  const router = express.Router();

  // Guardia para TODAS las rutas de este archivo
  router.use(requiereRol("admin"));

  router.get("/equipos", adminController.equipos);
  router.post("/equipos", adminController.crearEquipo);
  router.post("/equipos/:id/estado", adminController.cambiarEstado);
  router.get("/reservas", adminController.reservas);
  router.post("/reservas/:id/cancelar", adminController.cancelarReserva);

  return router;
}

module.exports = crearAdminRoutes;
