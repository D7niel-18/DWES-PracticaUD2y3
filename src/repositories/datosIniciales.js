// ============================================================
// DATOS DE PRUEBA
// ------------------------------------------------------------
// Al arrancar existen 3 equipos, 3 usuarios y 3 reservas.
// Las contraseñas NO se guardan tal cual: se guardan "hasheadas"
// con bcrypt (un cifrado de un solo sentido).
//
// Cuentas de prueba (solo para desarrollo):
//   admin@example.com / Admin1234!   (administrador)
//   ana@example.com   / Ana12345!    (usuario)
//   luis@example.com  / Luis12345!   (usuario)
// ============================================================

const bcrypt = require("bcrypt");

function crearDatosIniciales(coste = 10) {
  const equipos = [
    { id: 1, codigo: "PC-001", nombre: "Ordenador aula 1", tipo: "sobremesa", estado: "operativo" },
    { id: 2, codigo: "PORT-001", nombre: "Portátil Lenovo", tipo: "portatil", estado: "operativo" },
    { id: 3, codigo: "PC-002", nombre: "Ordenador aula 2", tipo: "sobremesa", estado: "fuera_de_servicio" },
  ];

  const usuarios = [
    {
      id: 1,
      nombre: "Administrador",
      email: "admin@example.com",
      passwordHash: bcrypt.hashSync("Admin1234!", coste),
      rol: "admin",
    },
    {
      id: 2,
      nombre: "Ana García",
      email: "ana@example.com",
      passwordHash: bcrypt.hashSync("Ana12345!", coste),
      rol: "usuario",
    },
    {
      id: 3,
      nombre: "Luis Pérez",
      email: "luis@example.com",
      passwordHash: bcrypt.hashSync("Luis12345!", coste),
      rol: "usuario",
    },
  ];

  const reservas = [
    { id: 1, equipoId: 1, usuarioId: 2, fecha: "2027-01-15", turno: "manana", estado: "activa" },
    { id: 2, equipoId: 2, usuarioId: 3, fecha: "2027-01-15", turno: "tarde", estado: "activa" },
    { id: 3, equipoId: 1, usuarioId: 3, fecha: "2027-01-16", turno: "manana", estado: "cancelada" },
  ];

  return { equipos, usuarios, reservas };
}

module.exports = { crearDatosIniciales };