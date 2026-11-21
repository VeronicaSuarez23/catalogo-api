-- Esquema de la base de datos (SQLite). Se ejecuta automáticamente al iniciar.

CREATE TABLE IF NOT EXISTS usuarios (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre        TEXT    NOT NULL,
  correo        TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  rol           TEXT    NOT NULL DEFAULT 'usuario' CHECK (rol IN ('usuario', 'administrador')),
  creado_en     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS productos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre         TEXT NOT NULL,
  descripcion    TEXT NOT NULL,
  categoria      TEXT NOT NULL,
  precio         REAL NOT NULL CHECK (precio > 0),
  creado_en      TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Favoritos: relación usuario-producto sin duplicados (UNIQUE).
-- ON DELETE CASCADE: si se elimina un producto (o usuario), sus favoritos se eliminan
-- automáticamente, así no quedan referencias huérfanas.
CREATE TABLE IF NOT EXISTS favoritos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  creado_en   TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (usuario_id, producto_id)
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos (categoria COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario   ON favoritos (usuario_id);
