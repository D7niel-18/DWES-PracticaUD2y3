const crearEquiposRepository = require("./equiposRepository");
const crearReservasRepository = require("./reservasRepository");
const crearUsuariosRepository = require("./usuariosRepository");
const { crearDatosIniciales } = require("./datosIniciales");

function crearRepositorios({ coste = 10 } = {}) {
  const datos = crearDatosIniciales(coste);
  return {
    equipos: crearEquiposRepository(datos.equipos),
    reservas: crearReservasRepository(datos.reservas),
    usuarios: crearUsuariosRepository(datos.usuarios),
  };
}

module.exports = { crearRepositorios };
