// ============================================================
// REPOSITORIO DE RESERVAS (TypeScript)
// ------------------------------------------------------------
// 1) La INTERFAZ dice QUÉ operaciones existen (el "contrato").
// 2) La CLASE dice CÓMO se hacen, usando un Map (diccionario
//    que asocia cada id con su reserva).
// ============================================================

import type { Reserva } from "./tipos";

// Contrato que debe cumplir cualquier repositorio de reservas
export interface RepositorioReservas {
  obtenerTodas(): Reserva[];
  buscarPorId(id: number): Reserva | undefined;
  crear(datos: Omit<Reserva, "id">): Reserva;
  actualizar(id: number, cambios: Partial<Omit<Reserva, "id">>): Reserva | undefined;
}

// Implementación en memoria con Map
export class RepositorioReservasMemoria implements RepositorioReservas {
  private readonly reservas: Map<number, Reserva> = new Map<number, Reserva>();
  private siguienteId = 1;

  constructor(iniciales: Reserva[] = []) {
    for (const reserva of iniciales) {
      this.reservas.set(reserva.id, { ...reserva });
      this.siguienteId = Math.max(this.siguienteId, reserva.id + 1);
    }
  }

  obtenerTodas(): Reserva[] {
    return Array.from(this.reservas.values());
  }

  buscarPorId(id: number): Reserva | undefined {
    return this.reservas.get(id);
  }

  crear(datos: Omit<Reserva, "id">): Reserva {
    const nueva: Reserva = { id: this.siguienteId, ...datos };
    this.reservas.set(nueva.id, nueva);
    this.siguienteId += 1;
    return nueva;
  }

  actualizar(id: number, cambios: Partial<Omit<Reserva, "id">>): Reserva | undefined {
    const existente = this.reservas.get(id);
    if (existente === undefined) return undefined;
    const actualizada: Reserva = { ...existente, ...cambios };
    this.reservas.set(id, actualizada);
    return actualizada;
  }
}
