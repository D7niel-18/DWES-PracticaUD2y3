// ============================================================
// RUTAS DE AUTENTICACIÓN
// ------------------------------------------------------------
// Las rutas solo dicen: "método + URL + guardias + controlador".
// ============================================================

const express = require("express");
const { requiereAutenticacion } = require("../middleware/auth");

function crearAuthRoutes({ authController, limitadorLogin }) {
  const router = express.Router();

  router.get("/registro", authController.mostrarRegistro);
  router.post("/registro", authController.registrar);

  router.get("/login", authController.mostrarLogin);
  // El limitador frena los intentos repetidos de login (fuerza bruta)
  router.post("/login", limitadorLogin, authController.login);

  router.post("/logout", authController.logout);
  router.get("/perfil", requiereAutenticacion, authController.perfil);

  return router;
}

module.exports = crearAuthRoutes;
