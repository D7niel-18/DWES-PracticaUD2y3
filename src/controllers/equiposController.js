
const { ErrorValidacion } = require("../errors/errores");
const { TIPOS_EQUIPO, texto, validarId } = require("../utils/validaciones");
const { NOMBRE_COOKIE_PREFERENCIA, opcionesCookiePreferencia } = require("../config/cookies");

function crearEquiposController({ equiposService, config }) {
  return {
    // GET /equipos?tipo=portatil&operativos=true
    listar(req, res) {
      let tipo = "";

      if (req.query.tipo === undefined) {
        // No se ha elegido filtro: usamos la COOKIE DE PREFERENCIAS.
        // Solo se acepta si su valor es uno de los tipos permitidos.
        const preferida = req.cookies[NOMBRE_COOKIE_PREFERENCIA];
        tipo = TIPOS_EQUIPO.includes(preferida) ? preferida : "";
      } else {
        // El usuario ha elegido un filtro: se valida y se recuerda
        tipo = texto(req.query.tipo);
        if (tipo !== "" && !TIPOS_EQUIPO.includes(tipo)) {
          throw new ErrorValidacion({ tipo: "Tipo no válido." }, "El tipo de equipo indicado no es válido.");
        }
        if (tipo === "") {
          res.clearCookie(NOMBRE_COOKIE_PREFERENCIA); // "Todos" = sin preferencia
        } else {
          res.cookie(NOMBRE_COOKIE_PREFERENCIA, tipo, opcionesCookiePreferencia(config));
        }
      }

      const operativos = req.query.operativos === "true";
      const equipos = equiposService.listar({ tipo, operativos });

      res.render("equipos/lista", {
        titulo: "Equipos del centro",
        equipos,
        filtros: { tipo, operativos },
      });
    },

    // GET /equipos/:id
    ficha(req, res) {
      const id = validarId(req.params.id);
      if (id === null) throw new ErrorValidacion({}, "El identificador del equipo no es válido.");
      const equipo = equiposService.obtener(id); // lanza 404 si no existe
      res.render("equipos/ficha", { titulo: equipo.nombre, equipo });
    },
  };
}

module.exports = crearEquiposController;