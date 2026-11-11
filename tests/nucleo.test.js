// ============================================================
// PRUEBAS DE LAS FUNCIONES PURAS (JavaScript) Y DEL NÚCLEO TYPESCRIPT
// ------------------------------------------------------------
// Estas pruebas NO usan Express: comprueban la lógica "a solas".
// ============================================================

import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";
import { RepositorioReservasMemoria } from "../src/ts/repositorioReservas";
import { ServicioReservas, ErrorReserva } from "../src/ts/servicioReservas";

const require = createRequire(import.meta.url);
const {
  estaReservado,
  obtenerEquiposDisponibles,
  validarReserva,
} = require("../src/utils/reservas");

const equipos = [
  { id: 1, estado: "operativo" },
  { id: 2, estado: "operativo" },
  { id: 3, estado: "fuera_de_servicio" },
];
const reservas = [
  { id: 1, equipoId: 1, fecha: "2030-05-10", turno: "manana", estado: "activa" },
  { id: 2, equipoId: 2, fecha: "2030-05-10", turno: "manana", estado: "cancelada" },
];

describe("Funciones puras de JavaScript", () => {
  it("estaReservado ignora las reservas canceladas", () => {
    expect(estaReservado(1, "2030-05-10", "manana", reservas)).toBe(true);
    expect(estaReservado(2, "2030-05-10", "manana", reservas)).toBe(false);
    expect(estaReservado(1, "2030-05-10", "tarde", reservas)).toBe(false);
  });

  it("obtenerEquiposDisponibles excluye reservados y fuera de servicio", () => {
    const libres = obtenerEquiposDisponibles(equipos, reservas, "2030-05-10", "manana");
    expect(libres.map((e) => e.id)).toEqual([2]);
  });

  it("validarReserva detecta fecha pasada, fecha imposible y turno inválido", () => {
    const hoy = "2030-01-01";
    expect(validarReserva({ equipoId: "1", fecha: "2030-02-01", turno: "tarde" }, hoy).valido).toBe(true);
    expect(validarReserva({ equipoId: "1", fecha: "2029-12-31", turno: "tarde" }, hoy).errores.fecha).toBeDefined();
    expect(validarReserva({ equipoId: "1", fecha: "2030-02-30", turno: "tarde" }, hoy).errores.fecha).toBeDefined();
    expect(validarReserva({ equipoId: "abc", fecha: "2030-02-01", turno: "noche" }, hoy).errores).toHaveProperty("turno");
  });
});

describe("Núcleo TypeScript (repositorio con Map + servicio con inyección)", () => {
  it("crea una reserva y detecta el conflicto", () => {
    const servicio = new ServicioReservas(new RepositorioReservasMemoria());
    servicio.crearReserva(1, { equipoId: 5, fecha: "2030-05-10", turno: "manana" });
    expect(servicio.estaReservado(5, "2030-05-10", "manana")).toBe(true);
    expect(() => servicio.crearReserva(2, { equipoId: 5, fecha: "2030-05-10", turno: "manana" })).toThrow(ErrorReserva);
  });

  it("solo el dueño o un admin pueden cancelar", () => {
    const servicio = new ServicioReservas(new RepositorioReservasMemoria());
    const reserva = servicio.crearReserva(1, { equipoId: 5, fecha: "2030-05-10", turno: "tarde" });
    expect(() => servicio.cancelarReserva(reserva.id, 2, "usuario")).toThrow("ajena");
    expect(servicio.cancelarReserva(reserva.id, 99, "admin").estado).toBe("cancelada");
  });

  it("una reserva cancelada libera el hueco", () => {
    const servicio = new ServicioReservas(new RepositorioReservasMemoria());
    const reserva = servicio.crearReserva(1, { equipoId: 5, fecha: "2030-05-10", turno: "tarde" });
    servicio.cancelarReserva(reserva.id, 1, "usuario");
    expect(servicio.estaReservado(5, "2030-05-10", "tarde")).toBe(false);
    expect(servicio.listarPorUsuario(1)).toHaveLength(1); // sigue existiendo, solo cambió de estado
  });
});
