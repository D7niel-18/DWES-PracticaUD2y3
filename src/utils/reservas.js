// ============================================================
// FUNCIONES PURAS DE RESERVAS
// ------------------------------------------------------------
// Estas funciones contienen la lógica "de cabeza": ¿está libre
// este equipo? ¿es correcta esta reserva? No usan req ni res,
// así que se pueden probar solas, fuera de Express.
// Usan los métodos find(), filter(), map() y some().
// ============================================================

const { TURNOS, texto, validarId } = require("./validaciones");

// ¿Está este equipo reservado (con reserva ACTIVA) en esa fecha y turno?
// some() devuelve true en cuanto encuentra una reserva que coincide.
function estaReservado(equipoId, fecha, turno, reservas) {
  return reservas.some(
    (reserva) =>
      reserva.equipoId === equipoId &&
      reserva.fecha === fecha &&
      reserva.turno === turno &&
      reserva.estado === "activa" // las canceladas NO bloquean el equipo
  );
}

// Devuelve los equipos que se pueden reservar en esa fecha y turno:
//   1) que estén operativos
//   2) que nadie los tenga ya reservados
function obtenerEquiposDisponibles(equipos, reservas, fecha, turno) {
  return equipos
    .filter((equipo) => equipo.estado === "operativo")
    .filter((equipo) => !estaReservado(equipo.id, fecha, turno, reservas));
}

// Fecha de hoy en formato AAAA-MM-DD (ejemplo: "2026-11-10").
// Recibe "ahora" como parámetro para poder usar otra fecha en las pruebas.
function obtenerFechaHoy(ahora = new Date()) {
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// ¿Es una fecha real? ("2027-02-30" tiene buen formato pero NO existe)
function fechaEsValida(fecha) {
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const f = new Date(Date.UTC(anio, mes - 1, dia));
  return f.getUTCFullYear() === anio && f.getUTCMonth() === mes - 1 && f.getUTCDate() === dia;
}

// Comprueba solo fecha y turno (se usa también al consultar disponibilidad)
function validarFechaTurno(fecha, turno, hoy = obtenerFechaHoy()) {
  const errores = {};
  if (!fechaEsValida(fecha)) {
    errores.fecha = "Indica una fecha válida con formato AAAA-MM-DD.";
  } else if (fecha < hoy) {
    // Comparar textos AAAA-MM-DD funciona igual que comparar fechas
    errores.fecha = "La fecha no puede ser anterior a hoy.";
  }
  if (!TURNOS.includes(turno)) {
    errores.turno = "Elige un turno válido (mañana o tarde).";
  }
  return errores;
}

// Valida los datos completos de una reserva.
// Devuelve { valido, errores, valores } con los valores ya convertidos.
function validarReserva(datos, hoy = obtenerFechaHoy()) {
  const entrada = datos || {};
  const equipoId = validarId(entrada.equipoId); // "2" -> 2, o null si no vale
  const fecha = texto(entrada.fecha);
  const turno = texto(entrada.turno);

  const errores = validarFechaTurno(fecha, turno, hoy);
  if (equipoId === null) {
    errores.equipoId = "Selecciona un equipo válido.";
  }
  return {
    valido: Object.keys(errores).length === 0,
    errores,
    valores: { equipoId, fecha, turno },
  };
}

module.exports = {
  estaReservado,
  obtenerEquiposDisponibles,
  obtenerFechaHoy,
  fechaEsValida,
  validarFechaTurno,
  validarReserva,
};
