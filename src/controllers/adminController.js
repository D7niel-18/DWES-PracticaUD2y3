// Las rutas que usan este controlador están protegidas por el
// middleware requiereRol("admin"), así que aquí ya sabemos que
// quien llama es administrador.

const { ErrorDominio, ErrorValidacion } = require("../errors/errores");
const { texto, validarId } = require("../utils/validaciones");

function crearAdminController({ equiposService, reservasService }) {
  // Dibuja la página de equipos (se usa al entrar y al fallar el alta)
  function renderEquipos(res, estado, valores = {}, errores = {}, mensajeError = null) {
    res.status(estado).render("admin/equipos", {
      titulo: "Administrar equipos",
      equipos: equiposService.listar(),
      valores,
      errores,
      mensajeError,
    });
  }

  return {
    // GET /admin/equipos
    equipos(req, res) {
      renderEquipos(res, 200);
    },

    // POST /admin/equipos  (añadir un equipo)
    crearEquipo(req, res) {
      const datos = req.body || {};
      try {
        const equipo = equiposService.crear(datos);
        req.flash("exito", `Equipo ${equipo.codigo} añadido.`);
        res.redirect(303, "/admin/equipos");
      } catch (error) {
        if (!(error instanceof ErrorDominio)) throw error;
        const valores = {
          codigo: texto(datos.codigo),
          nombre: texto(datos.nombre),
          tipo: texto(datos.tipo),
          estado: texto(datos.estado),
        };
        renderEquipos(res, error.estado, valores, error.errores, error.message);
      }
    },

    // POST /admin/equipos/:id/estado
    cambiarEstado(req, res) {
      const id = validarId(req.params.id);
      if (id === null) throw new ErrorValidacion({}, "El identificador del equipo no es válido.");
      const equipo = equiposService.cambiarEstado(id, texto((req.body || {}).estado));
      req.flash("exito", `El equipo ${equipo.codigo} ahora está: ${equipo.estado.replace(/_/g, " ")}.`);
      res.redirect(303, "/admin/equipos");
    },

    // GET /admin/reservas
    reservas(req, res) {
      res.render("admin/reservas", {
        titulo: "Todas las reservas",
        reservas: reservasService.listarTodas(),
      });
    },

    // POST /admin/reservas/:id/cancelar
    cancelarReserva(req, res) {
      const id = validarId(req.params.id);
      if (id === null) throw new ErrorValidacion({}, "El identificador de la reserva no es válido.");
      reservasService.cancelar(id, req.usuario); // rol admin: puede cancelar cualquiera
      req.flash("exito", "Reserva cancelada.");
      res.redirect(303, "/admin/reservas");
    },
  };
}

module.exports = crearAdminController;
