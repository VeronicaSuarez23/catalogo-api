// Validaciones en el servidor. Nunca se confía en lo que envía el cliente.
const HttpError = require('./httpError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const comoObjeto = (body) =>
  body && typeof body === 'object' && !Array.isArray(body) ? body : {};

const textoValido = (v, max) =>
  typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;

// Convierte un parámetro de URL en entero positivo o lanza 400.
function parseId(valor, nombre = 'id') {
  if (typeof valor === 'string' && /^[1-9]\d{0,14}$/.test(valor)) {
    const n = Number(valor);
    if (Number.isSafeInteger(n)) return n;
  }
  throw new HttpError(400, 'ID_INVALIDO', `El ${nombre} debe ser un número entero positivo.`);
}

function lanzarSiHayErrores(errores) {
  if (errores.length > 0) {
    throw new HttpError(422, 'DATOS_INVALIDOS', 'Hay datos inválidos o faltantes.', errores);
  }
}

// Solo se aceptan los campos esperados (por ejemplo "rol" se ignora siempre).
function validarRegistro(body) {
  const b = comoObjeto(body);
  const errores = [];

  if (!textoValido(b.nombre, 100)) {
    errores.push({ campo: 'nombre', mensaje: 'El nombre es obligatorio (máx. 100 caracteres).' });
  }
  if (typeof b.correo !== 'string' || b.correo.length > 254 || !EMAIL_RE.test(b.correo.trim())) {
    errores.push({ campo: 'correo', mensaje: 'El correo no tiene un formato válido.' });
  }
  if (
    typeof b.password !== 'string' ||
    b.password.length < 8 ||
    b.password.length > 72 ||
    !/[A-Za-z]/.test(b.password) ||
    !/\d/.test(b.password)
  ) {
    errores.push({
      campo: 'password',
      mensaje: 'La contraseña debe tener entre 8 y 72 caracteres, con letras y números.',
    });
  }
  lanzarSiHayErrores(errores);

  return {
    nombre: b.nombre.trim(),
    correo: b.correo.trim().toLowerCase(),
    password: b.password,
  };
}

function validarLogin(body) {
  const b = comoObjeto(body);
  const errores = [];
  if (typeof b.correo !== 'string' || b.correo.trim() === '') {
    errores.push({ campo: 'correo', mensaje: 'El correo es obligatorio.' });
  }
  if (typeof b.password !== 'string' || b.password === '') {
    errores.push({ campo: 'password', mensaje: 'La contraseña es obligatoria.' });
  }
  lanzarSiHayErrores(errores);
  return { correo: b.correo.trim().toLowerCase(), password: b.password };
}

function validarProducto(body) {
  const b = comoObjeto(body);
  const errores = [];

  if (!textoValido(b.nombre, 120)) {
    errores.push({ campo: 'nombre', mensaje: 'El nombre es obligatorio (máx. 120 caracteres).' });
  }
  if (!textoValido(b.descripcion, 1000)) {
    errores.push({ campo: 'descripcion', mensaje: 'La descripción es obligatoria (máx. 1000 caracteres).' });
  }
  if (!textoValido(b.categoria, 60)) {
    errores.push({ campo: 'categoria', mensaje: 'La categoría es obligatoria (máx. 60 caracteres).' });
  }
  if (
    typeof b.precio !== 'number' ||
    !Number.isFinite(b.precio) ||
    b.precio < 0.01 ||
    b.precio > 1000000
  ) {
    errores.push({ campo: 'precio', mensaje: 'El precio debe ser un número mayor que cero (máx. 1.000.000).' });
  }
  lanzarSiHayErrores(errores);

  return {
    nombre: b.nombre.trim(),
    descripcion: b.descripcion.trim(),
    categoria: b.categoria.trim(),
    precio: Math.round(b.precio * 100) / 100,
  };
}

function validarFavorito(body) {
  const b = comoObjeto(body);
  // Solo se lee "productoId". Cualquier "usuarioId" enviado por el cliente se ignora.
  if (typeof b.productoId !== 'number' || !Number.isInteger(b.productoId) || b.productoId < 1) {
    lanzarSiHayErrores([{ campo: 'productoId', mensaje: 'productoId debe ser un entero positivo.' }]);
  }
  return { productoId: b.productoId };
}

module.exports = { parseId, validarRegistro, validarLogin, validarProducto, validarFavorito };
