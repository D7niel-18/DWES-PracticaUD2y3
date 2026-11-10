function crearEquiposRepository(datosIniciales = []) {
  // slice() sin parámetros crea una copia del array
  const equipos = datosIniciales.slice();

  // El siguiente id es el mayor existente + 1
  function siguienteId() {
    return equipos.reduce((maximo, equipo) => Math.max(maximo, equipo.id), 0) + 1;
  }

  function todos() {
    return equipos.slice();
  }

  function buscarPorId(id) {
    return equipos.find((equipo) => equipo.id === id);
  }

  function buscarPorCodigo(codigo) {
    return equipos.find((equipo) => equipo.codigo.toLowerCase() === codigo.toLowerCase());
  }

  function crear(datos) {
    // Object.assign junta el id nuevo con el resto de datos en un objeto nuevo
    const nuevo = Object.assign({ id: siguienteId() }, datos);
    equipos.push(nuevo);
    return nuevo;
  }

  function actualizar(id, cambios) {
    const equipo = buscarPorId(id);
    if (!equipo) return undefined;
    Object.assign(equipo, cambios);
    return equipo;
  }

  // Estos son los únicos métodos que el resto de la aplicación puede usar
  return { todos, buscarPorId, buscarPorCodigo, crear, actualizar };
}

module.exports = crearEquiposRepository;
