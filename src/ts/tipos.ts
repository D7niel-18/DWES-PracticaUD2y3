// ============================================================
// TIPOS DEL NÚCLEO DE RESERVAS (TypeScript)
// ------------------------------------------------------------
// TypeScript es JavaScript con "etiquetas de tipo". Sirven para que
// el compilador avise de errores ANTES de ejecutar el programa.
// ============================================================

// Tipos unión: el valor solo puede ser UNO de los textos indicados
export type Rol = "usuario" | "admin";
export type Turno = "manana" | "tarde";
export type EstadoReserva = "activa" | "cancelada";
export type EstadoEquipo = "operativo" | "fuera_de_servicio";
export type TipoEquipo = "sobremesa" | "portatil";

// Interfaces: describen la "forma" de los datos
export interface Equipo {
  id: number;
  codigo: string;
  nombre: string;
  tipo: TipoEquipo;
  estado: EstadoEquipo;
}

export interface Reserva {
  id: number;
  equipoId: number;
  usuarioId: number;
  fecha: string; // formato AAAA-MM-DD
  turno: Turno;
  estado: EstadoReserva;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: Rol;
}

// Datos necesarios para pedir una reserva nueva
export interface DatosNuevaReserva {
  equipoId: number;
  fecha: string;
  turno: Turno;
}
