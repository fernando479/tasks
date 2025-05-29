/**
 * taskApi.js
 *
 * API REST para gestión de tareas en tiempo real.
 * Define rutas REST para crear, listar, actualizar y eliminar tareas en la base de datos.
 * Configura WebSocket (Socket.IO) para emitir eventos en tiempo real a todos los clientes conectados.
 *
 * Endpoints:
 *   - POST /tasks          : crear nueva tarea
 *   - GET /tasks           : obtener listado de tareas
 *   - PUT /tasks/:id       : actualizar estado de una tarea
 *   - DELETE /tasks/:id    : eliminar una tarea
 *
 * Eventos WebSocket:
 *   - 'newTask'      : emitido cuando se crea una tarea
 *   - 'taskUpdated'  : emitido al actualizar una tarea
 *   - 'taskDeleted'  : emitido al eliminar una tarea
 * 
 * Además, valida restricciones de la base de datos antes de interactuar con ella.
 * 
 */

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");

const database = require("./database");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static("public"));

//crear nueva tarea
app.post("/tasks", (req, res) => {
  const { titulo, descripcion } = req.body;

  if (!titulo || titulo.length > 100) {
    return res
      .status(400)
      .json({ error: "Titulo obligatorio y máximo 100 caracteres" });
  }
  if (descripcion && descripcion.length > 500) {
    return res.status(400).json({ error: "Descripcion máximo 500 caracteres" });
  }

  const fechaCreacion = new Date().toISOString();
  const fechaActualizacion = fechaCreacion;
  const status = "pendiente";

  const query = `INSERT INTO tasks (titulo, descripcion, status, fechaCreacion, fechaActualizacion)
                 VALUES (?, ?, ?, ?, ?)`;

  database.run(
    query,
    [titulo, descripcion || "", status, fechaCreacion, fechaActualizacion],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const newTask = {
        id: this.lastID,
        titulo,
        descripcion: descripcion || "",
        status,
        fechaCreacion,
        fechaActualizacion,
      };

      io.emit("newTask", newTask);

      res.status(201).json(newTask);
    }
  );
});

//bbtener todas las tareas 
app.get("/tasks", (req, res) => {
  database.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows); 
  });
});

//actualizar estado de tarea 
app.put("/tasks/:id", (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status es obligatorio" });

  const fechaActualizacion = new Date().toISOString();
  const query = `UPDATE tasks SET status = ?, fechaActualizacion = ? WHERE id = ?`;

  database.run(query, [status, fechaActualizacion, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Tarea no encontrada" });

    io.emit("taskUpdated", { id: Number(id), status });

    res.json({ id: Number(id), status });
  });
});

//eliminar tarea 
app.delete("/tasks/:id", (req, res) => {
  const id = req.params.id;
  database.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Tarea no encontrada" });

    io.emit("taskDeleted", { id: Number(id) });

    res.json({ message: "Tarea eliminada", id: Number(id) });
  });
});


io.on("connection", (socket) => {
  console.log("Cliente conectado");
});

module.exports = { app, server };
