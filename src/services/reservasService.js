// Reglas de negocio más importantes de la práctica:
//   - disponibilidad de equipos
//   - evitar reservas duplicadas
//   - quién puede cancelar qué

const {
  crearErrorValidacion,
  crearErrorNoEncontrado,
  crearErrorConflicto,
  crearErrorPermisos,
} = require("../errors/errores");
const {
  estaReservado,
  obtenerEquiposDisponibles,
  obtenerFechaHoy,
  validarReserva,
} = require("../utils/reservas");

// "reloj" es una función que devuelve la hora actual.
// Así, en las pruebas, se puede controlar qué día es "hoy".
function crearReservasService({ reservasRepo, equiposRepo, usuariosRepo, reloj = () => new Date() }) {
  function hoy() {
    return obtenerFechaHoy(reloj());
  }

  // Equipos libres para una fecha y turno
  function equiposDisponibles(fecha, turno) {
    return obtenerEquiposDisponibles(equiposRepo.todos(), reservasRepo.todas(), fecha, turno);
  }

  // Crea una reserva. TODAS las comprobaciones se repiten aquí,
  // aunque el formulario solo ofrezca opciones válidas, porque
  // alguien podría enviar la petición "a mano".
  function crear(usuarioId, datos) {
    // 1) Datos bien formados (equipo, fecha no pasada, turno válido)
    const validacion = validarReserva(datos, hoy());
    if (!validacion.valido) throw crearErrorValidacion(validacion.errores);
    const { equipoId, fecha, turno } = validacion.valores;

    // 2) El equipo existe
    const equipo = equiposRepo.buscarPorId(equipoId);
    if (!equipo) throw crearErrorNoEncontrado("El equipo solicitado no existe.");

    // 3) El equipo está operativo
    if (equipo.estado !== "operativo") {
      throw crearErrorValidacion(
        { equipoId: "Ese equipo no está operativo." },
        "No se puede reservar un equipo fuera de servicio."
      );
    }

    // 4) Nadie más lo tiene reservado en ese turno
    if (estaReservado(equipoId, fecha, turno, reservasRepo.todas())) {
      throw crearErrorConflicto("Ese equipo ya está reservado para esa fecha y turno.", {
        equipoId: "Ese equipo ya no está disponible en esa fecha y turno.",
      });
    }

    // 5) Todo correcto: se crea con el usuario de la SESIÓN
    return reservasRepo.crear({ equipoId, usuarioId, fecha, turno, estado: "activa" });
  }

  // Cancela una reserva. "actor" es quien lo pide: { id, rol }
  function cancelar(reservaId, actor) {
    const reserva = reservasRepo.buscarPorId(reservaId);
    if (!reserva) throw crearErrorNoEncontrado("La reserva no existe.");

    const esAdmin = actor.rol === "admin";

    // Comprobación de PROPIEDAD: solo el dueño (o un admin) puede cancelar
    if (!esAdmin && reserva.usuarioId !== actor.id) {
      throw crearErrorPermisos("No puedes cancelar una reserva de otra persona.");
    }
    if (reserva.estado === "cancelada") {
      throw crearErrorConflicto("Esa reserva ya estaba cancelada.");
    }
    // Un usuario normal no puede cancelar reservas de días ya pasados
    if (!esAdmin && reserva.fecha < hoy()) {
      throw crearErrorValidacion({}, "No se puede cancelar una reserva de una fecha pasada.");
    }
    // No se borra: solo cambia el estado
    return reservasRepo.actualizar(reservaId, { estado: "cancelada" });
  }

  // Añade a la reserva el nombre del equipo y del usuario, y si
  // se puede cancelar. Así las vistas no tienen que calcular nada.
  function enriquecer(reserva, esAdmin) {
    const equipo = equiposRepo.buscarPorId(reserva.equipoId);
    const usuario = usuariosRepo.buscarPorId(reserva.usuarioId);
    // Object.assign copia la reserva y le añade los campos nuevos
    return Object.assign({}, reserva, {
      equipoCodigo: equipo ? equipo.codigo : "(desconocido)",
      equipoNombre: equipo ? equipo.nombre : "",
      usuarioNombre: usuario ? usuario.nombre : "(desconocido)",
      cancelable: reserva.estado === "activa" && (esAdmin || reserva.fecha >= hoy()),
    });
  }

  function ordenarPorFecha(a, b) {
    return a.fecha.localeCompare(b.fecha) || a.turno.localeCompare(b.turno);
  }

  // Reservas de un usuario (activas y canceladas)
  function listarDeUsuario(usuarioId) {
    return reservasRepo
      .todas()
      .filter((reserva) => reserva.usuarioId === usuarioId)
      .map((reserva) => enriquecer(reserva, false))
      .sort(ordenarPorFecha);
  }

  // Todas las reservas (para el administrador)
  function listarTodas() {
    return reservasRepo
      .todas()
      .map((reserva) => enriquecer(reserva, true))
      .sort(ordenarPorFecha);
  }

  return { hoy, equiposDisponibles, crear, cancelar, listarDeUsuario, listarTodas };
}

module.exports = crearReservasService;
