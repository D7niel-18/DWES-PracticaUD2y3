// ============================================================
// AYUDAS PARA LAS PRUEBAS
// ------------------------------------------------------------
// Cada prueba crea su PROPIA aplicación con datos limpios, así
// una prueba nunca afecta a otra. No hace falta arrancar ningún
// servidor: supertest llama a la aplicación directamente.
// ============================================================

import { createRequire } from "node:module";
import request from "supertest";

const require = createRequire(import.meta.url);
const { crearApp } = require("../src/app");
const { crearRepositorios } = require("../src/repositories");

// Configuración de pruebas (contraseñas con coste bajo para ir rápido)
export const configPruebas = {
  port: 3000,
  nodeEnv: "test",
  sessionSecret: "secreto-solo-para-pruebas-123456",
  esProduccion: false,
  loginMax: 50,
  costeBcrypt: 4,
  sesionMaxAgeMs: 60 * 60 * 1000,
};

// Crea una aplicación nueva junto con sus repositorios
export function crearAppDePrueba(configExtra = {}) {
  const repos = crearRepositorios({ coste: 4 });
  const app = crearApp({ config: { ...configPruebas, ...configExtra }, repositorios: repos });
  return { app, repos };
}

// Cuentas de prueba (definidas en datosIniciales.js)
export const CUENTAS = {
  admin: { email: "admin@example.com", password: "Admin1234!" },
  ana: { email: "ana@example.com", password: "Ana12345!" },
  luis: { email: "luis@example.com", password: "Luis12345!" },
};

// Saca el token CSRF del HTML de una página
export function extraerToken(html) {
  const coincidencia = html.match(/name="_csrf" value="([^"]+)"/);
  return coincidencia ? coincidencia[1] : null;
}

// Visita una página y devuelve el token CSRF que contiene
export async function obtenerToken(agente, ruta) {
  const respuesta = await agente.get(ruta);
  return extraerToken(respuesta.text);
}

// Inicia sesión con un agente (un agente recuerda las cookies, como un navegador)
export async function iniciarSesion(app, cuenta) {
  const agente = request.agent(app);
  const token = await obtenerToken(agente, "/login");
  const respuesta = await agente
    .post("/login")
    .type("form")
    .send({ _csrf: token, email: cuenta.email, password: cuenta.password });
  return { agente, respuesta };
}

// Fecha futura (hoy + N días) en formato AAAA-MM-DD
export function fechaFutura(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export { request };
