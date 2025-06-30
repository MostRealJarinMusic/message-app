import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { WebSocketManager } from "./ws/websocket-manager";
import { registerRoutes } from "./routes/register-routes";
import { errorHandler } from "../middleware/error-handler";

export class Server {
  private app = express();
  private server = http.createServer(this.app);
  private wsManager = new WebSocketManager(this.server);

  constructor() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    registerRoutes(this.app, this.wsManager);
    this.app.use(errorHandler);
  }

  start(port: number) {
    this.server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  }
}
