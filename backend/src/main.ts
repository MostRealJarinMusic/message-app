import { Server } from "./server/server";
import { config } from "./config";

const server = new Server();
//server.start(config.port);
(async () => {
  await server.init();
  server.start(config.port);
})();
