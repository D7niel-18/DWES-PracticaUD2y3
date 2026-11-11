// Un "modelo de vista" es un paquete con TODO lo que la página
// necesita para dibujarse: valores del formulario, errores,
// opciones de turno y la lista de equipos disponibles.
// Así la vista (EJS) se limita a mostrar, sin tomar decisiones.


const { TURNOS } = require("../utils/validaciones");
const { fechaEsValida } = require("../utils/reservas");

const OPCIONES_TURNO = [
  { valor: "manana", etiqueta: "Mañana" },
  { valor: "tarde", etiqueta: "Tarde" },
];

function crearModeloFormularioReserva(reservasService, { valores = {}, errores = {}, mensajeError = null } = {}) {
  const hoy = reservasService.hoy();
  const fecha = valores.fecha || "";
  const turno = valores.turno || "";

  // Solo se consulta la disponibilidad si fecha y turno son correctos
  const consultaLista = fechaEsValida(fecha) && fecha >= hoy && TURNOS.includes(turno);
  const equiposDisponibles = consultaLista ? reservasService.equiposDisponibles(fecha, turno) : [];

  return {
    titulo: "Nueva reserva",
    hoy,
    turnos: OPCIONES_TURNO,
    valores: { fecha, turno, equipoId: String(valores.equipoId || "") },
    errores,
    mensajeError,
    consultaLista,
    equiposDisponibles,
  };
}

module.exports = crearModeloFormularioReserva;
