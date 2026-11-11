// ============================================================
// REPOSITORIO DE USUARIOS
// ============================================================

class UsuariosRepository {
  constructor(datosIniciales = []) {
    this.usuarios = [...datosIniciales];
  }

  todos() {
    return [...this.usuarios];
  }

  buscarPorId(id) {
    return this.usuarios.find((usuario) => usuario.id === id);
  }

  // Los correos se guardan siempre en minúsculas
  buscarPorEmail(email) {
    return this.usuarios.find((usuario) => usuario.email === email.toLowerCase());
  }

  crear(datos) {
    const nuevo = { id: this.siguienteId(), ...datos };
    this.usuarios.push(nuevo);
    return nuevo;
  }

  siguienteId() {
    return this.usuarios.reduce((maximo, usuario) => Math.max(maximo, usuario.id), 0) + 1;
  }
}

module.exports = UsuariosRepository;
