// ============================================================
// SERVICIO DE RESERVAS
// ------------------------------------------------------------
// Reglas de negocio más importantes de la práctica:
//   - disponibilidad de equipos
//   - evitar reservas duplicadas
//   - quién puede cancelar qué
// ============================================================

const {
  ErrorValidacion,
  ErrorNoEncontrado,
  ErrorConflicto,
  ErrorPermisos,
} = require("../errors/errores");
const {
  estaReservado,
  obtenerEquiposDisponibles,
  obtenerFechaHoy,
  validarReserva,
} = require("../utils/reservas");

class ReservasService {
  // "reloj" es una función que devuelve la hora actual.
  // Así, en las pruebas, se puede controlar qué día es "hoy".
  constructor({ reservasRepo, equiposRepo, usuariosRepo, reloj = () => new Date() }) {
    this.reservasRepo = reservasRepo;
    this.equiposRepo = equiposRepo;
    this.usuariosRepo = usuariosRepo;
    this.reloj = reloj;
  }

  hoy() {
    return obtenerFechaHoy(this.reloj());
  }

  // Equipos libres para una fecha y turno
  equiposDisponibles(fecha, turno) {
    return obtenerEquiposDisponibles(
      this.equiposRepo.todos(),
      this.reservasRepo.todas(),
      fecha,
      turno
    );
  }

  // Crea una reserva. TODAS las comprobaciones se repiten aquí,
  // aunque el formulario solo ofrezca opciones válidas, porque
  // alguien podría enviar la petición "a mano".
  crear(usuarioId, datos) {
    // 1) Datos bien formados (equipo, fecha no pasada, turno válido)
    const validacion = validarReserva(datos, this.hoy());
    if (!validacion.valido) throw new ErrorValidacion(validacion.errores);
    const { equipoId, fecha, turno } = validacion.valores;

    // 2) El equipo existe
    const equipo = this.equiposRepo.buscarPorId(equipoId);
    if (!equipo) throw new ErrorNoEncontrado("El equipo solicitado no existe.");

    // 3) El equipo está operativo
    if (equipo.estado !== "operativo") {
      throw new ErrorValidacion(
        { equipoId: "Ese equipo no está operativo." },
        "No se puede reservar un equipo fuera de servicio."
      );
    }

    // 4) Nadie más lo tiene reservado en ese turno
    if (estaReservado(equipoId, fecha, turno, this.reservasRepo.todas())) {
      throw new ErrorConflicto("Ese equipo ya está reservado para esa fecha y turno.", {
        equipoId: "Ese equipo ya no está disponible en esa fecha y turno.",
      });
    }

    // 5) Todo correcto: se crea con el usuario de la SESIÓN
    return this.reservasRepo.crear({ equipoId, usuarioId, fecha, turno, estado: "activa" });
  }

  // Cancela una reserva. "actor" es quien lo pide: { id, rol }
  cancelar(reservaId, actor) {
    const reserva = this.reservasRepo.buscarPorId(reservaId);
    if (!reserva) throw new ErrorNoEncontrado("La reserva no existe.");

    const esAdmin = actor.rol === "admin";

    // Comprobación de PROPIEDAD: solo el dueño (o un admin) puede cancelar
    if (!esAdmin && reserva.usuarioId !== actor.id) {
      throw new ErrorPermisos("No puedes cancelar una reserva de otra persona.");
    }
    if (reserva.estado === "cancelada") {
      throw new ErrorConflicto("Esa reserva ya estaba cancelada.");
    }
    // Un usuario normal no puede cancelar reservas de días ya pasados
    if (!esAdmin && reserva.fecha < this.hoy()) {
      throw new ErrorValidacion({}, "No se puede cancelar una reserva de una fecha pasada.");
    }
    // No se borra: solo cambia el estado
    return this.reservasRepo.actualizar(reservaId, { estado: "cancelada" });
  }

  // Reservas de un usuario (activas y canceladas)
  listarDeUsuario(usuarioId) {
    return this.reservasRepo
      .todas()
      .filter((reserva) => reserva.usuarioId === usuarioId)
      .map((reserva) => this.enriquecer(reserva, false))
      .sort(ordenarPorFecha);
  }

  // Todas las reservas (para el administrador)
  listarTodas() {
    return this.reservasRepo
      .todas()
      .map((reserva) => this.enriquecer(reserva, true))
      .sort(ordenarPorFecha);
  }

  // Añade a la reserva el nombre del equipo y del usuario, y si
  // se puede cancelar. Así las vistas no tienen que calcular nada.
  enriquecer(reserva, esAdmin) {
    const equipo = this.equiposRepo.buscarPorId(reserva.equipoId);
    const usuario = this.usuariosRepo.buscarPorId(reserva.usuarioId);
    return {
      ...reserva,
      equipoCodigo: equipo ? equipo.codigo : "(desconocido)",
      equipoNombre: equipo ? equipo.nombre : "",
      usuarioNombre: usuario ? usuario.nombre : "(desconocido)",
      cancelable: reserva.estado === "activa" && (esAdmin || reserva.fecha >= this.hoy()),
    };
  }
}

function ordenarPorFecha(a, b) {
  return a.fecha.localeCompare(b.fecha) || a.turno.localeCompare(b.turno);
}

module.exports = ReservasService;
