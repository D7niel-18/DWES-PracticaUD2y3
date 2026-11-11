// Son errores "previstos": cosas que pueden pasar en el uso normal
// (reserva duplicada, equipo inexistente, falta de permisos...).
// Cada uno lleva el código HTTP que le corresponde.
// El tratamiento centralizado de errores los convierte en páginas.


// Error base: todos los demás heredan de él
class ErrorDominio extends Error {
  constructor(mensaje, estado = 500, errores = {}) {
    super(mensaje);
    this.name = this.constructor.name;
    this.estado = estado; // código HTTP (400, 401, 403...)
    this.errores = errores; // errores por campo: { fecha: "mensaje" }
  }
}

// 400: los datos enviados no son correctos
class ErrorValidacion extends ErrorDominio {
  constructor(errores = {}, mensaje = "Los datos enviados no son válidos.") {
    super(mensaje, 400, errores);
  }
}

// 401: credenciales incorrectas (mensaje genérico a propósito)
class ErrorCredenciales extends ErrorDominio {
  constructor() {
    super("Correo o contraseña incorrectos.", 401);
  }
}

// 403: usuario identificado pero sin permiso
class ErrorPermisos extends ErrorDominio {
  constructor(mensaje = "No tienes permisos para realizar esta acción.") {
    super(mensaje, 403);
  }
}

// 404: el recurso no existe
class ErrorNoEncontrado extends ErrorDominio {
  constructor(mensaje = "El recurso solicitado no existe.") {
    super(mensaje, 404);
  }
}

// 409: conflicto (por ejemplo, equipo ya reservado en ese turno)
class ErrorConflicto extends ErrorDominio {
  constructor(mensaje, errores = {}) {
    super(mensaje, 409, errores);
  }
}

// 429: demasiados intentos de login
class ErrorDemasiadasPeticiones extends ErrorDominio {
  constructor() {
    super("Demasiados intentos. Espera unos minutos e inténtalo de nuevo.", 429);
  }
}

module.exports = {
  ErrorDominio,
  ErrorValidacion,
  ErrorCredenciales,
  ErrorPermisos,
  ErrorNoEncontrado,
  ErrorConflicto,
  ErrorDemasiadasPeticiones,
};
