// ============================================================
// REPOSITORIO DE EQUIPOS
// ------------------------------------------------------------
// Un repositorio es "el almacén": el ÚNICO sitio que toca la lista
// de equipos. Si mañana usáramos una base de datos, solo habría
// que cambiar estos archivos y nada más.
// ============================================================

class EquiposRepository {
  constructor(datosIniciales = []) {
    // slice() sin parámetros crea una copia del array
    this.equipos = datosIniciales.slice();
  }

  todos() {
    return this.equipos.slice();
  }

  buscarPorId(id) {
    return this.equipos.find((equipo) => equipo.id === id);
  }

  buscarPorCodigo(codigo) {
    return this.equipos.find((equipo) => equipo.codigo.toLowerCase() === codigo.toLowerCase());
  }

  crear(datos) {
    // Object.assign junta el id nuevo con el resto de datos en un objeto nuevo
    const nuevo = Object.assign({ id: this.siguienteId() }, datos);
    this.equipos.push(nuevo);
    return nuevo;
  }

  actualizar(id, cambios) {
    const equipo = this.buscarPorId(id);
    if (!equipo) return undefined;
    Object.assign(equipo, cambios);
    return equipo;
  }

  // El siguiente id es el mayor existente + 1
  siguienteId() {
    return this.equipos.reduce((maximo, equipo) => Math.max(maximo, equipo.id), 0) + 1;
  }
}

module.exports = EquiposRepository;