function crearUsuariosRepository(datosIniciales = []) {
  // slice() sin parámetros crea una copia del array
  const usuarios = datosIniciales.slice();

  function siguienteId() {
    return usuarios.reduce((maximo, usuario) => Math.max(maximo, usuario.id), 0) + 1;
  }

  function todos() {
    return usuarios.slice();
  }

  function buscarPorId(id) {
    return usuarios.find((usuario) => usuario.id === id);
  }

  // Los correos se guardan siempre en minúsculas
  function buscarPorEmail(email) {
    return usuarios.find((usuario) => usuario.email === email.toLowerCase());
  }

  function crear(datos) {
    // Object.assign junta el id nuevo con el resto de datos en un objeto nuevo
    const nuevo = Object.assign({ id: siguienteId() }, datos);
    usuarios.push(nuevo);
    return nuevo;
  }

  return { todos, buscarPorId, buscarPorEmail, crear };
}

module.exports = crearUsuariosRepository;