// ============================================================
// CREA LOS TRES REPOSITORIOS CON SUS DATOS DE PRUEBA
// ------------------------------------------------------------
// Es una función (y no una variable global) para que cada prueba
// automática pueda empezar con datos limpios.
// ============================================================

const EquiposRepository = require("./equiposRepository");
const ReservasRepository = require("./reservasRepository");
const UsuariosRepository = require("./usuariosRepository");
const { crearDatosIniciales } = require("./datosIniciales");

function crearRepositorios({ coste = 10 } = {}) {
  const datos = crearDatosIniciales(coste);
  return {
    equipos: new EquiposRepository(datos.equipos),
    reservas: new ReservasRepository(datos.reservas),
    usuarios: new UsuariosRepository(datos.usuarios),
  };
}

module.exports = { crearRepositorios };
