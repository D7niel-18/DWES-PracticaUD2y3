// ============================================================
// RUTAS PÚBLICAS DE EQUIPOS (cualquier visitante puede verlas)
// ============================================================

const express = require("express");

function crearEquiposRoutes({ equiposController }) {
  const router = express.Router();

  router.get("/equipos", equiposController.listar);
  router.get("/equipos/:id", equiposController.ficha);

  return router;
}

module.exports = crearEquiposRoutes;
