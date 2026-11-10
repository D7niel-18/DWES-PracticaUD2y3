// El controlador recibe la petición (req), pide el trabajo al
// servicio y decide qué responder (res). No contiene reglas de negocio.

const { esErrorDominio, crearErrorValidacion } = require("../errors/errores");
const { validarLogin, texto } = require("../utils/validaciones");
const { regenerarSesion, guardarSesion, destruirSesion } = require("../utils/sesion");
const { NOMBRE_COOKIE_SESION, opcionesCookieSesion } = require("../config/cookies");

function crearAuthController({ authService, config }) {
  return {
    // GET /registro
    mostrarRegistro(req, res) {
      res.render("auth/registro", { titulo: "Registro", valores: {}, errores: {} });
    },

    // POST /registro
    async registrar(req, res) {
      const datos = req.body || {};
      try {
        await authService.registrar(datos);
        req.flash("exito", "Cuenta creada correctamente. Ya puedes iniciar sesión.");
        res.redirect(303, "/login"); // PRG: redirigimos tras guardar
      } catch (error) {
        if (!esErrorDominio(error)) throw error;
        // Volvemos a mostrar el formulario conservando nombre y correo
        // (la contraseña nunca se devuelve a la página)
        res.status(error.estado).render("auth/registro", {
          titulo: "Registro",
          valores: { nombre: texto(datos.nombre), email: texto(datos.email) },
          errores: error.errores,
        });
      }
    },

    // GET /login
    mostrarLogin(req, res) {
      res.render("auth/login", { titulo: "Iniciar sesión", email: "", mensajeError: null });
    },

    // POST /login
    async login(req, res) {
      const datos = req.body || {};
      const validacion = validarLogin(datos);
      try {
        if (!validacion.valido) throw crearErrorValidacion(validacion.errores, validacion.errores.general);

        const usuario = await authService.autenticar(validacion.valores.email, validacion.valores.password);

        // Al iniciar sesión se crea un identificador de sesión NUEVO
        await regenerarSesion(req);
        req.session.usuarioId = usuario.id; // solo guardamos el id
        req.flash("exito", `Bienvenido/a, ${usuario.nombre}.`);
        await guardarSesion(req);
        res.redirect(303, "/perfil");
      } catch (error) {
        // Solo gestionamos aquí los errores de credenciales y de validación
        const esDeLogin = esErrorDominio(error) && (error.tipo === "credenciales" || error.tipo === "validacion");
        if (!esDeLogin) throw error;
        // Mismo mensaje tanto si el correo no existe como si la contraseña falla
        res.status(error.estado).render("auth/login", {
          titulo: "Iniciar sesión",
          email: validacion.valores.email,
          mensajeError: error.message,
        });
      }
    },

    // POST /logout
    async logout(req, res) {
      await destruirSesion(req); // borra la sesión del servidor
      // Retira la cookie del navegador (mismas opciones con las que se creó)
      const opciones = opcionesCookieSesion(config);
      delete opciones.maxAge; // para borrar la cookie no hace falta maxAge
      res.clearCookie(NOMBRE_COOKIE_SESION, opciones);
      res.redirect(303, "/login");
    },

    // GET /perfil
    perfil(req, res) {
      res.render("auth/perfil", { titulo: "Mi perfil", perfil: authService.aPublico(req.usuario) });
    },
  };
}

module.exports = crearAuthController;