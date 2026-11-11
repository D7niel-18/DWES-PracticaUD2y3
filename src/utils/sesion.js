'use strict';

/**
 * Regenera el ID de la sesión para prevenir Session Fixation.
 */
function regenerarSesion(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/**
 * Guarda manualmente la sesión en el almacenamiento.
 */
function guardarSesion(req) {
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/**
 * Destruye la sesión del servidor (logout).
 */
function destruirSesion(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  regenerarSesion,
  guardarSesion,
  destruirSesion,
};