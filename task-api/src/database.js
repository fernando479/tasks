/**
 * db.js
 *
 * Este módulo configura y gestiona la conexión a la base de datos SQLite para la aplicación.
 *
 * - En entorno de desarrollo, utiliza un archivo físico 'tasks.db'.
 * - En entorno de pruebas (cuando NODE_ENV === 'test'), utiliza una base de datos en memoria (':memory:').
 *   Esto permite realizar pruebas sin afectar los datos reales.
 *
 * Además, al inicializarse crea la tabla 'tasks' si no existe.
 *
 * Exporta:
 *  - db: instancia de sqlite3.Database para usar en otros módulos.
 */

const sqlite3 = require("sqlite3").verbose();

const isTest = process.env.NODE_ENV === "test";

const db = new sqlite3.Database(isTest ? ":memory:" : "tasks.db", (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err.message);
  } else {
    console.log(
      `Conectado a la base de datos ${isTest ? "en memoria" : "tasks.db"}.`
    );
  }
});

// Crear la tabla si no existe (en memoria o en disco)
db.serialize(() => {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      status TEXT DEFAULT 'pendiente',
      fechaCreacion TEXT,
      fechaActualizacion TEXT
    )
  `,
    (err) => {
      if (err) {
        console.error("Error al crear la tabla:", err.message);
      } else {
        console.log('Tabla "tasks" lista.');
      }
    }
  );
});

module.exports = db;
