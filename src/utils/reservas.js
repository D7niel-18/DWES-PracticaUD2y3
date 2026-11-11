'use strict';

const TIPOS_TURNO = ['manana', 'tarde'];

/**
 * Convierte un valor recibido a un ID entero válido (>0) o devuelve null.
 */
function parseId(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const num = Number(valor);
  return Number.isInteger(num) && num > 0 ? num : null;
}

/**
 * Devuelve la fecha actual en formato ISO 'YYYY-MM-DD'.
 */
function obtenerFechaHoy(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * Comprueba si un equipo ya tiene una reserva activa en esa fecha y turno.
 */
function estaReservado(equipoId, fecha, turno, todasLasReservas = []) {
  const id = typeof equipoId === 'number' ? equipoId : parseId(equipoId);
  return todasLasReservas.some(
    (r) =>
      r.equipoId === id &&
      r.fecha === fecha &&
      r.turno === turno &&
      r.estado === 'activa'
  );
}

/**
 * Filtra los equipos que están en estado operativo y libres para la fecha y turno indicados.
 */
function obtenerEquiposDisponibles(equipos = [], reservas = [], fecha, turno) {
  if (!fecha || !turno) return [];
  return equipos.filter(
    (eq) =>
      eq.estado === 'operativo' &&
      !estaReservado(eq.id, fecha, turno, reservas)
  );
}

/**
 * Valida la fecha y el turno seleccionados en la primera fase de la reserva.
 */
function validarFechaTurno(entrada = {}, hoyStr = obtenerFechaHoy()) {
  const errores = {};
  const fecha = typeof entrada.fecha === 'string' ? entrada.fecha.trim() : '';
  const turno = typeof entrada.turno === 'string' ? entrada.turno.trim() : '';

  if (!fecha) {
    errores.fecha = 'La fecha es obligatoria.';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    errores.fecha = 'El formato de fecha debe ser YYYY-MM-DD.';
  } else if (fecha < hoyStr) {
    errores.fecha = 'No se pueden realizar reservas en fechas pasadas.';
  }

  if (!turno) {
    errores.turno = 'El turno es obligatorio.';
  } else if (!TIPOS_TURNO.includes(turno)) {
    errores.turno = 'El turno seleccionado no es válido.';
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datos: { fecha, turno },
  };
}

/**
 * Valida todos los datos necesarios para formalizar la reserva de un equipo.
 */
function validarReserva(datos = {}, hoyStr = obtenerFechaHoy()) {
  const equipoId = parseId(datos.equipoId);
  const resFechaTurno = validarFechaTurno(datos, hoyStr);
  const errores = { ...resFechaTurno.errores };

  if (!equipoId) {
    errores.equipoId = 'Debes seleccionar un equipo válido.';
  }

  const valores = {
    equipoId,
    fecha: resFechaTurno.datos.fecha,
    turno: resFechaTurno.datos.turno,
  };

  return {
    valido: Object.keys(errores).length === 0,
    errores,
    valores,
    datos: valores,
  };
}

module.exports = {
  parseId,
  obtenerFechaHoy,
  estaReservado,
  obtenerEquiposDisponibles,
  validarFechaTurno,
  validarReserva,
};