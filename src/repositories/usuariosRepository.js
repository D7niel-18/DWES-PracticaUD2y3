// ============================================================
// REPOSITORIO DE USUARIOS
// ============================================================

class UsuariosRepository {
  constructor(datosIniciales = []) {
    // slice() sin parámetros crea una copia del array
    this.usuarios = datosIniciales.slice();
  }

  todos() {
    return this.usuarios.slice();
  }

  buscarPorId(id) {
    return this.usuarios.find((usuario) => usuario.id === id);
  }

  // Los correos se guardan siempre en minúsculas
  buscarPorEmail(email) {
    return this.usuarios.find((usuario) => usuario.email === email.toLowerCase());
  }

  crear(datos) {
    // Object.assign junta el id nuevo con el resto de datos en un objeto nuevo
    const nuevo = Object.assign({ id: this.siguienteId() }, datos);
    this.usuarios.push(nuevo);
    return nuevo;
  }

  siguienteId() {
    return this.usuarios.reduce((maximo, usuario) => Math.max(maximo, usuario.id), 0) + 1;
  }
}

module.exports = UsuariosRepository;
