// Aquí estan las REGLAS de negocio sobre equipos.
// Un servicio nunca usa req, res ni EJS: solo recibe datos y
// devuelve datos (o lanza un error de dominio).

const { crearErrorNoEncontrado, crearErrorConflicto, crearErrorValidacion } = require("../errors/errores");
const { validarEquipo, ESTADOS_EQUIPO } = require("../utils/validaciones");

// El repositorio de equipos se recibe desde fuera (así es fácil de sustituir)
function crearEquiposService({ equiposRepo }) {
  // Lista equipos aplicando los filtros opcionales { tipo, operativos }
  function listar({ tipo = "", operativos = false } = {}) {
    return equiposRepo
      .todos()
      .filter((equipo) => tipo === "" || equipo.tipo === tipo)
      .filter((equipo) => !operativos || equipo.estado === "operativo");
  }

  function obtener(id) {
    const equipo = equiposRepo.buscarPorId(id);
    if (!equipo) throw crearErrorNoEncontrado("El equipo solicitado no existe.");
    return equipo;
  }

  function crear(datos) {
    const validacion = validarEquipo(datos);
    if (!validacion.valido) throw crearErrorValidacion(validacion.errores);

    // No puede haber dos equipos con el mismo código
    if (equiposRepo.buscarPorCodigo(validacion.valores.codigo)) {
      throw crearErrorConflicto("Ya existe un equipo con ese código.", {
        codigo: "Ya existe un equipo con ese código.",
      });
    }
    return equiposRepo.crear(validacion.valores);
  }

  function cambiarEstado(id, estado) {
    if (!ESTADOS_EQUIPO.includes(estado)) {
      throw crearErrorValidacion({ estado: "El estado indicado no es válido." });
    }
    obtener(id); // lanza 404 si no existe
    return equiposRepo.actualizar(id, { estado });
  }

  return { listar, obtener, crear, cambiarEstado };
}

module.exports = crearEquiposService;
