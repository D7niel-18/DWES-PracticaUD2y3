const bcrypt = require("bcrypt");
const { crearErrorValidacion, crearErrorConflicto, crearErrorCredenciales } = require("../errors/errores");
const { validarRegistro } = require("../utils/validaciones");

function crearAuthService({ usuariosRepo, costeBcrypt = 10 }) {
  // Hash "falso": sirve para tardar lo mismo cuando el correo no existe
  // y que nadie pueda adivinar qué correos están registrados.
  const hashFalso = bcrypt.hashSync("contrasena-falsa", costeBcrypt);

  // Versión del usuario SIN el hash de la contraseña (segura para mostrar)
  function aPublico(usuario) {
    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
  }

  async function registrar(datos) {
    const validacion = validarRegistro(datos);
    if (!validacion.valido) throw crearErrorValidacion(validacion.errores);
    const { nombre, email, password } = validacion.valores;

    // Se cifra la contraseña con bcrypt (nunca se guarda en claro)
    const passwordHash = await bcrypt.hash(password, costeBcrypt);

    if (usuariosRepo.buscarPorEmail(email)) {
      throw crearErrorConflicto("Ya existe una cuenta con ese correo.", {
        email: "Ya existe una cuenta con ese correo.",
      });
    }
    // El registro público SIEMPRE crea un usuario normal, ignorando
    // cualquier "rol" que intente colar el navegador.
    const usuario = usuariosRepo.crear({ nombre, email, passwordHash, rol: "usuario" });
    return aPublico(usuario);
  }

  // Comprueba correo y contraseña. El error es el mismo en ambos
  // casos (correo inexistente o contraseña mala).
  async function autenticar(email, password) {
    const usuario = usuariosRepo.buscarPorEmail(email);
    const hash = usuario ? usuario.passwordHash : hashFalso;
    const coincide = await bcrypt.compare(password, hash);
    if (!usuario || !coincide) throw crearErrorCredenciales();
    return usuario;
  }

  function buscarPorId(id) {
    return usuariosRepo.buscarPorId(id);
  }

  return { registrar, autenticar, buscarPorId, aPublico };
}

module.exports = crearAuthService;
