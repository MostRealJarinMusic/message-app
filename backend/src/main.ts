import { Server } from "./server/server";
import { config } from "./config";

const server = new Server();

(async () => {
  await server.init();
  server.start(config.port);
})();
