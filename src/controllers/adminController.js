'use strict';

const { TIPOS_EQUIPO, ESTADOS_EQUIPO } = require('../constants');
const { ValidationError } = require('../errors');
const { setFlash } = require('../middleware/flash');
const { parseId } = require('../utils/reservas');
const { validarEquipo } = require('../utils/validacion');

function crearAdminController({ equipoService, reservaService }) {
  async function renderEquipos(res, status, valores, errores) {
    const equipos = await equipoService.listar();
    res.status(status).render('admin/equipos', {
      titulo: 'Administración de equipos',
      equipos,
      tipos: TIPOS_EQUIPO,
      estados: ESTADOS_EQUIPO,
      valores,
      errores,
    });
  }

  const valoresVacios = { codigo: '', nombre: '', tipo: '', estado: 'operativo' };

  return {
    async listarEquipos(req, res) {
      await renderEquipos(res, 200, valoresVacios, {});
    },

    async crearEquipo(req, res) {
      const { valido, errores, datos } = validarEquipo(req.body);
      if (!valido) {
        return renderEquipos(res, 400, datos, errores);
      }
      try {
        const equipo = await equipoService.crear(datos);
        setFlash(req, 'exito', `Equipo ${equipo.codigo} añadido correctamente.`);
        return res.redirect(303, '/admin/equipos');
      } catch (err) {
        if (err instanceof ValidationError) {
          return renderEquipos(res, 400, datos, err.errores);
        }
        throw err;
      }
    },

    async cambiarEstado(req, res) {
      const id = parseId(req.params.id);
      if (id === null) {
        throw new ValidationError({ id: 'El identificador del equipo no es válido.' });
      }
      const estado = req.body && req.body.estado;
      if (typeof estado !== 'string' || !ESTADOS_EQUIPO.includes(estado)) {
        throw new ValidationError({ estado: 'El estado debe ser operativo o fuera de servicio.' });
      }
      const equipo = await equipoService.cambiarEstado(id, estado);
      setFlash(req, 'exito', `El equipo ${equipo.codigo} ahora está: ${estado.replace(/_/g, ' ')}.`);
      res.redirect(303, '/admin/equipos');
    },

    async listarReservas(req, res) {
      const reservas = await reservaService.listarTodas();
      res.render('admin/reservas', { titulo: 'Administración de reservas', reservas });
    },

    async cancelarReserva(req, res) {
      const id = parseId(req.params.id);
      if (id === null) {
        throw new ValidationError({ id: 'El identificador de la reserva no es válido.' });
      }
      await reservaService.cancelarComoAdmin(id);
      setFlash(req, 'exito', 'La reserva se ha cancelado correctamente.');
      res.redirect(303, '/admin/reservas');
    },
  };
}

module.exports = { crearAdminController };
