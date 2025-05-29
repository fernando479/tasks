# API de Gestión de Tareas (Node.js & Express)

Sistema simple de "Lista de Tareas Pendientes" (To-Do List) en tiempo real.

---

## Instalación

1. clona este repositorio
https://github.com/fernando479/tasks




2. Ingresa al directorio del proyecto, abre una terminal e instala las dependencias:

```bash
npm install
```

3. Ejecuta con:

``` bash
npm start
```

4. Abre en el navegador la URL:

```
http://localhost:3000/
```

    Ahí verás la lista de tareasy se actualizará automáticamente cuando se creen, modifiquen o eliminen.

---

## Uso de la API con Postman

Puedes interactuar con la API usando Postman o cualquier cliente HTTP. Aquí ejemplos para cada ruta:

- **Crear tarea (POST /tasks)**  
  URL: `http://localhost:3000/tasks`  
  Método: `POST`  
  Body (JSON):  
    ```json
      {
        "titulo": "Ir a la feria",
        "descripcion": "Ir a la feria a comprar verduras"
      }
    ```
  Respuesta esperada: JSON con la tarea creada ID, título, descripción, estado "pendiente" y fechas de creación y actualización. 


- **Obtener todas las tareas (GET /tasks)**  
  URL: `http://localhost:3000/tasks`  
  Método: `GET`
  
  Respuesta esperada: Devuelve un JSON con un listado de todas las tareas, cada una con su ID, título, descripción, estado y fechas.  

- **Actualizar estado de tarea (PUT /tasks/:id)**  
URL: `http://localhost:3000/tasks/1` (reemplaza `1` con el id real de una tarea)  
Método: `PUT`  
Body (JSON):  
  ```json
  {
    "status": "completada"
  }
  ```
  Respuesta esperada: Actualiza el estado de una tarea y devuelve un JSON con el ID, el nuevo estado y la fecha de actualización.

  


- **Eliminar tarea (DELETE /tasks/:id)**  
URL: `http://localhost:3000/tasks/1` (reemplaza `1` con el id real)  
Método: `DELETE`

    Respuesta esperada: Elimina una tarea y devuelve un JSON confirmando la eliminación con el ID.

---

## Simulación de múltiples usuarios

Puedes abrir varias ventanas o pestañas del navegador apuntando a `http://localhost:3000/` para simular diferentes usuarios conectados simultáneamente. Las tareas se sincronizan en tiempo real entre todas las ventanas gracias a WebSockets.

---

## Tests 
Se incluyen algunos tests que validan tanto la **API** como la **comunicación en tiempo real via WebSockets**.

Se utilizan las siguientes herramientas:

- **Jest**: Framework de pruebas.
- **supertest**: Realizar peticiones HTTP simuladas.
- **Socket.IO-client**: Simular clientes WebSocket conectados al servidor.


- **API**: Verifica que los endpoints funcionen correctamente:
    - Casos cubiertos:
        -Crear una nueva tarea.
        - Obtener todas las tareas
        - Actualizar el estado de una tarea.
        - Eliminar una tarea.
        - Validar titulo obligatorio y de max 100 caracteres
        - Descripción maxima de 500 caracteres
    
   

```bash
npm run test:api
```

- **WebSockets**: Comprueba que se emitan correctamente los evento:
    - Casos cubiertos:
        - Emitir newTask al crear una tarea.
        - Emitir taskUpdated al actualizar el estado de una tarea.
        - Emitir taskDeleted al eliminar una tarea.
        - Verificar que múltiples clientes conectados reciban los eventos en tiempo real.
   

```bash
npm run test:websocket
```
- Los dos tests juntos:

```bash
npm run tests
```

---


## Consideraciones y decisiones de diseño

**Base de datos en memoria para tests**:

Para los tests se utilizó una base de datos SQLite en memoria. Esto asegura un entorno limpio y controlado en cada ejecución, evitando que las pruebas afecten datos reales o necesiten limpieza manual.


**Separación del servidor y la lógica de la API**:

Se Separó la configuración del servidor (server.js) y la definición de rutas y lógica de la API (taskApi.js) para facilitar el testing. Esto permite levantar la API sin iniciar el servidor HTTP, haciendo las pruebas más limpias.


**Estructura modular**:

La aplicación está organizada en módulos (taskApi.js, server.js, database.js, etc.) para facilitar mantenimiento, escalabilidad y posibles futuras mejoras.
