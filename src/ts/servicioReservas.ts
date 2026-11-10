import { RepositorioReservas, Reserva, DatosNuevaReserva } from './tipos';

export class ReservasServiceTS {
  constructor(private readonly reservasRepo: RepositorioReservas) {}

  public crearReserva(datos: DatosNuevaReserva, equiposOperativosIds: number[]): Reserva {
    if (!equiposOperativosIds.includes(datos.equipoId)) {
      throw new Error('El equipo seleccionado no existe o no está operativo.');
    }

    const reservasExistentes = this.reservasRepo.obtenerTodas();
    const estaOcupado = reservasExistentes.some(
      (r) =>
        r.equipoId === datos.equipoId &&
        r.fecha === datos.fecha &&
        r.turno === datos.turno &&
        r.estado === 'activa'
    );

    if (estaOcupado) {
      throw new Error('El equipo ya se encuentra reservado para la fecha y turno indicados.');
    }

    return this.reservasRepo.guardar(datos);
  }

  public cancelarReserva(reservaId: number, usuarioId: number, esAdmin: boolean): Reserva {
    const reserva = this.reservasRepo.buscarPorId(reservaId);
    if (!reserva) {
      throw new Error('La reserva solicitada no existe.');
    }

    if (!esAdmin && reserva.usuarioId !== usuarioId) {
      throw new Error('Acceso denegado: No puedes cancelar reservas de otros usuarios.');
    }

    const actualizada = this.reservasRepo.actualizarEstado(reservaId, 'cancelada');
    if (!actualizada) {
      throw new Error('Error al actualizar el estado de la reserva.');
    }

    return actualizada;
  }
}