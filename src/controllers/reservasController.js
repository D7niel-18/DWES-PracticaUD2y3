const { ErrorDominio, ErrorValidacion } = require("../errors/errores");
const { texto, validarId } = require("../utils/validaciones");
const { validarFechaTurno } = require("../utils/reservas");
const crearModeloFormularioReserva = require("./modeloFormularioReserva");

function crearReservasController({ reservasService }) {
  return {
    // GET /reservas/nueva?fecha=2027-02-01&turno=tarde
    // Esta misma petición GET sirve para consultar la disponibilidad.
    mostrarFormulario(req, res) {
      const fecha = texto(req.query.fecha);
      const turno = texto(req.query.turno);
      let errores = {};

      // Solo mostramos errores si el usuario ya ha rellenado algo
      if (fecha !== "" || turno !== "") {
        errores = validarFechaTurno(fecha, turno, reservasService.hoy());
      }
      const modelo = crearModeloFormularioReserva(reservasService, { valores: { fecha, turno }, errores });
      res.render("reservas/nueva", modelo);
    },

    // POST /reservas
    crear(req, res) {
      const datos = req.body || {};
      // Nos quedamos SOLO con los campos esperados. El usuario
      // (usuarioId) sale de la sesión, nunca del formulario.
      const entrada = {
        equipoId: datos.equipoId,
        fecha: texto(datos.fecha),
        turno: texto(datos.turno),
      };

      try {
        reservasService.crear(req.usuario.id, entrada);
        req.flash("exito", "Reserva creada correctamente.");
        res.redirect(303, "/mis-reservas"); // PRG
      } catch (error) {
        if (!(error instanceof ErrorDominio)) throw error;

        // Conservamos solo los campos que NO tienen error
        const errores = error.errores || {};
        const valores = {
          fecha: errores.fecha ? "" : entrada.fecha,
          turno: errores.turno ? "" : entrada.turno,
          equipoId: errores.equipoId ? "" : texto(entrada.equipoId),
        };
        const modelo = crearModeloFormularioReserva(reservasService, {
          valores,
          errores,
          mensajeError: error.message,
        });
        res.status(error.estado).render("reservas/nueva", modelo);
      }
    },

    // GET /mis-reservas
    misReservas(req, res) {
      res.render("reservas/mis-reservas", {
        titulo: "Mis reservas",
        reservas: reservasService.listarDeUsuario(req.usuario.id),
      });
    },

    // POST /reservas/:id/cancelar
    cancelar(req, res) {
      const id = validarId(req.params.id);
      if (id === null) throw new ErrorValidacion({}, "El identificador de la reserva no es válido.");

      // El servicio comprueba que la reserva es de este usuario
      reservasService.cancelar(id, req.usuario);
      req.flash("exito", "Reserva cancelada.");
      res.redirect(303, "/mis-reservas");
    },
  };
}

module.exports = crearReservasController;
