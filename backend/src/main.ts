import { Server } from "./server/server";
import { config } from "./config";

const server = new Server();
server.start(config.port);
