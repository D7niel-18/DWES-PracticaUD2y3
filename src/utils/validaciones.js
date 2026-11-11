'use strict';

const { TIPOS_EQUIPO, ESTADOS_EQUIPO } = require('../constants');

/**
 * Limpia y normaliza cadenas de texto recibidas de formularios.
 */
function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

/**
 * Valida los datos recibidos en el formulario de login.
 */
function validarLogin(datos = {}) {
  const email = texto(datos.email);
  const password = typeof datos.password === 'string' ? datos.password : '';
  const errores = {};

  if (!email) {
    errores.email = 'El correo electrónico es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errores.email = 'El formato del correo electrónico no es válido.';
  }

  if (!password) {
    errores.password = 'La contraseña es obligatoria.';
  }

  if (Object.keys(errores).length > 0) {
    errores.general = 'Las credenciales introducidas no son válidas.';
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
    valores: { email, password },
  };
}

/**
 * Valida los datos al crear o editar un equipo desde administración.
 */
function validarEquipo(datos = {}) {
  const codigo = texto(datos.codigo);
  const nombre = texto(datos.nombre);
  const tipo = texto(datos.tipo);
  const estado = texto(datos.estado) || 'operativo';
  const errores = {};

  if (!codigo) {
    errores.codigo = 'El código del equipo es obligatorio.';
  }
  if (!nombre) {
    errores.nombre = 'El nombre del equipo es obligatorio.';
  }
  if (!tipo || !TIPOS_EQUIPO.includes(tipo)) {
    errores.tipo = 'El tipo de equipo debe ser portátil o sobremesa.';
  }
  if (!estado || !ESTADOS_EQUIPO.includes(estado)) {
    errores.estado = 'El estado del equipo no es válido.';
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datos: { codigo, nombre, tipo, estado },
  };
}

module.exports = {
  texto,
  validarLogin,
  validarEquipo,
};