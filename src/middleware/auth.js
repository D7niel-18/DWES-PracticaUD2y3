// ============================================================
// MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN
// ------------------------------------------------------------
// Un middleware es un "guardia de seguridad": se ejecuta ANTES
// de la ruta y decide si la petición puede pasar o no.
// ============================================================

const { ErrorPermisos } = require("../errors/errores");

// 1) Averigua quién es el usuario a partir de la sesión del servidor.
//    Importante: en la sesión solo se guarda el id. El rol se lee
//    del repositorio, nunca de una cookie que el cliente pueda tocar.
function crearCargarUsuario(authService) {
  return (req, res, next) => {
    req.usuario = null;
    const id = req.session.usuarioId;
    if (id) {
      const usuario = authService.buscarPorId(id);
      if (usuario) {
        req.usuario = usuario;
        res.locals.usuario = authService.aPublico(usuario); // para las vistas
      } else {
        delete req.session.usuarioId; // el usuario ya no existe
      }
    }
    next();
  };
}

// 2) Exige haber iniciado sesión. Si no, redirige al login (303).
function requiereAutenticacion(req, res, next) {
  if (!req.usuario) return res.redirect(303, "/login");
  next();
}

// 3) Exige uno de los roles indicados. Ejemplo: requiereRol("admin").
function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) return res.redirect(303, "/login");
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(new ErrorPermisos()); // 403
    }
    next();
  };
}

module.exports = { crearCargarUsuario, requiereAutenticacion, requiereRol };
