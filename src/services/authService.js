// ============================================================
// SERVICIO DE AUTENTICACIÓN
// ------------------------------------------------------------
// Registro y comprobación de credenciales.
// ============================================================

const bcrypt = require("bcrypt");
const { ErrorValidacion, ErrorConflicto, ErrorCredenciales } = require("../errors/errores");
const { validarRegistro } = require("../utils/validaciones");

class AuthService {
  constructor({ usuariosRepo, costeBcrypt = 10 }) {
    this.usuariosRepo = usuariosRepo;
    this.costeBcrypt = costeBcrypt;
    // Hash "falso": sirve para tardar lo mismo cuando el correo no existe
    // y que nadie pueda adivinar qué correos están registrados.
    this.hashFalso = bcrypt.hashSync("contrasena-falsa", costeBcrypt);
  }

  async registrar(datos) {
    const validacion = validarRegistro(datos);
    if (!validacion.valido) throw new ErrorValidacion(validacion.errores);
    const { nombre, email, password } = validacion.valores;

    // Se cifra la contraseña con bcrypt (nunca se guarda en claro)
    const passwordHash = await bcrypt.hash(password, this.costeBcrypt);

    if (this.usuariosRepo.buscarPorEmail(email)) {
      throw new ErrorConflicto("Ya existe una cuenta con ese correo.", {
        email: "Ya existe una cuenta con ese correo.",
      });
    }
    // El registro público SIEMPRE crea un usuario normal, ignorando
    // cualquier "rol" que intente colar el navegador.
    const usuario = this.usuariosRepo.crear({ nombre, email, passwordHash, rol: "usuario" });
    return this.aPublico(usuario);
  }

  // Comprueba correo y contraseña. El error es el mismo en ambos
  // casos (correo inexistente o contraseña mala).
  async autenticar(email, password) {
    const usuario = this.usuariosRepo.buscarPorEmail(email);
    const hash = usuario ? usuario.passwordHash : this.hashFalso;
    const coincide = await bcrypt.compare(password, hash);
    if (!usuario || !coincide) throw new ErrorCredenciales();
    return usuario;
  }

  buscarPorId(id) {
    return this.usuariosRepo.buscarPorId(id);
  }

  // Versión del usuario SIN el hash de la contraseña (segura para mostrar)
  aPublico(usuario) {
    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
  }
}

module.exports = AuthService;
