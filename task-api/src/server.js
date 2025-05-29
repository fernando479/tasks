/**
 * server.js
 *
 * Punto de entrada de la aplicación.
 * Arranca el servidor en el puerto definido en PORT o por defecto en 3000.
 */

const { server } = require("./tasksApi");
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
