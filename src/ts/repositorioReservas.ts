import { Reserva, RepositorioReservas, DatosNuevaReserva, EstadoReserva } from './tipos';

export class ReservasRepositoryMap implements RepositorioReservas {
  private reservas: Map<number, Reserva> = new Map();
  private siguienteId = 1;

  constructor(datosIniciales: Reserva[] = []) {
    for (const reserva of datosIniciales) {
      this.reservas.set(reserva.id, reserva);
      if (reserva.id >= this.siguienteId) {
        this.siguienteId = reserva.id + 1;
      }
    }
  }

  guardar(datos: DatosNuevaReserva): Reserva {
    const nuevaReserva: Reserva = {
      id: this.siguienteId++,
      ...datos,
      estado: 'activa',
    };
    this.reservas.set(nuevaReserva.id, nuevaReserva);
    return { ...nuevaReserva };
  }

  buscarPorId(id: number): Reserva | undefined {
    const reserva = this.reservas.get(id);
    return reserva ? { ...reserva } : undefined;
  }

  buscarPorUsuario(usuarioId: number): Reserva[] {
    return Array.from(this.reservas.values())
      .filter((r) => r.usuarioId === usuarioId)
      .map((r) => ({ ...r }));
  }

  obtenerTodas(): Reserva[] {
    return Array.from(this.reservas.values()).map((r) => ({ ...r }));
  }

  actualizarEstado(id: number, estado: EstadoReserva): Reserva | undefined {
    const reserva = this.reservas.get(id);
    if (!reserva) return undefined;

    const actualizada: Reserva = { ...reserva, estado };
    this.reservas.set(id, actualizada);
    return { ...actualizada };
  }
}