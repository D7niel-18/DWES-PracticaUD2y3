function crearReservasRepository(datosIniciales = []) {
  // slice() sin parámetros crea una copia del array
  const reservas = datosIniciales.slice();

  function siguienteId() {
    return reservas.reduce((maximo, reserva) => Math.max(maximo, reserva.id), 0) + 1;
  }

  function todas() {
    return reservas.slice();
  }

  function buscarPorId(id) {
    return reservas.find((reserva) => reserva.id === id);
  }

  function crear(datos) {
    // Object.assign junta el id nuevo con el resto de datos en un objeto nuevo
    const nueva = Object.assign({ id: siguienteId() }, datos);
    reservas.push(nueva);
    return nueva;
  }

  function actualizar(id, cambios) {
    const reserva = buscarPorId(id);
    if (!reserva) return undefined;
    Object.assign(reserva, cambios);
    return reserva;
  }

  return { todas, buscarPorId, crear, actualizar };
}

module.exports = crearReservasRepository;