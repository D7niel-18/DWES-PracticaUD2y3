// ============================================================
// SERVICIO DE RESERVAS (TypeScript)
// ------------------------------------------------------------
// INYECCIÓN DE DEPENDENCIAS: el servicio no crea su repositorio;
// lo RECIBE en el constructor. Así puede funcionar con cualquier
// repositorio que cumpla el contrato (memoria, base de datos...)
// y es fácil de probar.
// ============================================================

import type { DatosNuevaReserva, Reserva, Rol } from "./tipos";
import type { RepositorioReservas } from "./repositorioReservas";

// Códigos de los errores que puede lanzar el servicio
export type CodigoErrorReserva = "NO_ENCONTRADA" | "CONFLICTO" | "PROHIBIDO" | "YA_CANCELADA";

export class ErrorReserva extends Error {
  public readonly codigo: CodigoErrorReserva;

  constructor(mensaje: string, codigo: CodigoErrorReserva) {
    super(mensaje);
    this.name = "ErrorReserva";
    this.codigo = codigo;
  }
}

export class ServicioReservas {
  // "private readonly": solo se usa dentro de la clase y no se reasigna
  constructor(private readonly repositorio: RepositorioReservas) {}

  // ¿Hay una reserva ACTIVA para ese equipo, fecha y turno?
  estaReservado(equipoId: number, fecha: string, turno: string): boolean {
    return this.repositorio
      .obtenerTodas()
      .some(
        (reserva) =>
          reserva.equipoId === equipoId &&
          reserva.fecha === fecha &&
          reserva.turno === turno &&
          reserva.estado === "activa"
      );
  }

  crearReserva(usuarioId: number, datos: DatosNuevaReserva): Reserva {
    if (this.estaReservado(datos.equipoId, datos.fecha, datos.turno)) {
      throw new ErrorReserva("El equipo ya está reservado en ese turno.", "CONFLICTO");
    }
    return this.repositorio.crear({
      equipoId: datos.equipoId,
      usuarioId,
      fecha: datos.fecha,
      turno: datos.turno,
      estado: "activa",
    });
  }

  cancelarReserva(reservaId: number, usuarioId: number, rol: Rol): Reserva {
    const reserva = this.repositorio.buscarPorId(reservaId);
    if (reserva === undefined) {
      throw new ErrorReserva("La reserva no existe.", "NO_ENCONTRADA");
    }
    // Solo el dueño o un administrador pueden cancelar
    if (rol !== "admin" && reserva.usuarioId !== usuarioId) {
      throw new ErrorReserva("No puedes cancelar una reserva ajena.", "PROHIBIDO");
    }
    if (reserva.estado === "cancelada") {
      throw new ErrorReserva("La reserva ya estaba cancelada.", "YA_CANCELADA");
    }
    const actualizada = this.repositorio.actualizar(reservaId, { estado: "cancelada" });
    if (actualizada === undefined) {
      throw new ErrorReserva("La reserva no existe.", "NO_ENCONTRADA");
    }
    return actualizada;
  }

  listarPorUsuario(usuarioId: number): Reserva[] {
    return this.repositorio.obtenerTodas().filter((reserva) => reserva.usuarioId === usuarioId);
  }
}
