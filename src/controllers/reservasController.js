'use strict';

const { AppError, ValidationError } = require('../errors');
const { setFlash } = require('../middleware/flash');
const { parseId, validarFechaTurno, validarReserva } = require('../utils/reservas');
const { construirModeloFormularioReserva } = require('../viewmodels/reservaFormViewModel');
const { ETIQUETAS_TURNO } = require('../constants');

const aTexto = (valor) => (typeof valor === 'string' ? valor : '');

function crearReservasController({ reservaService }) {
  async function construirModelo(valores, errores) {
    const disponibles =
      valores.fecha && valores.turno
        ? await reservaService.equiposDisponibles(valores.fecha, valores.turno)
        : null;
    return construirModeloFormularioReserva({ valores, errores, disponibles, hoy: reservaService.hoy() });
  }

  return {
    /** Paso 1 (GET): elegir fecha y turno. Paso 2: elegir entre los equipos disponibles. */
    async mostrarFormulario(req, res) {
      const entrada = {
        fecha: aTexto(req.query.fecha),
        turno: aTexto(req.query.turno),
      };
      const valores = { equipoId: parseId(aTexto(req.query.equipoId)), fecha: null, turno: null };
      let errores = {};
      if (entrada.fecha !== '' || entrada.turno !== '') {
        const resultado = validarFechaTurno(entrada, reservaService.hoy());
        errores = resultado.errores;
        valores.fecha = resultado.datos.fecha;
        valores.turno = resultado.datos.turno;
      }
      const status = Object.keys(errores).length > 0 ? 400 : 200;
      res.status(status).render('reservas/nueva', await construirModelo(valores, errores));
    },

    async crear(req, res) {
      const resultado = validarReserva(req.body, reservaService.hoy());
      const volverAlFormulario = async (status, errores) =>
        res.status(status).render('reservas/nueva', await construirModelo(resultado.datos, errores));

      if (!resultado.valido) {
        return volverAlFormulario(400, resultado.errores);
      }

      try {
        // El usuario sale SIEMPRE de la sesión, nunca del cuerpo de la petición.
        const reserva = await reservaService.crearReserva({ usuarioId: req.user.id, ...resultado.datos });
        setFlash(
          req,
          'exito',
          `Reserva #${reserva.id} confirmada para el ${reserva.fecha} (${ETIQUETAS_TURNO[reserva.turno]}).`,
        );
        return res.redirect(303, '/mis-reservas');
      } catch (err) {
        if (err instanceof AppError && [400, 404, 409].includes(err.status)) {
          const errores =
            err instanceof ValidationError && Object.keys(err.errores).length > 0
              ? err.errores
              : { general: err.message };
          return volverAlFormulario(err.status, errores);
        }
        throw err;
      }
    },

    async misReservas(req, res) {
      const reservas = await reservaService.listarDeUsuario(req.user.id);
      res.render('reservas/mis-reservas', { titulo: 'Mis reservas', reservas });
    },

    async cancelar(req, res) {
      const id = parseId(req.params.id);
      if (id === null) {
        throw new ValidationError({ id: 'El identificador de la reserva no es válido.' });
      }
      await reservaService.cancelarPropia(id, req.user);
      setFlash(req, 'exito', 'La reserva se ha cancelado correctamente.');
      res.redirect(303, '/mis-reservas');
    },
  };
}

module.exports = { crearReservasController };
