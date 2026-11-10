const { crearErrorPermisos } = require("../errors/errores");

// Asverigua quién es el usuario a partir de la sesión del servidor.
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

// Exige haber iniciado sesión. Si no, redirige al login (303).
function requiereAutenticacion(req, res, next) {
  if (!req.usuario) return res.redirect(303, "/login");
  next();
}

// Exige uno de los roles indicados (se pasan en una lista).
function requiereRol(rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) return res.redirect(303, "/login");
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(crearErrorPermisos()); // 403
    }
    next();
  };
}

module.exports = { crearCargarUsuario, requiereAutenticacion, requiereRol };