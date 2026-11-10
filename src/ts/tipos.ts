export type Rol = 'admin' | 'usuario';
export type Turno = 'manana' | 'tarde';
export type TipoEquipo = 'portatil' | 'sobremesa';
export type EstadoEquipo = 'operativo' | 'fuera_de_servicio';
export type EstadoReserva = 'activa' | 'cancelada';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface Equipo {
  id: number;
  codigo: string;
  nombre: string;
  tipo: TipoEquipo;
  estado: EstadoEquipo;
}

export interface Reserva {
  id: number;
  usuarioId: number;
  equipoId: number;
  fecha: string;
  turno: Turno;
  estado: EstadoReserva;
}

export interface DatosNuevaReserva {
  usuarioId: number;
  equipoId: number;
  fecha: string;
  turno: Turno;
}

export interface RepositorioReservas {
  guardar(datos: DatosNuevaReserva): Reserva;
  buscarPorId(id: number): Reserva | undefined;
  buscarPorUsuario(usuarioId: number): Reserva[];
  obtenerTodas(): Reserva[];
  actualizarEstado(id: number, estado: EstadoReserva): Reserva | undefined;
}