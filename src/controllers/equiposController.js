'use strict';

const { TIPOS_EQUIPO, COOKIE_PREFERENCIAS } = require('../constants');
const { ValidationError } = require('../errors');
const { setFlash } = require('../middleware/flash');
const { parseId } = require('../utils/reservas');

/**
 * Filtros del catálogo. Si la petición no trae "tipo", se usa la cookie de
 * preferencias como filtro inicial (solo presentación, nunca autorización).
 */
function leerFiltros(query, cookies) {
  const filtros = { tipo: null, operativos: false };

  if (query.tipo !== undefined) {
    if (typeof query.tipo !== 'string' || (query.tipo !== '' && !TIPOS_EQUIPO.includes(query.tipo))) {
      throw new ValidationError({ tipo: 'El tipo indicado no es válido.' });
    }
    filtros.tipo = query.tipo === '' ? null : query.tipo;
  } else if (TIPOS_EQUIPO.includes(cookies[COOKIE_PREFERENCIAS])) {
    filtros.tipo = cookies[COOKIE_PREFERENCIAS];
  }

  if (query.operativos !== undefined) {
    if (query.operativos === 'true') filtros.operativos = true;
    else if (query.operativos !== 'false') {
      throw new ValidationError({ operativos: 'El filtro "operativos" debe ser true o false.' });
    }
  }
  return filtros;
}

function crearEquiposController({ equipoService, opcionesCookiePreferencias }) {
  return {
    async listar(req, res) {
      const filtros = leerFiltros(req.query, req.cookies || {});
      const equipos = await equipoService.listar(filtros);
      const cookie = (req.cookies || {})[COOKIE_PREFERENCIAS];
      res.render('equipos/index', {
        titulo: 'Equipos',
        equipos,
        filtros,
        tipos: TIPOS_EQUIPO,
        preferencia: TIPOS_EQUIPO.includes(cookie) ? cookie : null,
      });
    },

    async detalle(req, res) {
      const id = parseId(req.params.id);
      if (id === null) {
        throw new ValidationError({ id: 'El identificador del equipo no es válido.' });
      }
      const equipo = await equipoService.obtener(id);
      res.render('equipos/detalle', { titulo: equipo.nombre, equipo });
    },

    guardarPreferencia(req, res) {
      const tipo = req.body && req.body.tipo;
      if (tipo === 'ninguno') {
        const { maxAge, ...sinMaxAge } = opcionesCookiePreferencias;
        res.clearCookie(COOKIE_PREFERENCIAS, sinMaxAge);
        setFlash(req, 'exito', 'Preferencia eliminada.');
      } else if (typeof tipo === 'string' && TIPOS_EQUIPO.includes(tipo)) {
        res.cookie(COOKIE_PREFERENCIAS, tipo, opcionesCookiePreferencias);
        setFlash(req, 'exito', 'Preferencia guardada. Se usará como filtro inicial del catálogo.');
      } else {
        throw new ValidationError({ tipo: 'El tipo preferido debe ser portátil, sobremesa o ninguno.' });
      }
      res.redirect(303, '/equipos');
    },
  };
}

module.exports = { crearEquiposController, leerFiltros };
