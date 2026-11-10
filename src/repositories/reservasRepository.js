// ============================================================
// REPOSITORIO DE RESERVAS
// ------------------------------------------------------------
// Nota importante: las reservas NUNCA se borran. Al cancelar,
// solo cambia su estado a "cancelada" (método actualizar).
// ============================================================

class ReservasRepository {
  constructor(datosIniciales = []) {
    // slice() sin parámetros crea una copia del array
    this.reservas = datosIniciales.slice();
  }

  todas() {
    return this.reservas.slice();
  }

  buscarPorId(id) {
    return this.reservas.find((reserva) => reserva.id === id);
  }

  crear(datos) {
    // Object.assign junta el id nuevo con el resto de datos en un objeto nuevo
    const nueva = Object.assign({ id: this.siguienteId() }, datos);
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
