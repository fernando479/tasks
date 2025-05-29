/**
 * Este archivo contiene un conjunto de pruebas para verificar
 * el comportamiento en tiempo real de una API de tareas usando WebSockets
 * implementados con Socket.IO.
 *
 * Se validan los siguientes casos:
 * 1. Que se emita correctamente el evento "newTask" al crear una nueva tarea.
 * 2. Que se emita correctamente el evento "taskUpdated" al actualizar el estado de una tarea.
 * 3. Que varios clientes conectados reciban simultáneamente el evento "newTask".
 * 4. Que se emita correctamente el evento "taskDeleted" al eliminar una tarea.
 *
 * Herramientas utilizadas:
 * - Jest: framework de pruebas.
 * - Supertest: para realizar peticiones HTTP a los endpoints.
 * - Socket.IO-client: para simular clientes WebSocket conectados al servidor.
 *
 * Estas pruebas se conectan al servidor levantado en modo de test en el puerto 3000,
 * utilizando una base de datos SQLite en memoria para asegurar un entorno controlado.
 *
 */

const ioClient = require("socket.io-client");
const request = require("supertest");
const { app, server } = require("../src/tasksApi");

const SOCKET_URL = "http://localhost:3000";

describe("Pruebas WebSocket - API de Tareas", () => {
  let clientSocket;

  beforeAll((done) => {
    server.listen(3000, () => {
      clientSocket = ioClient(SOCKET_URL);
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    clientSocket.close();
    server.close();
  });

  //emitir correctamente el evento "newTask" al crear una nueva tarea.
  test('emite "newTask" al crear una tarea', (done) => {
    clientSocket.once("newTask", (task) => {
      try {
        expect(task).toHaveProperty("titulo", "Test tarea");
        expect(task).toHaveProperty("status", "pendiente");
        done();
      } catch (error) {
        done(error);
      }
    });

    request(app)
      .post("/tasks")
      .send({ titulo: "Test tarea" })
      .expect(201)
      .end((err) => {
        if (err) done(err);
      });
  });

  //emitir correctamente el evento "taskUpdated" al actualizar el estado de una tarea
  test('emite "taskUpdated" al actualizar una tarea', (done) => {
    request(app)
      .post("/tasks")
      .send({ titulo: "Para actualizar" })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        const taskId = res.body.id;

        clientSocket.once("taskUpdated", (data) => {
          try {
            expect(data).toEqual({ id: taskId, status: "completada" });
            done();
          } catch (error) {
            done(error);
          }
        });

        request(app)
          .put(`/tasks/${taskId}`)
          .send({ status: "completada" })
          .expect(200)
          .end((err2) => {
            if (err2) done(err2);
          });
      });
  });

  //clientes conectados reciban  el evento "newTask".
  test('varios clientes reciben "newTask"', (done) => {
    const clientSocket2 = ioClient(SOCKET_URL);
    let counter = 0;

    function checkDone() {
      counter++;
      if (counter === 2) {
        clientSocket2.close();
        done();
      }
    }

    clientSocket2.on("connect", () => {
      clientSocket.once("newTask", checkDone);
      clientSocket2.once("newTask", checkDone);

      request(app)
        .post("/tasks")
        .send({ titulo: "Tarea para todos" })
        .expect(201)
        .end((err) => {
          if (err) done(err);
        });
    });
  }, 10000);

  //emitir correctamente el evento "taskDeleted" al eliminar una tarea.
  test('emite "taskDeleted" al eliminar una tarea', (done) => {
    request(app)
      .post("/tasks")
      .send({ titulo: "Para eliminar" })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        const taskId = res.body.id;

        clientSocket.once("taskDeleted", (data) => {
          try {
            expect(data).toEqual({ id: taskId });
            done();
          } catch (error) {
            done(error);
          }
        });

        request(app)
          .delete(`/tasks/${taskId}`)
          .expect(200)
          .end((err2) => {
            if (err2) done(err2);
          });
      });
  });
});
