"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservasRepositoryMap = void 0;
class ReservasRepositoryMap {
    reservas = new Map();
    siguienteId = 1;
    constructor(datosIniciales = []) {
        for (const reserva of datosIniciales) {
            this.reservas.set(reserva.id, reserva);
            if (reserva.id >= this.siguienteId) {
                this.siguienteId = reserva.id + 1;
            }
        }
    }
    guardar(datos) {
        const nuevaReserva = {
            id: this.siguienteId++,
            ...datos,
            estado: 'activa',
        };
        this.reservas.set(nuevaReserva.id, nuevaReserva);
        return { ...nuevaReserva };
    }
    buscarPorId(id) {
        const reserva = this.reservas.get(id);
        return reserva ? { ...reserva } : undefined;
    }
    buscarPorUsuario(usuarioId) {
        return Array.from(this.reservas.values())
            .filter((r) => r.usuarioId === usuarioId)
            .map((r) => ({ ...r }));
    }
    obtenerTodas() {
        return Array.from(this.reservas.values()).map((r) => ({ ...r }));
    }
    actualizarEstado(id, estado) {
        const reserva = this.reservas.get(id);
        if (!reserva)
            return undefined;
        const actualizada = { ...reserva, estado };
        this.reservas.set(id, actualizada);
        return { ...actualizada };
    }
}
exports.ReservasRepositoryMap = ReservasRepositoryMap;
