// ============================================================
// PRUEBAS AUTOMATIZADAS DE LA APLICACIÓN (Vitest + Supertest)
// ------------------------------------------------------------
// Las 10 primeras corresponden, en orden, a los comportamientos
// que exige el enunciado. Después hay pruebas extra.
// ============================================================

import { describe, it, expect, beforeEach } from "vitest";
import {
  crearAppDePrueba,
  CUENTAS,
  iniciarSesion,
  obtenerToken,
  fechaFutura,
  request,
} from "./ayudas.js";

let app;
let repos;

// Antes de CADA prueba se crea una aplicación nueva con datos limpios
beforeEach(() => {
  ({ app, repos } = crearAppDePrueba());
});

describe("Requisitos del enunciado", () => {
  // ---------- 1 ----------
  it("1. Registra a un usuario válido (con rol usuario y contraseña cifrada)", async () => {
    const agente = request.agent(app);
    const token = await obtenerToken(agente, "/registro");

    const respuesta = await agente.post("/registro").type("form").send({
      _csrf: token,
      nombre: "Marta Ruiz",
      email: "marta@example.com",
      password: "ClaveSegura1",
      password2: "ClaveSegura1",
      rol: "admin", // intento de colarse como admin: debe ignorarse
    });

    expect(respuesta.status).toBe(303);
    const guardado = repos.usuarios.buscarPorEmail("marta@example.com");
    expect(guardado.rol).toBe("usuario");
    expect(guardado.passwordHash).not.toBe("ClaveSegura1");
    expect(guardado.passwordHash.startsWith("$2")).toBe(true); // formato bcrypt
  });

  // ---------- 2 ----------
  it("2. Rechaza credenciales incorrectas con 401", async () => {
    const { respuesta } = await iniciarSesion(app, { email: "ana@example.com", password: "mala-clave" });
    expect(respuesta.status).toBe(401);
    expect(respuesta.text).toContain("Correo o contraseña incorrectos.");
  });

  // ---------- 3 ----------
  it("3. Redirige (303) a /login al entrar en una ruta privada sin autenticar", async () => {
    const respuesta = await request(app).get("/mis-reservas");
    expect(respuesta.status).toBe(303);
    expect(respuesta.headers.location).toBe("/login");
  });

  // ---------- 4 ----------
  it("4. Permite entrar en una ruta privada con sesión iniciada", async () => {
    const { agente, respuesta } = await iniciarSesion(app, CUENTAS.ana);
    expect(respuesta.status).toBe(303);

    const perfil = await agente.get("/perfil");
    expect(perfil.status).toBe(200);
    expect(perfil.text).toContain("ana@example.com");
    expect(perfil.text).not.toContain("passwordHash"); // nunca se muestran hashes
  });

  // ---------- 5 ----------
  it("5. Rechaza (403) una operación de administrador hecha por un usuario normal", async () => {
    const { agente } = await iniciarSesion(app, CUENTAS.ana);
    const token = await obtenerToken(agente, "/perfil"); // token CSRF válido

    const respuesta = await agente
      .post("/admin/equipos/1/estado")
      .type("form")
      .send({ _csrf: token, estado: "fuera_de_servicio" });

    expect(respuesta.status).toBe(403);
    expect(repos.equipos.buscarPorId(1).estado).toBe("operativo"); // no cambió
  });

  // ---------- 6 ----------
  it("6. Crea una reserva válida de un equipo disponible", async () => {
    const { agente } = await iniciarSesion(app, CUENTAS.ana);
    const token = await obtenerToken(agente, "/reservas/nueva");
    const fecha = fechaFutura(10);

    const respuesta = await agente
      .post("/reservas")
      .type("form")
      .send({ _csrf: token, equipoId: "2", fecha, turno: "manana" });

    expect(respuesta.status).toBe(303); // Post/Redirect/Get
    expect(respuesta.headers.location).toBe("/mis-reservas");

    const creada = repos.reservas.todas().find((r) => r.fecha === fecha && r.turno === "manana");
    expect(creada.usuarioId).toBe(2); // el usuario sale de la sesión (Ana)
    expect(creada.estado).toBe("activa");

    // Mensaje de confirmación de un solo uso
    const primera = await agente.get("/mis-reservas");
    expect(primera.text).toContain("Reserva creada correctamente.");
    const segunda = await agente.get("/mis-reservas");
    expect(segunda.text).not.toContain("Reserva creada correctamente.");
  });

  // ---------- 7 ----------
  it("7. Rechaza (409) una reserva duplicada para el mismo equipo, fecha y turno", async () => {
    const fecha = fechaFutura(12);
    repos.reservas.crear({ equipoId: 2, usuarioId: 2, fecha, turno: "tarde", estado: "activa" });

    const { agente } = await iniciarSesion(app, CUENTAS.luis);
    const token = await obtenerToken(agente, "/reservas/nueva");

    const respuesta = await agente
      .post("/reservas")
      .type("form")
      .send({ _csrf: token, equipoId: "2", fecha, turno: "tarde" });

    expect(respuesta.status).toBe(409);
    expect(respuesta.text).toContain("ya está reservado");
    expect(repos.reservas.todas().filter((r) => r.fecha === fecha)).toHaveLength(1);
  });

  // ---------- 8 ----------
  it("8. Rechaza (403) la cancelación de una reserva ajena", async () => {
    // La reserva 1 pertenece a Ana; Luis intenta cancelarla
    const { agente } = await iniciarSesion(app, CUENTAS.luis);
    const token = await obtenerToken(agente, "/mis-reservas");

    const respuesta = await agente.post("/reservas/1/cancelar").type("form").send({ _csrf: token });

    expect(respuesta.status).toBe(403);
    expect(repos.reservas.buscarPorId(1).estado).toBe("activa");
  });

  // ---------- 9 ----------
  it("9. Rechaza (403) un cambio de estado sin token CSRF válido", async () => {
    const { agente } = await iniciarSesion(app, CUENTAS.admin);

    // Sin token
    const sinToken = await agente
      .post("/admin/equipos/1/estado")
      .type("form")
      .send({ estado: "fuera_de_servicio" });
    expect(sinToken.status).toBe(403);

    // Con token falso
    const tokenFalso = await agente
      .post("/admin/equipos/1/estado")
      .type("form")
      .send({ _csrf: "token-inventado", estado: "fuera_de_servicio" });
    expect(tokenFalso.status).toBe(403);

    expect(repos.equipos.buscarPorId(1).estado).toBe("operativo");
  });

  // ---------- 10 ----------
  it("10. Invalida la sesión en el servidor después del logout", async () => {
    const { agente, respuesta } = await iniciarSesion(app, CUENTAS.ana);
    // Guardamos la cookie de sesión por si alguien la hubiera copiado
    const cookieAntigua = respuesta.headers["set-cookie"].map((c) => c.split(";")[0]);

    const token = await obtenerToken(agente, "/perfil");
    const salida = await agente.post("/logout").type("form").send({ _csrf: token });
    expect(salida.status).toBe(303);
    expect(salida.headers["set-cookie"].join(";")).toMatch(/sid=;/); // cookie retirada

    // El agente ya no tiene acceso...
    const conAgente = await agente.get("/perfil");
    expect(conAgente.status).toBe(303);

    // ...y la cookie antigua tampoco sirve: la sesión ya no existe en el servidor
    const conCookieVieja = await request(app).get("/perfil").set("Cookie", cookieAntigua);
    expect(conCookieVieja.status).toBe(303);
    expect(conCookieVieja.headers.location).toBe("/login");
  });
});

describe("Pruebas adicionales", () => {
  it("Rechaza una reserva con fecha anterior a hoy (400)", async () => {
    const { agente } = await iniciarSesion(app, CUENTAS.ana);
    const token = await obtenerToken(agente, "/reservas/nueva");
    const respuesta = await agente
      .post("/reservas")
      .type("form")
      .send({ _csrf: token, equipoId: "2", fecha: "2020-01-01", turno: "manana" });
    expect(respuesta.status).toBe(400);
    expect(respuesta.text).toContain("no puede ser anterior a hoy");
  });

  it("Rechaza reservar un equipo fuera de servicio (400) y uno inexistente (404)", async () => {
    const { agente } = await iniciarSesion(app, CUENTAS.ana);
    const token = await obtenerToken(agente, "/reservas/nueva");
    const datos = { _csrf: token, fecha: fechaFutura(5), turno: "manana" };

    const fuera = await agente.post("/reservas").type("form").send({ ...datos, equipoId: "3" });
    expect(fuera.status).toBe(400);

    const inexistente = await agente.post("/reservas").type("form").send({ ...datos, equipoId: "999" });
    expect(inexistente.status).toBe(404);
  });

  it("Una reserva cancelada no impide que otro usuario reserve el equipo", async () => {
    const fecha = fechaFutura(8);
    repos.reservas.crear({ equipoId: 1, usuarioId: 3, fecha, turno: "manana", estado: "cancelada" });

    const { agente } = await iniciarSesion(app, CUENTAS.ana);
    const token = await obtenerToken(agente, "/reservas/nueva");
    const respuesta = await agente
      .post("/reservas")
      .type("form")
      .send({ _csrf: token, equipoId: "1", fecha, turno: "manana" });
    expect(respuesta.status).toBe(303);
  });

  it("Cancelar cambia el estado y NO elimina la reserva", async () => {
    const { agente } = await iniciarSesion(app, CUENTAS.ana);
    const token = await obtenerToken(agente, "/mis-reservas");
    const total = repos.reservas.todas().length;

    const respuesta = await agente.post("/reservas/1/cancelar").type("form").send({ _csrf: token });
    expect(respuesta.status).toBe(303);
    expect(repos.reservas.buscarPorId(1).estado).toBe("cancelada");
    expect(repos.reservas.todas()).toHaveLength(total);
  });

  it("El administrador puede añadir un equipo y cambiar su estado", async () => {
    const { agente } = await iniciarSesion(app, CUENTAS.admin);
    const token = await obtenerToken(agente, "/admin/equipos");

    const alta = await agente
      .post("/admin/equipos")
      .type("form")
      .send({ _csrf: token, codigo: "pc-010", nombre: "Ordenador aula 3", tipo: "sobremesa" });
    expect(alta.status).toBe(303);
    const nuevo = repos.equipos.buscarPorCodigo("PC-010");
    expect(nuevo.estado).toBe("operativo");

    const cambio = await agente
      .post(`/admin/equipos/${nuevo.id}/estado`)
      .type("form")
      .send({ _csrf: token, estado: "fuera_de_servicio" });
    expect(cambio.status).toBe(303);
    expect(repos.equipos.buscarPorId(nuevo.id).estado).toBe("fuera_de_servicio");
  });

  it("El administrador puede cancelar cualquier reserva", async () => {
    const { agente } = await iniciarSesion(app, CUENTAS.admin);
    const token = await obtenerToken(agente, "/admin/reservas");
    const respuesta = await agente.post("/admin/reservas/2/cancelar").type("form").send({ _csrf: token });
    expect(respuesta.status).toBe(303);
    expect(repos.reservas.buscarPorId(2).estado).toBe("cancelada");
  });

  it("El filtro del catálogo por tipo y operativos funciona", async () => {
    const portatiles = await request(app).get("/equipos?tipo=portatil");
    expect(portatiles.text).toContain("PORT-001");
    expect(portatiles.text).not.toContain("PC-001");

    const operativos = await request(app).get("/equipos?operativos=true");
    expect(operativos.text).not.toContain("PC-002"); // fuera de servicio

    const invalido = await request(app).get("/equipos?tipo=nevera");
    expect(invalido.status).toBe(400);
  });

  it("La cookie de preferencias fija el filtro inicial del catálogo", async () => {
    const agente = request.agent(app);
    await agente.get("/equipos?tipo=portatil"); // guarda la preferencia
    const inicial = await agente.get("/equipos"); // sin filtro: usa la cookie
    expect(inicial.text).toContain("PORT-001");
    expect(inicial.text).not.toContain("PC-001");
  });

  it("La ficha de un equipo inexistente devuelve 404", async () => {
    const respuesta = await request(app).get("/equipos/999");
    expect(respuesta.status).toBe(404);
  });

  it("El error de login es el mismo si el correo existe o no", async () => {
    const existe = await iniciarSesion(app, { email: "ana@example.com", password: "incorrecta1" });
    const noExiste = await iniciarSesion(app, { email: "nadie@example.com", password: "incorrecta1" });
    expect(existe.respuesta.status).toBe(401);
    expect(noExiste.respuesta.status).toBe(401);
    expect(existe.respuesta.text).toContain("Correo o contraseña incorrectos.");
    expect(noExiste.respuesta.text).toContain("Correo o contraseña incorrectos.");
  });

  it("Limita los intentos de login fallidos (429)", async () => {
    const { app: appLimitada } = crearAppDePrueba({ loginMax: 3 });
    const agente = request.agent(appLimitada);
    const token = await obtenerToken(agente, "/login");

    let ultimo;
    for (let i = 0; i < 4; i++) {
      ultimo = await agente.post("/login").type("form").send({ _csrf: token, email: "ana@example.com", password: "x" });
    }
    expect(ultimo.status).toBe(429);
  });

  it("Escapa el contenido del usuario para que no se interprete como HTML", async () => {
    const agente = request.agent(app);
    const token = await obtenerToken(agente, "/registro");
    await agente.post("/registro").type("form").send({
      _csrf: token,
      nombre: "<b>Hacker</b>",
      email: "h@example.com",
      password: "ClaveSegura1",
      password2: "ClaveSegura1",
    });
    const { agente: sesion } = await iniciarSesion(app, { email: "h@example.com", password: "ClaveSegura1" });
    const perfil = await sesion.get("/perfil");
    expect(perfil.text).toContain("&lt;b&gt;Hacker&lt;/b&gt;");
    expect(perfil.text).not.toContain("<b>Hacker</b>");
  });

  it("El formulario de reserva solo ofrece los equipos disponibles", async () => {
    const fecha = fechaFutura(6);
    repos.reservas.crear({ equipoId: 1, usuarioId: 3, fecha, turno: "tarde", estado: "activa" });

    const { agente } = await iniciarSesion(app, CUENTAS.ana);
    const pagina = await agente.get(`/reservas/nueva?fecha=${fecha}&turno=tarde`);
    expect(pagina.text).toContain("PORT-001"); // libre
    expect(pagina.text).not.toContain("PC-001"); // reservado esa tarde
    expect(pagina.text).not.toContain("PC-002"); // fuera de servicio
  });
});
