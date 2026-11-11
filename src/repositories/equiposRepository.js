// Un repositorio es "el almacén": el ÚNICO sitio que toca la lista
// de equipos. Si mañana usáramos una base de datos, solo habría
// que cambiar estos archivos y nada más.

class EquiposRepository {
  constructor(datosIniciales = []) {
    this.equipos = [...datosIniciales];
  }

  todos() {
    return [...this.equipos];
  }

  buscarPorId(id) {
    return this.equipos.find((equipo) => equipo.id === id);
  }

  buscarPorCodigo(codigo) {
    return this.equipos.find((equipo) => equipo.codigo.toLowerCase() === codigo.toLowerCase());
  }

  crear(datos) {
    const nuevo = { id: this.siguienteId(), ...datos };
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
