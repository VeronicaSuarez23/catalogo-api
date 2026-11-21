# API REST de Catálogo de Productos y Favoritos

API desarrollada con **Node.js + Express** para gestionar un catálogo de productos y los favoritos personales de cada usuario, con **autenticación JWT** y **autorización por roles**.

## Autor

- **Veronica Pin Suarez**

## Propósito

Permitir consultar un catálogo público de productos, que solo el administrador pueda administrar, y que cada usuario autenticado gestione sus propios favoritos.

## Elección de base de datos: SQLite

Se eligió **SQLite** (librería `better-sqlite3`) porque:

- No requiere instalar ni configurar un servidor de base de datos: el proyecto se ejecuta con `npm install` y listo, lo que facilita reproducir las pruebas desde una copia limpia.
- Es una base relacional completa: soporta llaves foráneas, `UNIQUE`, `CHECK` y `ON DELETE CASCADE`, que se usan para mantener la consistencia de los datos.
- Todas las consultas están **parametrizadas** (`?`), evitando inyección SQL.
- La información se guarda en un archivo (`data/catalogo.db`) y **persiste al reiniciar Node.js**.

El esquema SQL está en [`src/db/schema.sql`](src/db/schema.sql) y se aplica automáticamente al iniciar.

### Modelo de datos

```
usuarios  (id, nombre, correo UNIQUE, password_hash, rol, creado_en)
productos (id, nombre, descripcion, categoria, precio CHECK > 0, creado_en, actualizado_en)
favoritos (id, usuario_id → usuarios, producto_id → productos, UNIQUE(usuario_id, producto_id))
```

Roles: `usuario` y `administrador`.

**¿Qué pasa con los favoritos al eliminar un producto?** Se eliminan automáticamente (`ON DELETE CASCADE`), así no quedan favoritos que apunten a productos inexistentes. Lo mismo ocurre si se elimina un usuario.

## Requisitos

- Node.js **18 o superior** (recomendado 20/22 LTS) y npm.
- Postman (para las pruebas). Opcional: Newman (se instala como dependencia de desarrollo).

## Instalación

```bash
git clone https://github.com/VeronicaSuarez23/catalogo-api.git
cd catalogo-api
npm install
```

## Variables de entorno

1. Copia el archivo de ejemplo:
   - Linux/Mac: `cp .env.example .env`
   - Windows (CMD): `copy .env.example .env`
2. Edita `.env` y completa:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto 3000) |
| `JWT_SECRET` | Secreto para firmar JWT, **mínimo 32 caracteres** |
| `JWT_EXPIRES_IN` | Vencimiento del token (ej. `1h`) |
| `DB_PATH` | Ruta del archivo SQLite (por defecto `./data/catalogo.db`) |
| `ADMIN_NOMBRE`, `ADMIN_CORREO`, `ADMIN_PASSWORD` | Datos del administrador (script `npm run admin`) |

Genera un secreto seguro con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`.env` está en `.gitignore`: **nunca se sube al repositorio**.

## Inicialización de datos y del administrador

```bash
npm run init-db   # (opcional) crea las tablas; también se crean solas al iniciar
npm run seed      # inserta 8 productos de ejemplo (ficticios, sin duplicar)
npm run admin     # crea el administrador con ADMIN_* de .env
```

El registro público **siempre** crea usuarios con rol `usuario` (ignora cualquier `rol` enviado). El único camino para tener un administrador es el script `npm run admin` (procedimiento local). Si el correo ya existe, el script lo promueve a administrador y actualiza su contraseña.

## Ejecución

```bash
npm start        # producción
npm run dev      # desarrollo (reinicia al guardar cambios)
```

La API queda en `http://localhost:3000/api`. Comprobación: `GET http://localhost:3000/api/salud`.

## Formato de respuestas

Éxito: `{ "ok": true, "data": ... }`

Error: `{ "ok": false, "error": { "codigo": "...", "mensaje": "...", "detalles": [ ... ] } }`  (`detalles` solo en validaciones)

### Criterio de códigos HTTP

| Código | Cuándo se usa |
|---|---|
| 200 | Consulta, actualización o login correctos |
| 201 | Recurso creado (registro, producto, favorito) |
| 204 | Eliminación correcta (sin cuerpo) |
| 400 | Petición **mal formada**: id no numérico en la URL, JSON inválido, filtro inválido |
| 422 | Datos del cuerpo **sintácticamente correctos pero inválidos**: campos vacíos o faltantes, correo inválido, precio ≤ 0 o no numérico, contraseña débil |
| 401 | Falta token, es inválido, tiene firma incorrecta o está vencido; o credenciales incorrectas |
| 403 | Token válido pero sin permisos (rol `usuario` intentando modificar el catálogo) |
| 404 | Producto o favorito inexistente |
| 409 | Duplicado (correo ya registrado, favorito repetido) |
| 500 | Error interno (mensaje genérico, sin detalles) |

## Rutas de la API (prefijo `/api`)

| Método y ruta | Acceso | Cuerpo | Respuesta |
|---|---|---|---|
| `POST /auth/registro` | Público | `{nombre, correo, password}` | 201 usuario `{id, nombre, correo, rol, creadoEn}` · 409 correo duplicado · 422 inválido |
| `POST /auth/login` | Público | `{correo, password}` | 200 `{token, tipo, expiraEn, usuario}` · 401 credenciales incorrectas |
| `GET /productos` | Público | — (opcional `?categoria=`) | 200 lista de productos |
| `GET /productos/:id` | Público | — | 200 producto · 400 id inválido · 404 |
| `POST /productos` | **Administrador** | `{nombre, descripcion, categoria, precio}` | 201 producto · 401 · 403 · 422 |
| `PUT /productos/:id` | **Administrador** | `{nombre, descripcion, categoria, precio}` (reemplazo completo) | 200 producto · 400 · 401 · 403 · 404 · 422 |
| `DELETE /productos/:id` | **Administrador** | — | 204 · 400 · 401 · 403 · 404 |
| `GET /favoritos` | Autenticado | — | 200 lista de favoritos del usuario del token |
| `POST /favoritos` | Autenticado | `{productoId}` | 201 favorito · 404 producto inexistente · 409 duplicado · 422 |
| `DELETE /favoritos/:productoId` | Autenticado | — | 204 · 400 · 404 (no está en TUS favoritos) |

Las rutas protegidas requieren el encabezado `Authorization: Bearer <token>`.

Reglas de validación: `nombre` ≤ 120, `descripcion` ≤ 1000, `categoria` ≤ 60 (todos obligatorios); `precio` número entre 0,01 y 1.000.000; contraseña de 8 a 72 caracteres con letras y números.

## Seguridad implementada

- Contraseñas con **bcrypt** (`bcryptjs`); nunca se devuelven ni el texto ni el hash.
- JWT HS256 con vencimiento; se verifica **firma y expiración** en cada petición (`algorithms: ['HS256']`).
- La identidad del usuario sale del **token verificado**, nunca del cuerpo/URL. Todas las consultas de favoritos filtran por `usuario_id` del token.
- El rol se consulta en la base en cada petición (no se confía en el cliente).
- Mensaje de login genérico (no revela si el correo existe).
- Consultas SQL parametrizadas; límite de 10 kb por petición; errores sin detalles internos.
- Secretos solo en variables de entorno.

## Estructura del proyecto

```
src/
  app.js, server.js        Configuración de Express y arranque
  config/                  env.js (variables) y db.js (conexión SQLite)
  db/schema.sql            Esquema SQL
  routes/                  Definición de rutas
  controllers/             Lógica de cada endpoint
  repositories/            Acceso a datos (consultas SQL)
  middlewares/             auth.js (JWT + roles) y errores.js
  utils/                   Validaciones y errores HTTP
scripts/                   init-db, seed, crear-admin
postman/                   Colección y entorno de pruebas
```

## Pruebas (Postman)

Archivos: `postman/Catalogo.postman_collection.json` y `postman/Catalogo.postman_environment.json`.

1. Inicia la API (`npm start`) con productos y administrador creados (`npm run seed` y `npm run admin`).
2. En Postman: **Import** → selecciona los dos archivos de `postman/`.
3. Elige el entorno **Catalogo API - Local** y completa localmente (sin exportarlos ni subirlos):
   - `admin_correo` y `admin_password`: los mismos de tu `.env`.
   - `jwt_secret`: el mismo `JWT_SECRET` de tu `.env` (solo se usa para fabricar el token vencido de la prueba 3.3).
4. Ejecuta la colección con **Run collection** (carpetas 0 a 5, en orden).
5. **Persistencia:** detén el servidor (Ctrl+C), vuelve a iniciarlo con `npm start` y ejecuta la carpeta **6**.

También por consola con Newman:

```bash
npx newman run postman/Catalogo.postman_collection.json -e postman/Catalogo.postman_environment.json \
  --env-var "admin_password=TU_PASSWORD_ADMIN" --env-var "jwt_secret=TU_JWT_SECRET"
```

La colección cubre: registro/login correctos, correo duplicado y credenciales incorrectas; CRUD completo como administrador con filtro por categoría; precio inválido y campos vacíos; producto inexistente; 401 sin token / inválido / vencido; 403 con rol usuario; favoritos (crear, consultar, eliminar, duplicado 409, inexistente 404); aislamiento entre usuarios A y B; consistencia al eliminar un producto; y persistencia tras reiniciar.

