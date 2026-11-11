// ============================================================
// ETIQUETAS PARA MOSTRAR
// ------------------------------------------------------------
// Los datos internos ("manana", "fuera_de_servicio") no son
// bonitos para leer. Estas funciones los traducen a texto normal.
// ============================================================

const TURNOS = { manana: "Mañana", tarde: "Tarde" };
const ESTADOS_EQUIPO = { operativo: "Operativo", fuera_de_servicio: "Fuera de servicio" };
const TIPOS = { sobremesa: "Sobremesa", portatil: "Portátil" };
const ESTADOS_RESERVA = { activa: "Activa", cancelada: "Cancelada" };

module.exports = {
  etiquetaTurno: (valor) => TURNOS[valor] || valor,
  etiquetaEstadoEquipo: (valor) => ESTADOS_EQUIPO[valor] || valor,
  etiquetaTipo: (valor) => TIPOS[valor] || valor,
  etiquetaEstadoReserva: (valor) => ESTADOS_RESERVA[valor] || valor,
};
