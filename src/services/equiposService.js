// ============================================================
// SERVICIO DE EQUIPOS
// ------------------------------------------------------------
// Aquí viven las REGLAS de negocio sobre equipos.
// Un servicio nunca usa req, res ni EJS: solo recibe datos y
// devuelve datos (o lanza un error de dominio).
// ============================================================

const { ErrorNoEncontrado, ErrorConflicto, ErrorValidacion } = require("../errors/errores");
const { validarEquipo, ESTADOS_EQUIPO } = require("../utils/validaciones");

class EquiposService {
  constructor({ equiposRepo }) {
    this.equiposRepo = equiposRepo;
  }

  // Lista equipos aplicando los filtros opcionales { tipo, operativos }
  listar({ tipo = "", operativos = false } = {}) {
    return this.equiposRepo
      .todos()
      .filter((equipo) => tipo === "" || equipo.tipo === tipo)
      .filter((equipo) => !operativos || equipo.estado === "operativo");
  }

  obtener(id) {
    const equipo = this.equiposRepo.buscarPorId(id);
    if (!equipo) throw new ErrorNoEncontrado("El equipo solicitado no existe.");
    return equipo;
  }

  crear(datos) {
    const validacion = validarEquipo(datos);
    if (!validacion.valido) throw new ErrorValidacion(validacion.errores);

    // No puede haber dos equipos con el mismo código
    if (this.equiposRepo.buscarPorCodigo(validacion.valores.codigo)) {
      throw new ErrorConflicto("Ya existe un equipo con ese código.", {
        codigo: "Ya existe un equipo con ese código.",
      });
    }
    return this.equiposRepo.crear(validacion.valores);
  }

  cambiarEstado(id, estado) {
    if (!ESTADOS_EQUIPO.includes(estado)) {
      throw new ErrorValidacion({ estado: "El estado indicado no es válido." });
    }
    this.obtener(id); // lanza 404 si no existe
    return this.equiposRepo.actualizar(id, { estado });
  }
}

module.exports = EquiposService;
