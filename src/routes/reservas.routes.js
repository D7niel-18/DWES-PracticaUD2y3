// ============================================================
// RUTAS DE RESERVAS (solo usuarios con sesión iniciada)
// ============================================================

const express = require("express");
const { requiereAutenticacion } = require("../middleware/auth");

function crearReservasRoutes({ reservasController }) {
  const router = express.Router();

  // Todas las rutas de este archivo exigen estar autenticado
  router.use(requiereAutenticacion);

  router.get("/reservas/nueva", reservasController.mostrarFormulario);
  router.post("/reservas", reservasController.crear);
  router.get("/mis-reservas", reservasController.misReservas);
  router.post("/reservas/:id/cancelar", reservasController.cancelar);

  return router;
}

module.exports = crearReservasRoutes;
