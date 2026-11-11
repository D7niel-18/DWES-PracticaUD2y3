// ============================================================
// REPOSITORIO DE RESERVAS
// ------------------------------------------------------------
// Nota importante: las reservas NUNCA se borran. Al cancelar,
// solo cambia su estado a "cancelada" (método actualizar).
// ============================================================

class ReservasRepository {
  constructor(datosIniciales = []) {
    this.reservas = [...datosIniciales];
  }

  todas() {
    return [...this.reservas];
  }

  buscarPorId(id) {
    return this.reservas.find((reserva) => reserva.id === id);
  }

  crear(datos) {
    const nueva = { id: this.siguienteId(), ...datos };
    this.reservas.push(nueva);
    return nueva;
  }

  actualizar(id, cambios) {
    const reserva = this.buscarPorId(id);
    if (!reserva) return undefined;
    Object.assign(reserva, cambios);
    return reserva;
  }

  siguienteId() {
    return this.reservas.reduce((maximo, reserva) => Math.max(maximo, reserva.id), 0) + 1;
  }
}

module.exports = ReservasRepository;
