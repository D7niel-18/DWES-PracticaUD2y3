# Explicación de la actividad: Sistema de reserva de equipos informáticos

**Módulo:** Desarrollo Web en Entorno Servidor (DWES)
**Tecnologías:** Node.js, Express, EJS, JavaScript y TypeScript

## 1. ¿Qué es?

Una aplicación web para reservar los equipos informáticos de un centro educativo.

- **Visitantes:** consultan los equipos y los filtran por tipo y estado.
- **Usuarios registrados:** reservan un equipo para una fecha y un turno (mañana o tarde), ven sus reservas y las cancelan.
- **Administradores:** añaden equipos, cambian su estado (operativo o fuera de servicio) y consultan o cancelan cualquier reserva.

Los datos se guardan en memoria (sin base de datos), por lo que se reinician al parar el servidor.

## 2. Cómo está organizada (por capas)

| Capa | Carpeta | Qué hace |
|---|---|---|
| Rutas | `src/routes` | Define las URL y qué guardias se aplican |
| Controladores | `src/controllers` | Reciben la petición, validan y responden |
| Servicios | `src/services` | Reglas de negocio (disponibilidad, conflictos, cancelaciones) |
| Repositorios | `src/repositories` | Único acceso a las colecciones en memoria |
| Vistas | `src/views` | Páginas HTML con EJS y parciales reutilizables |

Otras carpetas:

- `src/middleware`: autenticación, roles, CSRF, mensajes flash, límite de login y errores.
- `src/errors`: errores de dominio con su código HTTP.
- `src/utils`: funciones puras (`estaReservado`, `obtenerEquiposDisponibles`, `validarReserva`).
- `src/ts`: núcleo de reservas en TypeScript.

`app.js` construye la aplicación y `server.js` solo la arranca. Gracias a esa separación, las pruebas no necesitan abrir un servidor.

## 3. Funcionalidades principales

- **Catálogo:** `GET /equipos` con filtros por tipo y estado, y ficha de cada equipo.
- **Registro y login:** contraseñas con bcrypt y rol `usuario` asignado siempre en el registro público.
- **Reservas:** el formulario solo ofrece los equipos libres para la fecha y el turno elegidos. El servidor repite todas las comprobaciones al recibir el POST.
- **Cancelación:** el usuario solo cancela sus propias reservas activas. La reserva no se borra, cambia a `cancelada`, y el hueco queda libre.
- **Administración:** rutas reservadas al rol `admin`.
- **Cookies y sesiones:**
  - Una cookie de preferencias recuerda el tipo de equipo favorito. Solo sirve para el filtro inicial, nunca para permisos.
  - La sesión del servidor guarda el id del usuario y los mensajes de confirmación de un solo uso.

## 4. Seguridad

- Autenticación y autorización por roles con middleware reutilizable.
- Comprobación de propiedad de las reservas.
- Protección CSRF en todos los formularios que modifican datos, incluido el cierre de sesión.
- Límite de intentos de login con `express-rate-limit`.
- Validación de todos los datos recibidos.
- Sesión regenerada al entrar y destruida al salir.
- Mensajes de error iguales si el correo existe o no.
- Tratamiento centralizado de errores, sin mostrar trazas ni datos internos.
- Escape automático de los datos del usuario en las vistas.

| Situación | Respuesta |
|---|---|
| Operación válida | 200 o 303 |
| Datos incorrectos | 400 |
| Credenciales incorrectas | 401 |
| Sin permisos | 403 |
| Recurso inexistente | 404 |
| Equipo ya reservado en ese turno | 409 |
| Demasiados intentos de login | 429 |

## 5. Parte de JavaScript y TypeScript

- **JavaScript:** se usan `find`, `filter`, `map` y `some`, además de funciones, condicionales, bucles, conversiones y operaciones asíncronas.
- **TypeScript** (`src/ts`):
  - Interfaces `Equipo`, `Reserva` y `Usuario`.
  - Tipos unión para roles, turnos y estados.
  - Interfaz `RepositorioReservas` y una clase que la implementa con `Map`.
  - Servicio con inyección de dependencias.
  - Compila con `strict: true` y sin `any`.

## 6. Configuración

Las variables `PORT`, `NODE_ENV` y `SESSION_SECRET` se leen del entorno y se validan al arrancar: si alguna es incorrecta, la aplicación no inicia. Se incluye `.env.example` sin secretos y `.env` está excluido en `.gitignore`.

## 7. Pruebas

Se usan **Vitest** y **Supertest**, y se ejecutan con `npm test`. Hay 29 pruebas, entre ellas las 10 que exige el enunciado:

1. Registro de un usuario válido.
2. Rechazo de credenciales incorrectas.
3. Ruta privada sin autenticación.
4. Ruta privada con sesión.
5. Operación de administrador rechazada a un usuario normal.
6. Reserva válida.
7. Reserva duplicada rechazada.
8. Cancelación de una reserva ajena rechazada.
9. Cambio de estado sin token CSRF rechazado.
10. Sesión invalidada tras el logout.

Cada prueba crea una aplicación nueva con datos limpios, sin servidor ni cuentas reales.

## 8. Cómo ejecutarla

```bash
npm install
cp .env.example .env     # edita SESSION_SECRET (mínimo 16 caracteres)
npm start                # http://localhost:3000
npm test                 # pruebas automáticas
npm run build:ts         # compila el núcleo TypeScript
```

**Cuentas de prueba (solo desarrollo):**

| Rol | Correo | Contraseña |
|---|---|---|
| admin | admin@example.com | Admin1234! |
| usuario | ana@example.com | Ana12345! |
| usuario | luis@example.com | Luis12345! |