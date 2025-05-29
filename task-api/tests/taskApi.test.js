/**
 * Este archivo contiene un conjunto de pruebas para validar
 * el correcto funcionamiento de la API REST de gestión de tareas.
 *
 * Se evalúan los siguientes casos:
 * 1. Crear una nueva tarea mediante POST /tasks.
 * 2. Obtener el listado de tareas mediante GET /tasks.
 * 3. Actualizar el estado de una tarea mediante PUT /tasks/:id.
 * 4. Eliminar una tarea mediante DELETE /tasks/:id.
 * 5. Validar restricciones:
 *    - Título obligatorio y con un máximo de 100 caracteres.
 *    - Descripción opcional con un máximo de 500 caracteres.
 *  
 */

const request = require("supertest");
const { app, server } = require("../src/tasksApi");

// Cierra el servidor después de todas las pruebas
afterAll(() => {
  server.close();
});

describe("Pruebas de API /tasks", () => {
  //crear nueva tarea
  it("debería crear una tarea nueva con POST /tasks", async () => {
    const response = await request(app).post("/tasks").send({
      titulo: "Tarea de prueba",
      descripcion: "Esta es una descripcion de prueba",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.titulo).toBe("Tarea de prueba");
  });

  //obtener tareas
  it("debería obtener todas las tareas con GET /tasks", async () => {
    const response = await request(app).get("/tasks");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  //actualizar tareas
  it("debería actualizar una tarea con PUT /tasks/:id", async () => {
    // Primero crear una tarea para luego actualizarla
    const newTask = await request(app)
      .post("/tasks")
      .send({ titulo: "Tarea a actualizar" });

    const response = await request(app)
      .put(`/tasks/${newTask.body.id}`)
      .send({ status: "completada" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("completada");
  });

  //eliminar tarea
  it("debería eliminar una tarea con DELETE /tasks/:id", async () => {
    // Primero crear una tarea para luego eliminarla
    const newTask = await request(app)
      .post("/tasks")
      .send({ titulo: "Tarea a eliminar" });

    const response = await request(app).delete(`/tasks/${newTask.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Tarea eliminada");
  });

  it("debería fallar si no envías título en POST /tasks", async () => {
    const response = await request(app)
      .post("/tasks")
      .send({ descripcion: "Sin título" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "Titulo obligatorio y máximo 100 caracteres"
    );
  });

  it("debería fallar si el título es muy largo", async () => {
    const tituloLargo = "t".repeat(110);
    const response = await request(app)
      .post("/tasks")
      .send({ titulo: tituloLargo });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "Titulo obligatorio y máximo 100 caracteres"
    );
  });

  it("debería fallar si la descripción es muy larga", async () => {
    const descripcionLarga = "d".repeat(510);
    const response = await request(app)
      .post("/tasks")
      .send({ titulo: "Título válido", descripcion: descripcionLarga });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "Descripcion máximo 500 caracteres"
    );
  });
});
